
function Point(x,y){
	this.x = x;
	this.y = y;
}

Point.prototype.x = 0;
Point.prototype.y = 0;


function doesLineIntersect(a1,a2,b1,b2){
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

function dist(a,b){
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

function segmentDistToPoint(p, segA, segB){
	var p2 = new Point(segB.x - segA.x, segB.y - segA.y);
	var something = p2.x*p2.x + p2.y*p2.y;
	var u = ((p.x - segA.x) * p2.x + (p.y - segA.y) * p2.y) / something;
	
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

function douglasPeucker(points,epsilon){
	var results = [];
	var r1;
	var r2;
	var largestDistance = 0;
	var pivotIndex = 0;
	for (var i = 1; i < points.length - 1; i++) {
		var d = segmentDistToPoint(points[i], points[0], points[points.length-1]) ;
		if ( d > largestDistance ) {
			pivotIndex = i;
			largestDistance = d;
		}
	}
	if ( largestDistance > epsilon ) {
		r1 = douglasPeucker(points.slice(0,pivotIndex+1), epsilon);
		r2 = douglasPeucker(points.slice(pivotIndex), epsilon);
		
		results = r1.concat(r2.slice(1));
	} else {
		results.push(points[0]);
		results.push(points[points.length-1]);
	}
	return results;
}

function visvalingamWhyatt(points,percentage){
	var referenceTriangles = [];
	var workingTriangles = [];
	var results = [];
	var i;
	var vwTriangle;

	vwTriangle = createVWTriangle(points[points.length-1],points[0],points[1]);
	if(vwTriangle){
		referenceTriangles.push(vwTriangle);
	}
	for (i = 0; i < points.length - 2; i++) {
		vwTriangle = createVWTriangle(points[i],points[i+1],points[i+2]);
		if(vwTriangle){
			referenceTriangles.push(vwTriangle);
		}
	}
	vwTriangle = createVWTriangle(points[points.length-2],points[points.length-1],points[0]);
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
		referenceTriangles[relRefInd2] = createVWTriangle(referenceTriangles[relRefInd1].point,referenceTriangles[relRefInd2].point,referenceTriangles[referenceIndex].point);
		
		var relRefInd1 = referenceIndex-1;
		var relRefInd2 = referenceIndex+1;
		if (relRefInd1 < 0){
			relRefInd1+=referenceTriangles.length;
		}
		if (relRefInd2 >= referenceTriangles.length){
			relRefInd2-=referenceTriangles.length;
		}
		
		referenceTriangles[referenceIndex] = createVWTriangle(referenceTriangles[relRefInd1].point,referenceTriangles[referenceIndex].point,referenceTriangles[relRefInd2].point);
	}

	for (i = 0; i < referenceTriangles.length; i++) {
		results.push(referenceTriangles[i].point);
	}

	return results;


	function createVWTriangle(p1,p2,p3){
		var base = dist(p1,p3);
		var height = segmentDistToPoint(p2,p1,p3);
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

}

function recursiveSplit(polygon,output){
	var divided = splitSimplePolygon(polygon);
	if (divided.length > 1){
		var polygonA = divided[0];
		var polygonB = divided[1];
		
		recursiveSplit(polygonA,output);
		recursiveSplit(polygonB,output);
		
	}else{
		output.push(polygon);
	}
}


function splitSimplePolygon(polygon){
	
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
			if (polygon[nextIndex].x> polygon[index].x){
				subdivide = true;
				direction = -1;
			}
		}else if (polygon[lastIndex].x < polygon[index].x){
			if (polygon[nextIndex].x < polygon[index].x){
				subdivide = true;
				direction = 1;
			}
		}
		
		var xxIndex = i;
		while (subdivide){
			var doit = validEdge(polygon,scanningVerticies,i,xxIndex+direction);
			if (doit){
				return splitPolygon(polygon,scanningVerticies,i,xxIndex+direction);
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
function validEdge(polygon,sortedVerticies,baseIndex,checkingIndex){
	// If we're out of bounds, it's not valid
	if (checkingIndex >= sortedVerticies.length || checkingIndex < 0){
		return false;
	}
	
	var pointX = {x:sortedVerticies[baseIndex].x, y:sortedVerticies[baseIndex].y};
	var pointY = {x:sortedVerticies[checkingIndex].x, y:sortedVerticies[checkingIndex].y};

	//If the edge is the line segment that closes the polygon, it's not valid.
	if ((pointEquals(polygon[0],pointX) || pointEquals(polygon[polygon.length-1],pointX)) && (pointEquals(polygon[0],pointY) || pointEquals(polygon[polygon.length-1],pointY))){
		return false;
	}
	
	for (var k = 0; k < polygon.length-1; k++){
		var doIntersect = true;
		
		if ((pointEquals(polygon[k], pointX) || pointEquals(polygon[k+1], pointX)) && (pointEquals(polygon[k], pointY) || pointEquals(polygon[k+1], pointY))){
			return false;
		}

		if (pointEquals(polygon[k], pointX) || pointEquals(polygon[k+1], pointX) || pointEquals(polygon[k], pointY) || pointEquals(polygon[k+1], pointY)){
			doIntersect = false;
		}
		if (doIntersect && doesLineIntersect(polygon[k],polygon[k+1],pointX,pointY)){
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
		if (doesLineIntersect(polygon[h],polygon[offset],origin,testPoint)){
			count++;
		}
	}
	
	if (count%2==0){
		return false;
	}
	if (checkingIndex >= sortedVerticies.length-1){
		return false;
	}
	if (checkingIndex < 0){
		return false;
	}
	return true;
}

function pointEquals(a,b){
	return a.x == b.x && a.y == b.y;
}

function splitPolygon(polygon,sortedVerticies,indexA,indexB){
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

function triangulateMonotonePolygon(polygon,triangles){
	if (polygon.length == 3){
		triangles.push(polygon);
		return;
	}
	
	var track1 = [];
	var track2 = [];
	
	var scanningVerticies = polygon.slice();
	scanningVerticies.sort(function (A,B){
		return A.x-B.x;
	});
	
	var midPointIndex = (polygon.length/2) | 0;
	
	for (var i = 0; i != midPointIndex; i++){
		track1.push(polygon[i]);
	}
	for (var i = polygon.length-1; i != midPointIndex; i--){
		track2.push(polygon[i]);
	}
	track2.push(polygon[midPointIndex]);
	
	var stack = [];
	stack.push(scanningVerticies[0],scanningVerticies[1]);
	var lastDivide = [];
	for (var i = 2; i<scanningVerticies.length; i++){
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
			var lastDivide;
			for (var j = i+1; j<scanningVerticies.length; j++){
				if (validEdge(polygon,scanningVerticies,i,j)){
					var results = splitPolygon(polygon,scanningVerticies,i,j);
					recurse(results);
					
					return;
				}else{
					break;
				}
			}
			stack.push(scanningVerticies[i]);
		}else{
			var vTop = stack[stack.length-1];
			for (var j =0; j<stack.length; j++){
				var tirIndex = scanningVerticies.indexOf(stack[j]);
				if (validEdge(polygon,scanningVerticies,i,tirIndex)){
					stack.slice(j,1);
					var results = splitPolygon(polygon,scanningVerticies,i,tirIndex);
					recurse(results);

					return;
				}
				
			}
			stack.push(vTop);
			stack.push(scanningVerticies[i])
		}
	}
	console.log("?")
	for (i = 1; i < scanningVerticies.length; i++){
		if (validEdge(polygon,scanningVerticies,0,i)){
			stack.slice(j,1);
			var results = splitPolygon(polygon,scanningVerticies,0,i);
			recurse(results);

			return;
		}
	}
	
	
	for (i = 0; i < scanningVerticies.length-1; i++){
		if (validEdge(polygon,scanningVerticies,scanningVerticies.length-1,i)){
			stack.slice(j,1);
			var results = splitPolygon(polygon,scanningVerticies,scanningVerticies.length-1,i);
			recurse(results);
			
			return;
		}
	}

	function recurse(results){
		if (results.length>0){
			if (results[0].length==3){
				triangles.push(results[0])
			}else{
				triangulateMonotonePolygon(results[0],triangles);
			}
		}
		if (results.length>1){
			if (results[1].length==3){
				triangles.push(results[1])
			}else{
				triangulateMonotonePolygon(results[1],triangles);
			}
		}
	}
}

