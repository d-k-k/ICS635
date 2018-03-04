


/*
Resources:

http://aass.oru.se/~lilien/ml/seminars/2007_02_01b-Janecek-Perceptron.pdf


Step 1: Get training data
	Format: [ e1, e2, ... en ]
	e, element/input, format (simple): [ v1, v2, ... vn, expectedLabel ]
	v, value, is a number
		values can be for any property: age, height, weight, etc
	expectedlabel is 1 or -1, A or B, one of two properties
		in this basic perceptron there can only be two labels
		keeping 1 and -1 is easier for the sake of calculation

Step 2: Select starting weight
	weight is a vector, same number of v
		in this case probably two since it will be plotted on a 2d graph

Step 3: Train
	For each element in training data
		Evalutate the current expected output, y
			output is either 1 or -1,
		
		y_i = sign (   ∑(1 to v) {  (w_t_v * x_i_v) + ø  } )
			sign () return 1 or -1
			ø == bias == w_t_0
		
		y_i == outcome label, will be 1 or -1

		if y_i != x_i_expectedLabel
			need to adjust weight

			do this by setting 
				w_(t+1) = w_t + c(x_i_expectedLabel - y_i) x_i
			w_t_0 = bias, can start at 0
			x_i_0 = always 1.

	Repeat cycles on the data until a full cycle does not need weight adjustment


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

	train: function (dataset, weight, learningRate) {
		this.learningRate = learningRate;
		// First set the weight entries
		this.currentWeight = weight;
		dataset = dataset.slice(0);
		// Prepend all data values with 1
		for (let i = 0; i < dataset.length; i++) {
			dataset[i] = [1].concat(dataset[i]);
		}
		this.cycleCount = 0;
		this.cycleOfTraining(dataset);
	},

	cycleOfTraining: async function (dataset) {
		var wasIncorrect = 0;
		var result; // y in formula
		var element;

		this.cycleCount++; // Starts at 0
		if (this.cycleCount > this.cycleLimit) {
			this.log("Cycle limit hit");
			return;
		}
		this.log("Starting training cycle: " + this.cycleCount);

		// Go through dataset
		for (let elementIndex = 0; elementIndex < dataset.length; elementIndex++) {
			// Begin evaluation
			element = dataset[elementIndex];
			result = this.evaluate(element);
			if (result != element[element.length - 1]) {
				wasIncorrect++;
				this.adjustWeight(element, result); // This doesn't capture changes after individual element checks

				chartMaker.makeLineOfCurrentWeight();
				await this.sleep(this.delaybetween);
			}
		}
		// Recursion without increaseing memory consumption until recursion ends.
		if (wasIncorrect > 0) {
			this.log("Number of bad results: " + wasIncorrect + " / " + dataset.length);
			setTimeout(() => {
				perceptron.cycleOfTraining(dataset);
			}, 1);
		} else {
			this.log("Full training value pass!");
			chartMaker.makeLineOfCurrentWeight();
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

		// this.log("Weight change, from:" + this.currentWeight);
		this.log("Weight change, to:" + this.nextWeight);
		this.currentWeight = this.nextWeight;
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

	sleep: function (ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	log: function (s) {
		var info = document.getElementById("infoDiv");
		info.innerHTML = s + "<br>\n" + info.innerHTML;
	},
	clearLog: function (s) {
		var info = document.getElementById("infoDiv");
		info.innerHTML = "";
	}
};


