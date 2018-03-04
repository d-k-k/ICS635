

// Code for retrain button
var btn = document.getElementById("retrainButton");
btn.addEventListener("click", () => {
	perceptron.cycleCount = perceptron.cycleLimit;
	setTimeout(() => {
		updateSettingsBasedOnInput();
		getVarianceSettings();
		generatePoints();
		trainPerceptron();
	},
	(perceptron.howLongToShowIncorrectPointBeforeAdjustingWeightLine * 1.2 + perceptron.howLongToShowWeightLineChange * 1.2));
});


// Code for show/hide dump
btn = document.getElementById("buttonShowHideDataDump");
btn.addEventListener("click", () => {
	var ta = document.getElementById("dumpArea");
	if (ta.style.display === "none") {
		ta.style.display = "block";
	} else {
		ta.style.display = "none";
	}
});


function updateSettingsBasedOnInput() {
	settings.w0 = parseFloat(document.getElementById("inputW0").value);
	// settings.w1 = parseFloat(document.getElementById("inputW1").value);
	// settings.w2 = parseFloat(document.getElementById("inputW2").value);
	settings.n = parseInt(document.getElementById("inputN").value);
	settings.lr = parseFloat(document.getElementById("inputLr").value);
	settings.r = parseFloat(document.getElementById("inputR").value);
	chartMaker.layout.xaxis.range = [settings.r * -1.5, settings.r * 1.5];
	chartMaker.layout.yaxis.range = [settings.r * -1.5, settings.r * 1.5];

	settings.m = parseFloat(document.getElementById("inputM").value);

	perceptron.howLongToShowIncorrectPointBeforeAdjustingWeightLine = parseInt(document.getElementById("inputBadPointDelay").value);
	perceptron.howLongToShowWeightLineChange = parseInt(document.getElementById("inputEvaluationDelay").value);
	perceptron.cycleLimit = parseInt(document.getElementById("inputCycleLimit").value);
}


function getVarianceSettings() {
	 // var name in settings object
	var whichVariableToChange = null;
	if (document.getElementById("radialVarW").checked) { whichVariableToChange = "w0"; 
		perceptron.varianceControls.currentValue = parseFloat(document.getElementById("inputW0").value);}
	else if (document.getElementById("radialVarN").checked) { whichVariableToChange = "n";
		perceptron.varianceControls.currentValue = parseFloat(document.getElementById("inputN").value);}
	else if (document.getElementById("radialVarLr").checked) { whichVariableToChange = "lr";
		perceptron.varianceControls.currentValue = parseFloat(document.getElementById("inputLr").value);}
	else if (document.getElementById("radialVarR").checked) { whichVariableToChange = "r";
		perceptron.varianceControls.currentValue = parseFloat(document.getElementById("inputR").value);}
	else if (document.getElementById("radialVarM").checked) { whichVariableToChange = "m";
		perceptron.varianceControls.currentValue = parseFloat(document.getElementById("inputM").value);}
	else { whichVariableToChange = null;}


	if (whichVariableToChange === null) {
		perceptron.varianceControls.name = null;
		perceptron.varianceControls.iterations = null;
		perceptron.varianceControls.iterationCount = null;
		perceptron.varianceControls.currentValue = null;
		perceptron.varianceControls.valueIncrement = null;
		perceptron.varianceControls.valueLimit = null;
		perceptron.varianceControls.log = null;
	} else {
		log("DETECTED VARIANCE SETTINGS");
		perceptron.varianceControls.name = whichVariableToChange;
		perceptron.varianceControls.iterations = parseInt(document.getElementById("varianceIterations").value);
		perceptron.varianceControls.iterationCount = 0;
		perceptron.varianceControls.valueIncrement = parseFloat(document.getElementById("varianceIncrement").value);
		perceptron.varianceControls.valueLimit = parseFloat(document.getElementById("varianceLimit").value);
		perceptron.varianceControls.log = 
			"numberOfIterations,"
			+ "truelineA, truelineB, trueLineC, "
			+ "marginLine1A, marginLine1B, marginLine1C, "
			+ "marginLine2A, marginLine2B, marginLine2C, "
			+ "trainedLineA, trainedLineB, trainedLineC, "
			+ "w0, n, lr, r, m, iteration\n";
	}

}



