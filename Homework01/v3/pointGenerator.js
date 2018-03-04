/**
 * Used for point generation
 *
 * @class pointGenerator
 */
var pointGenerator = {

	loopCounter: 0,
	loopLimit: 100000,

	/**
	* Creates true line.
	* Does not return a value, instead fills object values.
	* Currently
	*   picks random direction, makes line
	*   Line always goes through origin
	*
	* @method makeTrueLine
	* @param tl {Object} Trueline object, contains a,b,c. As in: Ax + By + C = 0
	*/
	makeTrueLine: function(tl) {
		// Get degree 0(include) upto 360(exclude).
		// Whole degrees, decimals removed.
		var d;
		// Use r100 circle for value generation
		var r = 100;
		var px, py;
		this.loopCounter = 0;
		do {
			this.loopLimitCheck("make true line failed:" + px + ", " + py  + "," + d);
			d = Math.floor(Math.random() * 360);
			// d = parseInt(Math.random() * 360);
			px = r * Math.cos(this.toRadians(d));
			py = r * Math.sin(this.toRadians(d));
		} while (px === 0 || py === 0);
		// No 0's to avoid / 0 and instant success.

		// ax + by + c = 0
		// slope = y / x
		tl.a = -1 * py;
		tl.b = px;


		// if true line needs a distance
		tl.c = 0;
		if (settings.tldfo !== 0) {
			// use same reasoning as margin offset
			// see that section for why
			var hypot = (settings.tldfo / 2) /  (Math.sin(this.toRadians(d)));
			tl.c = hypot * tl.a * -1;
		}

		tl.degree = d;
		tl.yIntercept = -1 * tl.c / tl.b;
		chartMaker.makeLinesOfTrueAndMargin(tl);
	},

	/**
	* Creates marginLines "around" true line
	*
	* @method makeMarginLines
	* @param s {Object} Settings object. Containing the following:
	* @param s.m {Float}
	* @param s.trueLine {Object} True line object contains a,b,c. As in: Ax + By + C = 0
	* @param s.marginLines {Array} Two objects in array contains a,b,c. As in: Ax + By + C = 0
	*/
	makeMarginLines: function(s) {
		var tl = s.trueLine;
		var ml = s.marginLines;

		// Margin lines are parallel to true line, they have same slope
		// s.m is distance between margin lines and true line
		// s.m is the b in aa + bb = cc
		// same slope means same degree, just a matter of which side of the triangle

		// for the "left" one
		// y = R sin(rad)
		// R = y / (sin(rad)) = c in cc = aa + bb
		var hypot = (s.m / 2) /  (Math.sin(this.toRadians(tl.degree)));

		// with this hypot get x intercept for both margin lines
		// Parallel lines, slope is known. just need to calculate for C
		// xintercept = -C / A   =>    C = xintercept * A * -1

		ml[0].a = tl.a;
		ml[0].b = tl.b;
		ml[0].c = hypot * tl.a * -1 - (tl.b * tl.yIntercept);
		ml[1].a = tl.a;
		ml[1].b = tl.b;
		ml[1].c = hypot * tl.a - (tl.b * tl.yIntercept);

		chartMaker.makeLinesOfTrueAndMargin(tl, ml[0], ml[1]);
	},


	/**
	* Creates points based off of the settings.
	*
	* @method makeGivenSettings
	* @param s {Object} Depends on the following values
	* @param s.n {Number} How many points to make
	* @param s.r {Number} Maximum distance allowed from origin
	* @param s.m {Number} Margin size
	*
	* @return {Array} Array of array of points.
	*                 Ex: [[1, x1, y1, label][1, x2, y2, label]]
	*/
	makeGivenSettings: function(s) {
		var points = {};
		points.all = [];
		points.radiusCase = null;
		points.onMarginCase = [];
		var tempPoint;
		
		// First is the special cases
		// Put at least one point on the circle radius
		points.radiusCase = this.getPointOnRadiusOutsideMargin(s, points);
		points.all.push(points.radiusCase);
		// chartMaker.makeLineOfCurrentWeight({a:0,b:0,c:0}, points.all);
		// throw "der";
		log("...generated point on radius...");
		// Get two points on margin 1
		points.onMarginCase = this.getTwoPointsOnMargin(s, 0);
		log("...generated two points on margin line 1...");
		// Get two points on margin 2
		tempPoint = this.getTwoPointsOnMargin(s, 1);
		log("...generated two points on margin line 2...");
		points.onMarginCase = points.onMarginCase.concat(tempPoint);
		points.all = points.all.concat(points.onMarginCase);

		// Should now have a minimum of 5 points. on radius, two per margin line
		log("...generating all other points...");
		this.generateAllOtherPoints(s, points);

		return points;
	},

	/**
	* Create point on the circle radius outside of the margin.
	*
	* @method getPointOnRadiusOutsideMargin
	* @param s {Object} settings
	* @param points {Object} contains all points
	*				instead of returning a value, add directly to points object
	*/
	getPointOnRadiusOutsideMargin: function(s) {
		var pointOnRadius = false;
		var tempPoint;
		this.loopCounter = 0;
		while (!pointOnRadius) {
			this.loopLimitCheck("Radius point on margin:" + tempPoint);
			tempPoint = this.generatePointOnCircleRadius(s.r);
			var marginLocation = this.isPointOutsideMargins(tempPoint, s.marginLines);
			if (marginLocation !== 0) {
				pointOnRadius = true;
				tempPoint.push(this.getLabelOfPointGivenTrueLine(tempPoint, s.trueLine));
			}
		}
		return tempPoint;
	},

	/**
	* Create point on the circle radius
	*
	* @method generatePointOnCircleRadius
	* @param r {Float} Radius of circle
	* @return {Array} [1, x, y]
	*/
	generatePointOnCircleRadius: function(r) {
		// Generate random degree
		var d = Math.floor(Math.random() * 360);
		// Get location
		px = r * Math.cos(this.toRadians(d));
		py = r * Math.sin(this.toRadians(d));
		return [1, px, py];
	},

	/**
	* Gets label of point given true line
	*
	* @method getLabelOfPointGivenTrueLine
	* @param point {Array} point values [1, x, y]
	* @param tl {Object} true line values {a,b,c}
	* @return {Integer} 1 is above 0 otherwise
	*/
	getLabelOfPointGivenTrueLine: function(point, tl) {
		var dotProduct = point[1] * tl.a + point[2] * tl.b + tl.c;
		return this.getSign(dotProduct);
	},


	/**
	* Is point outside the margins? True if both have same eval
	*
	* @method isPointOutsideMargins
	* @param p {Array} [1, x, y, label]
	* @return {Integer} 1 is above both, 0 between, -1 below both.
	*/
	isPointOutsideMargins: function (p, m) {
		var dotProd1 = (p[1] * m[0].a) + (p[2] * m[0].b) + m[0].c;
		var dotProd2 = (p[1] * m[1].a) + (p[2] * m[1].b) + m[1].c;

		var total = this.getSign(dotProd1) + this.getSign(dotProd2);
		return (total === 0) ? 0 : this.getSign(total);
	},

	/**
	* Get two points on the margin
	*
	* @method getTwoPointsOnMargin
	* @param s {Object} settings
	* @param marginLineIndex {Integer} 0 or 1, specifying which margin to use
	* @return {Array} contining both points
	*/
	getTwoPointsOnMargin: function(s, marginLineIndex) {
		var ml = s.marginLines[marginLineIndex];
		var mpd = s.marginPointDistance;
		var hasBothPoints = false;
		var tp1, tp2, tx, ty, slope, a, b;

		this.loopCounter = 0;
		while (!hasBothPoints) {
			this.loopLimitCheck("Two points on margin" + [tp1, tp2]);
			// Randomly generate point on margin line
			// X will be within half a radius away from center to prevent margins cutting off too much of the sphere
			tx = Math.floor(Math.random() * s.r) - s.r/2;
			// y = (-Ax/B) - (C / B)
			ty = (-1 * ml.a * tx / ml.b) - (ml.c / ml.b);
			tp1 = [1, tx, ty];
			if (!this.isPointWithinRadius(tp1, s.r)) {
				// Somehow invalid, get another point
				continue;
			}
			// Get the second point

			// Use degree from true line to get a and b
			// Pythagorean theorum: a*a + b*b = c*c = hypotenuse ^2 = distance^2
			// a = radius * cos(rad)
			// b = radius * sin(rad)
			a = mpd * Math.cos(this.toRadians(s.trueLine.degree));
			b = mpd * Math.sin(this.toRadians(s.trueLine.degree));
			tx = tp1[1] + a;
			ty = tp1[2] + b;

							// // c*c= a*a*slope*slope + a*a;
							// // mpd = a*a(s*s + 1)
							// // a2 = mpd / (s*s + 1)
							// // a = sqrt(   mpd / (s * s + 1)   )
							// slope = (-1 * ml.a / ml.b);
							// a = Math.sqrt((mpd * mpd)
							// 	/ (slope * slope + 1));
							// tx = tp1[1] + a;
							// ty = slope * tx;

			// POINT 2
			tp2 = [1, tx, ty];
			if (!this.isPointWithinRadius(tp2, s.r)) {
				// If that direction fails, can go in opposite direction
				tx = tp1[1] + (a * -1);
				ty = slope * tx;
				tp2 = [1, tx, ty];
				if (!this.isPointWithinRadius(tp2, s.r)) {
					// Somehow invalid, get another point
					continue;
				}
			}
			// Making it this far means the points were OK
			hasBothPoints = true;
		}

		tp1.push(this.getLabelOfPointGivenTrueLine(tp1, s.trueLine));
		tp2.push(this.getLabelOfPointGivenTrueLine(tp2, s.trueLine));

		// error check, these lines are no the same margin line
		// The margin lines are on opposite sides of the true line
		// any point on them should have the same label
		if (tp1[3] !== tp2[3]) {
			throw "Error with point on margin line generation";
		}
		return [tp1, tp2];
	},

	/**
	* Is point within the circle
	*
	* @method isPointWithinRadius
	* @param p {Array} point [1, x, y, label]
	* @param r {Float} radius
	* @return {bool} true yes, false no.
	*/
	isPointWithinRadius:function (p, r) {
		var a = p[1];
		var b = p[2];
		var c = this.getHypotenuse(a, b);
		if (c <= r) {
			return true;
		}
		return false;
	},

	/**
	* Generates all other points
	*
	* @method generateAllOtherPoints
	* @param s {Object} settings
	* @param points {Object} contains points
	* @return {bool} true yes, false no.
	*/
	generateAllOtherPoints:function(s, points) {
		// Gen points until all points match number required
		var point, px, py, marginStatus, dotProduct;
		var tl = s.trueLine;
		this.loopCounter = 0;
		while (points.all.length < s.n) {
			this.loopLimitCheck("Generate all others:" + point);
			px = (Math.random() * s.r * 2);
			px -= s.r;
			px = Math.floor(px * 1000) / 1000; // keep three decimal places
			py = (Math.random() * s.r * 2);
			py -= s.r;
			py = Math.floor(py * 1000) / 1000; // keep three decimal places

			point = [1, px, py];
			// If not within radius, get a different point
			if (!this.isPointWithinRadius(point, s.r)) {
				continue;
			}
			// If within margin, get different point
			// The function return 1, 0, -1.    only 0 is false.
			// 1 or -1 means both values outside margin.
			if (!this.isPointOutsideMargins(point, s.marginLines)){
				continue;
			}
			// Making it this far means the point is good, determine which side it is on
			dotProduct = point[1] * tl.a + point[2] * tl.b + tl.c;
			point.push(this.getSign(dotProduct));
			points.all.push(point);
		}
	},
	





	/**
	* Attempt to prevent infinite loops.
	* @method loopLimitChe	*/
	loopLimitCheck: function(v) {
		this.loopCounter++;
		if (this.loopCounter > this.loopLimit) {
			console.dir(settings);
			throw "Loop limit hit. Given value:" + v;
		}
	},
	/**
	* Given radians, returns degrees.
	* @method toDegrees
	* @param r {Float} Radians
	* @return {Float} Degrees
	*/
	toDegrees: function(r) {
		return r * (180 / Math.PI);
	},
	/**
	* Given degrees, returns radians.
	* @method toDegrees
	* @param d {Float} Degrees
	* @return {Float} Radians
	*/
	toRadians: function(d) {
		return d * (Math.PI / 180);
	},
	/**
	* Returns 1 if > 0, else -1
	* @method getSign
	* @param v {Float} Degrees
	* @return {Integer} 1 or -1
	*/
	getSign: function(v) {
		return (v > 0) ? 1 : -1;
	},
	/**
	* Calculates hypotenuse
	* @method getHypotenuse
	* @param a {Float} leg 1
	* @param b {Float} leg 2
	* @return {Float} hypotenuse
	*/
	getHypotenuse: function(a, b) {
		return(Math.sqrt((a * a) + (b * b)));
	}



}




