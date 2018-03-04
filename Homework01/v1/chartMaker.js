




var chartMaker = {


	currentScatterTrain1: [],
	currentScatterTrain2: [],

	makeScatterChartOfData: function(data) {

		// Two different lables
		var xValues = [[],[]];
		var yValues = [[],[]];

		for (let i = 0; i < data.length; i++) {
			if (data[i][2] === 1) {
				xValues[0].push(data[i][0]);
				yValues[0].push(data[i][1]);
			} else {
				xValues[1].push(data[i][0]);
				yValues[1].push(data[i][1]);
			}
		}

		// Make two traces to differentiate the labels
		var trace1 = {
			x: xValues[0],
			y: yValues[0],
			mode: 'markers',
			type: 'scatter'
		};
		var trace2 = {
			x: xValues[1],
			y: yValues[1],
			mode: 'markers',
			type: 'scatter'
		};
		var layout = {
		  xaxis: {range: [-10, 10]},
		  yaxis: {range: [-10, 10]}
		};
		var data = [trace1, trace2];
		this.currentScatterTrain1 = trace1;
		this.currentScatterTrain2 = trace2;
		// Plotly.newPlot('myDiv', data, layout);
	},

	makeLineChartOfData: function(data) {



	},

	makeLineOfCurrentWeight: function(bounds) {
		if (!bounds) {
			bounds = [-10, 0, 10]
		}

		var xValues = bounds;
		var yValues = perceptron.getYValuesGivenX(xValues);
		var line = {
			x: xValues,
			y: yValues,
			mode: 'lines',
			type: 'scatter'
		};
		var data = [this.currentScatterTrain1, this.currentScatterTrain2, line];
		var layout = {
		  xaxis: {range: [-10, 10]},
		  yaxis: {range: [-10, 10]}
		};
		Plotly.newPlot('myDiv', data, layout);
	}
}








