/**
 * The perceptron class
 *
 * @class perceptron
 */
var perceptron = {

	weightHistory: [],
	lineHistory: [],

	currentWeight: [],
	nextWeight: [],

	learningRate: .1,
	cycleCount: 0,
	cycleLimit: 100,
	delaybetween: 200,
	howLongToShowIncorrectPointBeforeAdjustingWeightLine: 0,
	howLongToShowWeightLineChange: 0,

	// variance controls
	varianceControls: {
		name: null,
		iterations: null,
		iterationCount: null,
		currentValue: null,
		valueIncrement: null,
		valueLimit: null,
		log: null,
	},


	train: function (dataset, startingWeights, learningRate) {
		this.learningRate = learningRate;
		// First set the weight entries
		this.currentWeight = startingWeights;
		this.cycleCount = 0;
		this.cycleOfTraining(dataset);

		chartMaker.makeScatterChartOfData(dataset);
	},

	cycleOfTraining: async function (dataset) {
		var wasIncorrect = 0;
		var result; // y in formula
		var element;

		this.cycleCount++; // Starts at 0
		if (this.cycleCount > this.cycleLimit) {
			log("Cycle limit hit");
			return;
		}
		log("Starting training cycle: " + this.cycleCount);

		// Go through dataset
		for (let elementIndex = 0; elementIndex < dataset.length; elementIndex++) {
			// Begin evaluation
			element = dataset[elementIndex];
			result = this.evaluate(element);
			if (result != element[element.length - 1]) {

				// Show the element that caused the error
				if (this.howLongToShowIncorrectPointBeforeAdjustingWeightLine > 0
					&& (!perceptron.varianceControls.name)) {
					chartMaker.makeLineOfCurrentWeight(this.getWeightAsObject(), false, element);
					await this.sleep(this.howLongToShowIncorrectPointBeforeAdjustingWeightLine);
				}

				wasIncorrect++;
				this.adjustWeight(element, result); // This doesn't capture changes after individual element checks

				// Now show after weight has updated
				if (this.howLongToShowWeightLineChange > 0
					&& (!perceptron.varianceControls.name)) {
					chartMaker.makeLineOfCurrentWeight(this.getWeightAsObject(), false, element);
					await this.sleep(this.howLongToShowWeightLineChange);
				}
			}
		}
		// Recursion without increaseing memory consumption until recursion ends.
		if (wasIncorrect > 0) {
			log("Number of bad results: " + wasIncorrect + " / " + dataset.length);
			setTimeout(() => {
				perceptron.cycleOfTraining(dataset);
			}, 0); // 0 means do this on next free browser cycle
		} else {
			if (!this.varianceControls.name) {
				log("Full training value pass!");
				document.getElementById("iterationsNeededToComplete").textContent = "Iterations needed to complete:" + this.cycleCount;
				chartMaker.makeLineOfCurrentWeight(this.getWeightAsObject());
				// valueHistory is a global
				valueHistory.push(getDumpOfValuesOfImportance());
			} else {
				this.varianceUpdate();
			}
		}
	},

	evaluate: function (element) {
		var sum = 0;
		// property 0 is the non chaning 1 value
		// The last property is the expected label
		for (let propertyIndex = 1; propertyIndex < element.length - 1; propertyIndex++) {
			// sum += this.currentWeight[propertyIndex] * element[propertyIndex] + this.currentWeight[0];
			sum += this.currentWeight[propertyIndex] * element[propertyIndex];
		}
		sum += this.currentWeight[0];

		return this.sgn(sum);
	},

	sgn: function (x) {
		if (x > 0) {
			return 1;
		}
		return -1;
	},

	adjustWeight: function (element, result) {
		this.nextWeight = [];

		result *= -1;
		// Adjust properties
		// Start at 0 because this can be modified on the weight
		// Do not attempt the last element property as that is the expected label
		for (let propertyIndex = 0; propertyIndex < element.length - 1; propertyIndex++) {
			this.nextWeight.push(this.currentWeight[propertyIndex] + this.learningRate * element[propertyIndex] * result);
		}
		// Make shallow copy of currentWeight for history
		this.weightHistory.push(this.currentWeight.slice(0));

		// log("Weight change, from:" + this.currentWeight);
		log("Weight change, to:" + this.nextWeight);
		this.currentWeight = this.nextWeight;
	},

	varianceUpdate: function() {
		this.varianceControls.iterationCount++;

		// log ("Variation (" + this.varianceControls.name + ") loop "
		// 	+ this.varianceControls.iterationCount + " / " + this.varianceControls.iterations
		// 	+ ". cycles needed to train: " + this.cycleCount
		// 	, "allowVarianceLogging");
		
		this.addToVarianceLog();
		// If did necessary number of iterations
		if (this.varianceControls.iterationCount >= this.varianceControls.iterations) {
			this.varianceControls.iterationCount = 0;
			this.varianceControls.currentValue += this.varianceControls.valueIncrement;
			log("Starting next train" + this.varianceControls.currentValue
				+ "/" + this.varianceControls.valueLimit, "allowVarianceLogging");
		}
		// If current value is greater than limit, done
		if (this.varianceControls.currentValue > this.varianceControls.valueLimit) {
			log("Full training value pass!", "allowVarianceLogging");
			document.getElementById("iterationsNeededToComplete").textContent = "Iterations needed to complete:" + this.cycleCount;
			chartMaker.makeLineOfCurrentWeight(this.getWeightAsObject());
			valueHistory.push(getDumpOfValuesOfImportance());
			return;
		} else {
			settings[this.varianceControls.name] = perceptron.varianceControls.currentValue;
			let createdData = false;
			// while (!createdData) {
				try {
					generatePoints();
					createdData = true;
				} catch (e) {
					console.log(e);
					console.dir(settings);
				} // Just redo it.
			// }
			// log("Starting next train", "allowVarianceLogging");
			trainPerceptron();
		}
	},

	addToVarianceLog: function() {
		this.varianceControls.log +=
			this.cycleCount + ", "
			+ settings.trueLine.a + ", "
			+ settings.trueLine.b + ", "
			+ settings.trueLine.c + ", "
			+ settings.marginLines[0].a + ", "
			+ settings.marginLines[0].b + ", "
			+ settings.marginLines[0].c + ", "
			+ settings.marginLines[1].a + ", "
			+ settings.marginLines[1].b + ", "
			+ settings.marginLines[1].c + ", "
			+ this.currentWeight[1] + ", "
			+ this.currentWeight[2] + ", "
			+ this.currentWeight[0] + ", "
			+ settings.w0 + ", "
			+ settings.n + ", "
			+ settings.lr + ", "
			+ settings.r + ", "
			+ settings.m + ", "
			+ this.varianceControls.iterationCount + ", "
			+ settings.tldfo + "\n";
	},

	/*
	To plot the dividing line based on weights
		y = wx + b

		slope = -(w0/w2)/(w0/w1)  
		intercept = -w0/w2;

	*/
	getYValuesGivenX: function (xarr) {
		// First determine the slope
		var slope = this.getWeightLineSlope();
		var intercept = this.getWeightLineIntercept();

		var yarr = [];
		for (let i = 0; i < xarr.length; i++) {
			yarr.push(slope * xarr[i] + intercept);
		}
		return yarr;
	},
	getWeightLineIntercept: function () {
		if (this.currentWeight[2] == 0) {
			return 0
		}
		return -1 * this.currentWeight[0] / this.currentWeight[2];
	},
	getWeightLineSlope: function () {
		// var slope = -1 * this.currentWeight[0] / this.currentWeight[2];
		// slope = slope / (this.currentWeight[0] / this.currentWeight[1]);
		if (this.currentWeight[2] == 0) {
			return 0
		}
		return (-1 * this.currentWeight[1] / this.currentWeight[2]);
	},

	getWeightAsObject: function() {
		return {a: this.currentWeight[1], b: this.currentWeight[2], c: this.currentWeight[0]};
	},

	sleep: function (ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	clearLog: function (s) {
		var info = document.getElementById("infoDiv");
		info.innerHTML = "";
	}
};


