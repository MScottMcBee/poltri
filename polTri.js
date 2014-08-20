"use strict";
function PolTri(){}

PolTri.prototype.doesLineIntersect = function (a1,a2,b1,b2){
	var result;
	
	var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
	var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
	var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
	
	if ( u_b != 0 ) {
		var ua = ua_t / u_b;
		var ub = ub_t / u_b;
		
		if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
			result = true
		}
	}
	
	return result;
}

PolTri.prototype.dist = function (a,b){
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

PolTri.prototype.segmentDistToPoint = function (p, segA, segB){
	var p2 = {x: segB.x - segA.x, y: segB.y - segA.y};
	var u = ((p.x - segA.x) * p2.x + (p.y - segA.y) * p2.y) / (p2.x*p2.x + p2.y*p2.y);
	
	if (u > 1){
		u = 1;
	}else if (u < 0){
		u = 0;
	}

	var x = segA.x + u * p2.x;
	var y = segA.y + u * p2.y;
	
	var dx = x - p.x;
	var dy = y - p.y;
	
	var dist = Math.sqrt(dx*dx + dy*dy);
	
	return dist;
}

//douglasPeucker
PolTri.prototype.reduceByDistance = function (points,distance){
	var results = [];
	var r1;
	var r2;
	var largestDistance = 0;
	var pivotIndex = 0;
	var i;
	var d;

	for (var i = 1; i < points.length - 1; i++) {
		var d = this.segmentDistToPoint(points[i], points[0], points[points.length-1]) ;
		if ( d > largestDistance ) {
			pivotIndex = i;
			largestDistance = d;
		}
	}
	if ( largestDistance > distance ) {
		r1 = this.reduceByDistance(points.slice(0,pivotIndex+1), distance);
		r2 = this.reduceByDistance(points.slice(pivotIndex), distance);
		
		results = r1.concat(r2.slice(1));
	} else {
		results.push(points[0]);
		results.push(points[points.length-1]);
	}
	return results;
}

//visvalingamWhyatt
PolTri.prototype.reduceByPercentage = function (points,percentage){
	var referenceTriangles = [];
	var workingTriangles = [];
	var results = [];
	var i;
	var vwTriangle;

	vwTriangle = this.createVWTriangle(points[points.length-1],points[0],points[1]);
	if(vwTriangle){
		referenceTriangles.push(vwTriangle);
	}
	for (i = 0; i < points.length - 2; i++) {
		vwTriangle = this.createVWTriangle(points[i],points[i+1],points[i+2]);
		if(vwTriangle){
			referenceTriangles.push(vwTriangle);
		}
	}
	vwTriangle = this.createVWTriangle(points[points.length-2],points[points.length-1],points[0]);
	if(vwTriangle){
		referenceTriangles.push(vwTriangle);
	}


	var targetPointCount = referenceTriangles.length * percentage;
	if (targetPointCount < 3){
		targetPointCount = 3;
	}

	while (referenceTriangles.length > targetPointCount){
		workingTriangles = referenceTriangles.concat();
		workingTriangles.sort(function(a,b){ return b.distance - a.distance });
		var referenceIndex = referenceTriangles.indexOf(workingTriangles[workingTriangles.length-1]);
		workingTriangles = workingTriangles.splice(0,workingTriangles.length-1);
		referenceTriangles.splice(referenceIndex,1);
		
		if (referenceIndex == referenceTriangles.length){
			referenceIndex = 0;
		}
		var relRefInd1 = referenceIndex-2;
		var relRefInd2 = referenceIndex-1;
		if (relRefInd1 < 0){
			relRefInd1+=referenceTriangles.length;
		}
		if (relRefInd2 < 0){
			relRefInd2+=referenceTriangles.length;
		}
		referenceTriangles[relRefInd2] = this.createVWTriangle(referenceTriangles[relRefInd1].point,referenceTriangles[relRefInd2].point,referenceTriangles[referenceIndex].point);
		
		var relRefInd1 = referenceIndex-1;
		var relRefInd2 = referenceIndex+1;
		if (relRefInd1 < 0){
			relRefInd1+=referenceTriangles.length;
		}
		if (relRefInd2 >= referenceTriangles.length){
			relRefInd2-=referenceTriangles.length;
		}
		
		referenceTriangles[referenceIndex] = this.createVWTriangle(referenceTriangles[relRefInd1].point,referenceTriangles[referenceIndex].point,referenceTriangles[relRefInd2].point);
	}

	for (i = 0; i < referenceTriangles.length; i++) {
		results.push(referenceTriangles[i].point);
	}

	return results;
}

PolTri.prototype.createVWTriangle = function (p1,p2,p3){
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

PolTri.prototype.recursiveSplit = function (polygon,output){
	var divided = this.splitSimplePolygon(polygon);
	if (divided.length > 1){
		var polygonA = divided[0];
		var polygonB = divided[1];
		
		this.recursiveSplit(polygonA,output);
		this.recursiveSplit(polygonB,output);
		
	}else{
		output.push(polygon);
	}
}


PolTri.prototype.splitSimplePolygon = function (polygon){
	
	var scanningVerticies = polygon.slice();
	scanningVerticies.sort(function (a,b){
		return a.x-b.x;
	});
	
	for (var i = 1; i < scanningVerticies.length-1 ; i++){
		var index = polygon.indexOf(scanningVerticies[i]);
		var nextIndex = index+1;
		if (nextIndex>=polygon.length){
			nextIndex = 0;
		}
		var lastIndex = index-1;
		if (lastIndex<0){
			lastIndex = polygon.length-1;
		}
		
		var subdivide = false;
		var direction = 0;
		
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
		
		var xxIndex = i;
		while (subdivide){
			var doit = this.validEdge(polygon,scanningVerticies,i,xxIndex+direction);
			if (doit){
				return this.splitPolygon(polygon,scanningVerticies,i,xxIndex+direction);
			}else{
				xxIndex += direction;
				if (xxIndex < 0 || xxIndex >= scanningVerticies.length){
					subdivide = false;
				}
			}
		}
	}
	var results = [];
	results.push(polygon);
	return results;
}


// This determins if the "cut" in the polygon is valid. An example of an invalid cut would be on that is outside of the polygon, 
// or one where the two points are adjacent on the polygon.
PolTri.prototype.validEdge = function (polygon,sortedVerticies,baseIndex,checkingIndex){
	// If we're out of bounds, it's not valid
	if (checkingIndex >= sortedVerticies.length || checkingIndex < 0){
		return false;
	}
	
	var pointX = {x:sortedVerticies[baseIndex].x, y:sortedVerticies[baseIndex].y};
	var pointY = {x:sortedVerticies[checkingIndex].x, y:sortedVerticies[checkingIndex].y};

	//If the edge is the line segment that closes the polygon, it's not valid.
	if ((this.pointEquals(polygon[0],pointX) || this.pointEquals(polygon[polygon.length-1],pointX)) && (this.pointEquals(polygon[0],pointY) || this.pointEquals(polygon[polygon.length-1],pointY))){
		return false;
	}
	
	for (var k = 0; k < polygon.length; k++){
		var doIntersect = true;
		
		var nextK = (k+1) % polygon.length;


		if ((this.pointEquals(polygon[k], pointX) || this.pointEquals(polygon[nextK], pointX)) && (this.pointEquals(polygon[k], pointY) || this.pointEquals(polygon[nextK], pointY))){
			return false;
		}

		if (this.pointEquals(polygon[k], pointX) || this.pointEquals(polygon[nextK], pointX) || this.pointEquals(polygon[k], pointY) || this.pointEquals(polygon[nextK], pointY)){
			doIntersect = false;
		}
		if (doIntersect && this.doesLineIntersect(polygon[k],polygon[nextK],pointX,pointY)){
			return false;
		}
	}
	
	var origin = {x:0,y:0};
	var testPoint = {};
	var count;
	count = 0;
	for (var h = 0; h < polygon.length ; h++){
		var offset = h+1;
		if (offset >=  polygon.length){
			offset=0;
		}
		
		testPoint.x = pointX.x+((pointY.x-pointX.x)/2);
		testPoint.y = pointX.y+((pointY.y-pointX.y)/2);
		if (this.doesLineIntersect(polygon[h],polygon[offset],origin,testPoint)){
			count++;
		}
	}
	
	if (count%2==0){
		return false;
	}
	
	return true;
}

PolTri.prototype.pointEquals = function (a,b){
	return a.x == b.x && a.y == b.y;
}

PolTri.prototype.splitPolygon = function (polygon,sortedVerticies,indexA,indexB){
	var results = [];
	var splittingIndex;

	splittingIndex = polygon.indexOf(sortedVerticies[indexA]);
	var pointBB = polygon.indexOf(sortedVerticies[indexB]);
	
	var polygonA = [];
	polygonA.push(polygon[splittingIndex]);
	while (splittingIndex!=pointBB){
		splittingIndex += 1;
		if (splittingIndex > polygon.length-1){
			splittingIndex = 0;
		}
		polygonA.push(polygon[splittingIndex]);
	}
	
	var polygonB = [];
	
	splittingIndex = polygon.indexOf(sortedVerticies[indexA]);
	polygonB.push(polygon[splittingIndex]);
	while (splittingIndex!=pointBB){
		splittingIndex -= 1;
		if (splittingIndex < 0){
			splittingIndex = polygon.length-1;
		}
		polygonB.push(polygon[splittingIndex]);
	}
	
	if (polygonA.length){
		results.push(polygonA);
	}
	
	if (polygonB.length){
		results.push(polygonB);
	}
	
	return results;
	
}

PolTri.prototype.triangulateMonotonePolygon = function (polygon,triangles){
	var track1 = [];
	var track2 = [];
	var scanningVerticies = polygon.slice();
	var midPointIndex = (polygon.length/2) | 0;
	var i, j;
	var stack;

	if (polygon.length == 3){
		triangles.push(polygon);
		return;
	}
		
	scanningVerticies.sort(function (A,B){
		return A.x-B.x;
	});
	
	
	for (i = 0; i != midPointIndex; i++){
		track1.push(polygon[i]);
	}
	for (i = polygon.length-1; i != midPointIndex; i--){
		track2.push(polygon[i]);
	}
	track2.push(polygon[midPointIndex]);
	
	stack = [];
	stack.push(scanningVerticies[0],scanningVerticies[1]);


	for (i = 2; i<scanningVerticies.length; i++){
		var sameTrack = false;
		if (track1.indexOf(scanningVerticies[i]) > -1){
			if (track1.indexOf(stack[stack.length-1]) > -1){
				sameTrack = true;
			}
		}else{
			if (track2.indexOf(stack[stack.length-1]) > -1){
				sameTrack = true;
			}
		}
		
		if (i == scanningVerticies.length-1){
			sameTrack = false;
		}
		
		
		if (sameTrack){	
			for (j = i+1; j<scanningVerticies.length; j++){
				if (this.validEdge(polygon,scanningVerticies,i,j)){
					var results = this.splitPolygon(polygon,scanningVerticies,i,j);
					this.recurse(results,triangles);
					
					return;
				}
			}
			stack.push(scanningVerticies[i]);
		}else{
			for (j =0; j<stack.length; j++){
				var tirIndex = scanningVerticies.indexOf(stack[j]);
				if (this.validEdge(polygon,scanningVerticies,i,tirIndex)){
					stack.slice(j,1);
					var results = this.splitPolygon(polygon,scanningVerticies,i,tirIndex);
					this.recurse(results,triangles);
					return;
				}
				
			}
			stack.push(scanningVerticies[i])
		}
	}
	for (i = 1; i < scanningVerticies.length; i++){
		if (this.validEdge(polygon,scanningVerticies,0,i)){
			var results = this.splitPolygon(polygon,scanningVerticies,0,i);
			this.recurse(results,triangles);

			return;
		}
	}
	
	for (i = 0; i < scanningVerticies.length-1; i++){
		if (this.validEdge(polygon,scanningVerticies,scanningVerticies.length-1,i)){
			var results = this.splitPolygon(polygon,scanningVerticies,scanningVerticies.length-1,i);
			this.recurse(results,triangles);
			
			return;
		}
	}


}

PolTri.prototype.recurse = function (results,triangles){
	if (results.length>0){
		if (results[0].length==3){
			triangles.push(results[0])
		}else{
			this.triangulateMonotonePolygon(results[0],triangles);
		}
	}
	if (results.length>1){
		if (results[1].length==3){
			triangles.push(results[1])
		}else{
			this.triangulateMonotonePolygon(results[1],triangles);
		}
	}
}