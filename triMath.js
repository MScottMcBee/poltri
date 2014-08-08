
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
		
		results = r1.concat(r2);
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

	for (i = 0; i < points.length - 2; i++) {
		var vwTriangle = createVWTriangle(points[i],points[i+1],points[i+2])
		if(vwTriangle){
			referenceTriangles.push(vwTriangle);
		}
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