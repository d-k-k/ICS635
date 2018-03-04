




var chartMaker = {

	hasMadeAChart: false,
	currentScatterTrain1: [],
	currentScatterTrain2: [],
	trueLine: null,
	marginLine1: null,
	marginLine2: null,
	layout: {
		xaxis: {range: [-15, 15]},
		yaxis: {range: [-15, 15]}
	},
	

	reset: function() {
		hasMadeAChart = false;
		currentScatterTrain1 = [];
		currentScatterTrain2 = [];
	},

	makeScatterChartOfData: function(data, preventPlot) {
		// Two different lables
		var xValues = [[],[]];
		var yValues = [[],[]];

		for (let i = 0; i < data.length; i++) {
			if (data[i][3] === 1) {
				xValues[0].push(data[i][1]);
				yValues[0].push(data[i][2]);
			} else {
				xValues[1].push(data[i][1]);
				yValues[1].push(data[i][2]);
			}
		}
		// Make two traces to differentiate the labels
		var trace1 = {
			x: xValues[0],
			y: yValues[0],
			mode: "markers",
			type: "scatter",
			name: "Label 1"
		};
		var trace2 = {
			x: xValues[1],
			y: yValues[1],
			mode: "markers",
			type: "scatter",
			name: "Label 2"
		};
		var data = [trace1, trace2];
		this.currentScatterTrain1 = trace1;
		this.currentScatterTrain2 = trace2;

		if (!preventPlot) {
			Plotly.newPlot("chartDiv", data, this.layout);
		}
	},

	makeLineOfCurrentWeight: function(weight, dataPoints, triggeringPoint) {
		if (dataPoints) {
			this.makeScatterChartOfData(dataPoints, "preventPlotting");
		}
		var	weightLineXValues = [-50, 50];
		var currentWeightLine = {
			x: weightLineXValues,
			y: this.getYValuesGivenStandardLineObject(weightLineXValues, weight),
			mode: "lines",
			type: "scatter",
			name: "Current Weight Line"
		};
		var data = [this.currentScatterTrain1, this.currentScatterTrain2];
		if (this.trueLine) { data.push(this.trueLine); }
		if (this.marginLine1) { data.push(this.marginLine1); }
		if (this.marginLine2) { data.push(this.marginLine2); }
		data.push(currentWeightLine);

		if (triggeringPoint) {
			let tpoint = {
				x: [triggeringPoint[1]],
				y: [triggeringPoint[2]],
				type: "scatter",
				name: "Triggering Point",
				marker: {
				  color: 'red',
				  size: 16
				}
			};
			data.push(tpoint);
		}


		Plotly.newPlot("chartDiv", data, this.layout);
	},



	makeLinesOfTrueAndMargin: function(tl, m1, m2) {
		var bounds = [-50, 50];

		var data;
		this.trueLine = {
			x: bounds,
			y: this.getYValuesGivenStandardLineObject(bounds, tl),
			type: "scatter",
			mode: "lines",
			name: "True Line",
			marker: {
			  color: 'green'
			}
		};
		data = [this.trueLine];
		if (m1) {
			this.marginLine1 = {
				x: bounds,
				y: this.getYValuesGivenStandardLineObject(bounds, m1),
				type: "scatter",
				mode: "lines",
				name: "Margin 1",
				marker: {
				  color: 'orange'
				}
			};
			data.push(this.marginLine1);
		}
		if (m2) {
			this.marginLine2 = {
				x: bounds,
				y: this.getYValuesGivenStandardLineObject(bounds, m2),
				type: "scatter",
				mode: "lines",
				name: "Margin 2",
				marker: {
				  color: 'orange'
				}
			};
			data.push(this.marginLine2);
		}
		// console.dir(data)
		Plotly.newPlot("chartDiv", data, this.layout);
		// Plotly.newPlot("chartDiv", data);
	},

	getYValuesGivenStandardLineObject: function(xValues, lineObject) {
		var yv = [];
		var y;
		for (let i = 0; i < xValues.length; i++) {
			if (lineObject.b === 0) {
				yv.push(0);
			} else {
				yv.push(
					(-1 * lineObject.a * xValues[i] / lineObject.b)
					+ (lineObject.c / lineObject.b)
				);
			}
		}
		return yv;
	},


	removeOldChart: function() {
		if (this.hasMadeAChart) {
			Plotly.deleteTraces("chartDiv", 0);
		}
		this.hasMadeAChart = true;
	}
}








