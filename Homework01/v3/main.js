/*
Control variables
weight, number of elements, learningRate, radius, margin

settings are changed by the input fields on page and pressing retrain
*/
var settings = {
	// Initial w_o, bias
	w0: 0,
	w1: 0,
	w2: 0,
	// Number of total training points 
	n: 100,
	// Learning rate
	lr: 0.1,
	// Radius
	r: 10,
	// Margin
	m: 1.0,
	// True line distance from origin
	tldfo: 0,

	// True line is an object.
	// Its values will be filled out by pointGenerator.makeTrueLine
	trueLine: { a: 0, b: 0, c: 0, degree: 0},
	marginLines: [{a: 0, b: 0, c: 0}, {a: 0, b: 0, c: 0}],
	marginPointDistance: 1,

	// Range values for variation.
	wRange: [],
	nRange: [],
	lrRange: [],
	rRange: [],
	mRange: []
}

var points;
var results;
var valueHistory = [];
var buttonsForCopyToClipboard = [];


generatePoints();
trainPerceptron();









// ------------------------------------------------------------------------
// Functions from here
function generatePoints() {
	clearLog();
	if (shouldKeepData()) {
		return;
	}
	// Generate the points
	log("Making true line...");
	pointGenerator.makeTrueLine(settings.trueLine);
	log("Making margin lines...");
	pointGenerator.makeMarginLines(settings);
	
	// Generate the points
	log("Making points...");
	points = pointGenerator.makeGivenSettings(settings);
	// chartMaker.makeLineOfCurrentWeight({a:0,b:0,c:0}, points.all);
	// throw "der";
}

function trainPerceptron() {
	// Train the perceptron
	log("Starting perceptron");
	// Parameters: dataset, starting weights, learning rate
	perceptron.train(points.all, [settings.w0, settings.w1, settings.w2], settings.lr);
}


// ------------------------------------------------------------------------
// Utility functions


function getDumpOfValuesOfImportance() {
	// Copy the settings
	var values;
	var retval;
	if (!perceptron.varianceControls.name) {
		values = Object.assign({}, settings);
		values.numberOfIterations = perceptron.cycleCount;
		// Make a separate copy of the line data
		values.trueLine = Object.assign({}, settings.trueLine);
		values.marginLines = [];
		values.marginLines.push(Object.assign({}, settings.marginLines[0]));
		values.marginLines.push(Object.assign({}, settings.marginLines[1]));
		values.trainedLine = perceptron.getWeightAsObject();
	
		document.getElementById("dumpArea").textContent = JSON.stringify(values);
		retval = {values, string: JSON.stringify(values)};
	} else {
		values = perceptron.varianceControls.log;
		document.getElementById("dumpArea").textContent = values;
		retval = values;
	}

	var btn = document.createElement("button");
	buttonsForCopyToClipboard.push(btn);
	btn.textContent = "Copy run " + buttonsForCopyToClipboard.length;
	btn.id = "copyButton" + buttonsForCopyToClipboard.length;
	btn.addEventListener("click", function() {
		if (window.clipboardData && window.clipboardData.setData) {
			// IE specific code path to prevent textarea being shown while dialog is visible.
			return window.clipboardData.setData("Text", text);
		} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
			let textarea = document.getElementById("dumpArea");
			if (!perceptron.varianceControls.name) {
				textarea.textContent = JSON.stringify(values);
			} else {
				textarea.textContent = values;
			}
			// Prevent scrolling to bottom of page in MS Edge
			textarea.select();
			try {
				// Security exception may be thrown by some browsers
				return document.execCommand("copy");
			} catch (ex) {
				console.warn("Copy to clipboard failed.", ex);
				return false;
			} finally {
				// document.body.removeChild(textarea);
			}
		}
	});
	document.getElementById("buttonsForDataGrabber").appendChild(btn);


	return retval;
}



function log (s, allowVarianceLogging) {
	if (!perceptron.varianceControls.name || allowVarianceLogging) {
		var info = document.getElementById("infoDiv");
		info.innerHTML = s + "<br>\n" + info.innerHTML;
		console.log(s);
	}
}

function clearLog (s, allowVarianceLogging) {
	var info = document.getElementById("infoDiv");
	info.innerHTML = "";
}


function sleep (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}








