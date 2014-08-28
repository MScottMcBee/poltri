"use strict";
function PolTri(){}

PolTri.prototype.triangulate = function (polygon){
			var monotonePolygons = [];
			var triangles = [];
			var i;

			this.recursiveSplit(polygon,monotonePolygons);			
			for (i = 0; i < monotonePolygons.length; i++){			
				this.triangulateMonotonePolygon(monotonePolygons[i], triangles);
			}

			return triangles;
}

PolTri.prototype.recursiveSplit = function (polygon, output){
	var divided;

	divided = this.splitSimplePolygon(polygon);
	if (divided.length > 1){
		
		this.recursiveSplit(divided[0], output);
		this.recursiveSplit(divided[1], output);		
	}else{
		output.push(polygon);
	}
}

PolTri.prototype.splitSimplePolygon = function (polygon){
	var i;
	var scanningVerticies;
	var index, nextIndex, lastIndex;
	var subdivide;
	var direction;
	var xxIndex;
	var isValid;
	var results;

	scanningVerticies = polygon.slice();
	scanningVerticies.sort(function (a, b){
		return a.x - b.x;
	});
	
	for (i = 1; i < scanningVerticies.length - 1 ; i++){
		index = polygon.indexOf(scanningVerticies[i]);
		nextIndex = index + 1;
		if (nextIndex >= polygon.length){
			nextIndex = 0;
		}
		lastIndex = index - 1;
		if (lastIndex < 0){
			lastIndex = polygon.length - 1;
		}
		
		subdivide = false;
		direction = 0;
		
		if (polygon[lastIndex].x > polygon[index].x){
			if (polygon[nextIndex].x >= polygon[index].x){
				subdivide = true;
				direction = -1;
			}
		}else if (polygon[lastIndex].x < polygon[index].x){
			if (polygon[nextIndex].x <= polygon[index].x){
				subdivide = true;
				direction = 1;
			}
		}
		
		xxIndex = i;
		while (subdivide){
			isValid = this.validEdge(polygon, scanningVerticies, i, xxIndex + direction);
			if (isValid){
				return this.splitPolygon(polygon, scanningVerticies, i, xxIndex + direction);
			}else{
				xxIndex += direction;
				if (xxIndex < 0 || xxIndex >= scanningVerticies.length){
					subdivide = false;
				}
			}
		}
	}
	results = [];
	results.push(polygon);
	return results;
}


// This determins if the "cut" in the polygon is valid. An example of an invalid cut would be on that is outside of the polygon, 
// or one where the two points are adjacent on the polygon.
PolTri.prototype.validEdge = function (polygon, sortedVerticies, baseIndex, checkingIndex){
	var pointA, pointB;
	var i;
	var nextIndex;
	var doIntersect;
	var originA, originB;
	var testPoint;
	var countA, countB;
	var offset;

	// If we're out of bounds, it's not valid
	if (checkingIndex >= sortedVerticies.length || checkingIndex < 0){
		return false;
	}
	
	pointA = sortedVerticies[baseIndex];
	pointB = sortedVerticies[checkingIndex];

	//If the edge is the line segment that closes the polygon, it's not valid.
	if ((this.pointEquals(polygon[0], pointA) || this.pointEquals(polygon[polygon.length - 1], pointA)) &&
		(this.pointEquals(polygon[0], pointB) || this.pointEquals(polygon[polygon.length - 1], pointB))){
		return false;
	}
	
	for (i = 0; i < polygon.length; i++){
		doIntersect = true;
		
		nextIndex = (i + 1) % polygon.length;


		if ((this.pointEquals(polygon[i], pointA) || this.pointEquals(polygon[nextIndex], pointA)) && (this.pointEquals(polygon[i], pointB) || this.pointEquals(polygon[nextIndex], pointB))){
			return false;
		}

		if (this.pointEquals(polygon[i], pointA) || this.pointEquals(polygon[nextIndex], pointA) || this.pointEquals(polygon[i], pointB) || this.pointEquals(polygon[nextIndex], pointB)){
			doIntersect = false;
		}
		if (doIntersect && this.doesLineIntersect(polygon[i], polygon[nextIndex], pointA, pointB)){
			return false;
		}
	}
	
	
	testPoint = {};
	testPoint.x = pointA.x + ((pointB.x - pointA.x) / 2);
	testPoint.y = pointA.y + ((pointB.y - pointA.y) / 2);

	originA = {x: -10, y: -10};
	originB = {x: testPoint.x, y: 0};

	countA = 0;
	countB = 0;
	for (i = 0; i < polygon.length ; i++){
		offset = i + 1;
		if (offset >=  polygon.length){
			offset = 0;
		}
		

		if (this.doesLineIntersect(polygon[i], polygon[offset], originA, testPoint)){
			countA++;
		}
		if (this.doesLineIntersect(polygon[i], polygon[offset], originB, testPoint)){
			countB++;
		}
	}
	
	if (countA % 2 == 0 ){
		return false;
	}
	
	return true;
}

PolTri.prototype.splitPolygon = function (polygon, sortedVerticies, indexA, indexB){
	var results;
	var splittingIndex;
	var pointBB;
	var polygonA, polygonB;

	splittingIndex = polygon.indexOf(sortedVerticies[indexA]);
	pointBB = polygon.indexOf(sortedVerticies[indexB]);
	
	polygonA = [];
	polygonA.push(polygon[splittingIndex]);
	while (splittingIndex!=pointBB){
		splittingIndex += 1;
		if (splittingIndex > polygon.length-1){
			splittingIndex = 0;
		}
		polygonA.push(polygon[splittingIndex]);
	}

	splittingIndex = polygon.indexOf(sortedVerticies[indexA]);

	polygonB = [];
	polygonB.push(polygon[splittingIndex]);
	while (splittingIndex != pointBB){
		splittingIndex -= 1;
		if (splittingIndex < 0){
			splittingIndex = polygon.length - 1;
		}
		polygonB.push(polygon[splittingIndex]);
	}
	
	results = [];
	if (polygonA.length > 0){
		results.push(polygonA);
	}
	
	if (polygonB.length > 0){
		results.push(polygonB);
	}
	
	return results;
}

PolTri.prototype.triangulateMonotonePolygon = function (polygon, triangles){
	var track1;
	var track2;
	var scanningVerticies;
	var midPointIndex;
	var i, j;
	var stack;
	var sameTrack;
	var tirIndex
	var results;

	if (polygon.length == 3){
		triangles.push(polygon);
		return;
	}

	scanningVerticies = polygon.slice();
	scanningVerticies.sort(function (A, B){
		return A.x - B.x;
	});
	
	midPointIndex = (polygon.length / 2) | 0;

	track1 = [];
	track2 = [];

	for (i = 0; i != midPointIndex; i++){
		track1.push(polygon[i]);
	}
	for (i = polygon.length - 1; i != midPointIndex; i--){
		track2.push(polygon[i]);
	}
	track2.push(polygon[midPointIndex]);
	
	stack = [];
	stack.push(scanningVerticies[0], scanningVerticies[1]);


	for (i = 2; i < scanningVerticies.length; i++){
		sameTrack = false;
		if (track1.indexOf(scanningVerticies[i]) > -1){
			if (track1.indexOf(stack[stack.length - 1]) > -1){
				sameTrack = true;
			}
		}else{
			if (track2.indexOf(stack[stack.length - 1]) > -1){
				sameTrack = true;
			}
		}
		
		if (sameTrack){	
			for (j = i + 1; j < scanningVerticies.length; j++){
				if (this.validEdge(polygon, scanningVerticies, i, j)){
					results = this.splitPolygon(polygon, scanningVerticies, i, j);
					this.recurse(results, triangles);
					
					return;
				}
			}
			stack.push(scanningVerticies[i]);
		}else{
			for (j = 0; j < stack.length; j++){
				tirIndex = scanningVerticies.indexOf(stack[j]);
				if (this.validEdge(polygon, scanningVerticies, i, tirIndex)){
					stack.slice(j, 1);
					results = this.splitPolygon(polygon, scanningVerticies, i, tirIndex);
					this.recurse(results ,triangles);

					return;
				}
				
			}
			stack.push(scanningVerticies[i]);
		}
	}
	for (i = 1; i < scanningVerticies.length; i++){
		if (this.validEdge(polygon, scanningVerticies, 0, i)){
			results = this.splitPolygon(polygon, scanningVerticies, 0, i);
			this.recurse(results, triangles);

			return;
		}
	}
	
	for (i = 0; i < scanningVerticies.length - 1; i++){
		if (this.validEdge(polygon, scanningVerticies, scanningVerticies.length - 1, i)){
			results = this.splitPolygon(polygon, scanningVerticies, scanningVerticies.length - 1, i);
			this.recurse(results, triangles);
			
			return;
		}
	}

}

PolTri.prototype.recurse = function (results, triangles){
	if (results.length > 0){
		if (results[0].length == 3){
			triangles.push(results[0]);
		}else{
			this.triangulateMonotonePolygon(results[0], triangles);
		}
	}

	if (results.length > 1){
		if (results[1].length == 3){
			triangles.push(results[1]);
		}else{
			this.triangulateMonotonePolygon(results[1], triangles);
		}
	}
}



PolTri.prototype.doesLineIntersect = function (a1, a2, b1, b2){
	var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
	var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
	var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
	
	if ( u_b != 0 ) {
		var ua = ua_t / u_b;
		var ub = ub_t / u_b;
		
		if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
			return true;
		}
	}
	
	return false;
}

PolTri.prototype.dist = function (a, b){
	return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}


PolTri.prototype.segmentDistToPoint = function (p, segA, segB){
	var p2;
	var u;
	var x;
	var y;
	var dx;
	var dy;
	var dist;

	p2 = {x: segB.x - segA.x, y: segB.y - segA.y};
	u = ((p.x - segA.x) * p2.x + (p.y - segA.y) * p2.y) / (p2.x * p2.x + p2.y * p2.y);
	
	if (u > 1){
		u = 1;
	}else if (u < 0){
		u = 0;
	}

	x = segA.x + u * p2.x;
	y = segA.y + u * p2.y;
	
	dx = x - p.x;
	dy = y - p.y;
	
	dist = Math.sqrt(dx*dx + dy*dy);
	
	return dist;
}

PolTri.prototype.pointEquals = function (a, b){
	return a.x == b.x && a.y == b.y;
}



//douglasPeucker
PolTri.prototype.reduceByDistance = function (points, distance){
	var results = [];
	var r1;
	var r2;
	var largestDistance = 0;
	var pivotIndex = 0;
	var i;
	var segmentDistance;

	for (i = 1; i < points.length - 1; i++) {
		segmentDistance = this.segmentDistToPoint(points[i], points[0], points[points.length - 1]) ;
		if ( segmentDistance > largestDistance ) {
			pivotIndex = i;
			largestDistance = segmentDistance;
		}
	}
	if ( largestDistance > distance ) {
		r1 = this.reduceByDistance(points.slice(0, pivotIndex + 1), distance);
		r2 = this.reduceByDistance(points.slice(pivotIndex), distance);
		
		results = r1.concat(r2.slice(1));
	} else {
		results.push(points[0]);
		results.push(points[points.length - 1]);
	}
	return results;
}

//visvalingamWhyatt
PolTri.prototype.reduceByPercentage = function (points, percentage){
	var referenceTriangles = [];
	var workingTriangles = [];
	var results = [];
	var i;
	var vwTriangle;
	var targetPointCount;
	var referenceIndex;
	var relRefInd1, relRefInd2;
	var sortFunction = function(a,b){ return b.distance - a.distance };


	vwTriangle = this.createVWTriangle(points[points.length - 1], points[0], points[1]);
	if(vwTriangle){
		referenceTriangles.push(vwTriangle);
	}
	for (i = 0; i < points.length - 2; i++) {
		vwTriangle = this.createVWTriangle(points[i], points[i + 1], points[i + 2]);
		if(vwTriangle){
			referenceTriangles.push(vwTriangle);
		}
	}
	vwTriangle = this.createVWTriangle(points[points.length - 2], points[points.length - 1], points[0]);
	if(vwTriangle){
		referenceTriangles.push(vwTriangle);
	}


	targetPointCount = referenceTriangles.length * percentage;
	if (targetPointCount < 3){
		targetPointCount = 3;
	}

	while (referenceTriangles.length > targetPointCount){
		workingTriangles = referenceTriangles.concat();
		workingTriangles.sort(sortFunction);
		referenceIndex = referenceTriangles.indexOf(workingTriangles[workingTriangles.length - 1]);
		workingTriangles = workingTriangles.splice(0, workingTriangles.length - 1);
		referenceTriangles.splice(referenceIndex, 1);
		
		if (referenceIndex == referenceTriangles.length){
			referenceIndex = 0;
		}
		relRefInd1 = referenceIndex - 2;
		relRefInd2 = referenceIndex - 1;
		if (relRefInd1 < 0){
			relRefInd1 += referenceTriangles.length;
		}
		if (relRefInd2 < 0){
			relRefInd2 += referenceTriangles.length;
		}
		referenceTriangles[relRefInd2] = this.createVWTriangle(referenceTriangles[relRefInd1].point, referenceTriangles[relRefInd2].point, referenceTriangles[referenceIndex].point);
		
		relRefInd1 = referenceIndex - 1;
		relRefInd2 = referenceIndex + 1;
		if (relRefInd1 < 0){
			relRefInd1 += referenceTriangles.length;
		}
		if (relRefInd2 >= referenceTriangles.length){
			relRefInd2-=referenceTriangles.length;
		}
		
		referenceTriangles[referenceIndex] = this.createVWTriangle(referenceTriangles[relRefInd1].point, referenceTriangles[referenceIndex].point, referenceTriangles[relRefInd2].point);
	}

	for (i = 0; i < referenceTriangles.length; i++) {
		results.push(referenceTriangles[i].point);
	}

	return results;
}

PolTri.prototype.createVWTriangle = function (p1, p2, p3){
		var base = this.dist(p1,p3);
		var height = this.segmentDistToPoint(p2,p1,p3);
		var newVWTriangle = {};
		var area = base*height/2;
		
		if (area != NaN){
			newVWTriangle.distance = area;
			newVWTriangle.point = p2;
			newVWTriangle.order = i+1;
			return newVWTriangle;
		}
		console.log("Bad VWTriangle!");
		return null;
	}
