
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
	var referencePairs = [];
	var workingPairs = [];
	var results = [];
	for (var i = 0; i < points.length - 2; i++) {


		var vwPair = uuuuuuu(points[i],points[i+1],points[i+2])
		if(vwPair){
			referencePairs.push(vwPair);
		}
	}
	
	function uuuuuuu(a,b,c){
		var base = dist(a,c);
		var height = segmentDistToPoint(b,a,c);
		var temp = {}
		var d = base*height/2;
		
		if (d != NaN){
			temp.distance = d;
			temp.point = b;
			temp.order = i+1;
			return temp;
		}
		console.log("!!!!!!!")
		console.log(a.x+" "+a.y)
		console.log(b.x+" "+b.y)
		console.log(c.x+" "+c.y)
		console.log("AAA "+d+" "+base+" "+height+" "+a+" "+b+" "+c);
		return null;
	}
	
	var target = referencePairs.length * percentage;
	if (target < 4){
		target = 4;
	}
	//console.log(referencePairs.length * percentage + " " + referencePairs.length +" "+ percentage);
	while (referencePairs.length > target){
		workingPairs = referencePairs.concat();
		workingPairs.sort(function(a,b){ return b.distance - a.distance });
		var referenceIndex = referencePairs.indexOf(workingPairs[workingPairs.length-1]);
		workingPairs = workingPairs.splice(0,workingPairs.length-1);
		referencePairs.splice(referenceIndex,1);
		
		if (referenceIndex == referencePairs.length){
			referenceIndex = 0;
		}
		var relRefInd1 = referenceIndex-2;
		var relRefInd2 = referenceIndex-1;
		if (relRefInd1 < 0){
			relRefInd1+=referencePairs.length;
		}
		if (relRefInd2 < 0){
			relRefInd2+=referencePairs.length;
		}
		referencePairs[relRefInd2] = uuuuuuu(referencePairs[relRefInd1].point,referencePairs[relRefInd2].point,referencePairs[referenceIndex].point);
		
		var relRefInd1 = referenceIndex-1;
		var relRefInd2 = referenceIndex+1;
		if (relRefInd1 < 0){
			relRefInd1+=referencePairs.length;
		}
		if (relRefInd2 >= referencePairs.length){
			relRefInd2-=referencePairs.length;
		}
		
		referencePairs[referenceIndex] = uuuuuuu(referencePairs[relRefInd1].point,referencePairs[referenceIndex].point,referencePairs[relRefInd2].point);
	}
	for (i = 0; i < referencePairs.length; i++) {
		sfp = referencePairs[i]
		results.push(sfp.point);
	}
	return results;
}