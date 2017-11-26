class Chart {
	/**
     * Constructor for the chart
     */
	constructor(allData) {
		this.allData = allData;
		this.selectedData = [];
		this.category = "meteors";
		this.year = 1988;
		
		this.width = 450;
		this.height = 300;
		this.xOffset = 60;
		this.yOffset = 20;
		
		this.xScale;
		this.yScale;
    };
	
	/**
	 * Updates the chart based on the selected column of data
	 *
	 * @param column - The column of data to visualize
	 */
	updateChart(data) {
		let _this = this;
		
		let chart = d3.select("#compChart");
		let countMin = d3.min(data, d => d.count);
		let countMax = d3.max(data, d => d.count);
		
		//Create the scales
		_this.xScale = d3.scaleBand()
			.range([0, _this.width - _this.xOffset])
			.padding(0.1);
		_this.xScale.domain(data.map(d => d.bucket));
		
		_this.yScale = d3.scaleLinear()
			.domain([countMax, 0])
			.range([0, _this.height])
			.nice();
		
		//Draw the bucket/x axis
		let xAxis = d3.axisBottom();
		xAxis.scale(_this.xScale);
		
		chart.select("#xAxis")
			.attr("transform", "translate(" + _this.xOffset + ", " + (_this.height + _this.yOffset) + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5);
		
		//Draw the count/y axis
		let yAxis = d3.axisLeft();
		yAxis.scale(_this.yScale);
		
		chart.select("#yAxis")
			.attr("transform", "translate(" + _this.xOffset + ", " + _this.yOffset + ")")
			.call(yAxis);
		
		chart.selectAll(".descriptionLabel").remove();
		chart.append("text")
			.text("count")
			.attr("class", "descriptionLabel")
			.attr("transform", "translate(" + (5) + ", " + (_this.yOffset + _this.height / 2) + ") rotate(90)")
			.style("text-anchor", "middle");
		
		//Plot the points
		let points = chart.select("#dataPoints")
			.selectAll("circle")
			.data(data);
		points.exit()
			.remove();
		points = points.enter()
			.append("circle")
			.merge(points);
			
		points.attr("transform", function(d) {
				return "translate(" + _this.xScale(d.bucket) + ", " + (_this.height + _this.yOffset) + ") scale(1, -1)";
			})
			.style("fill", "black")
			.attr("r", 3)
			.attr("cx", _this.xOffset + _this.xScale.bandwidth()/2)
			.attr("cy", function(d) {
				return _this.yScale(0) - _this.yScale(d.count);
			})
			.append("svg:title")
			.text(function(d) { 
				return d.count;
			});
			
		//Draw the lines
		let lineGenerator = d3.line()
				.x(d => _this.xOffset + _this.xScale(d.bucket) + _this.xScale.bandwidth()/2)
				.y(d => _this.yOffset + _this.yScale(d.count));
		
		let line = chart.select("#dataLines");
		let path = line.selectAll("path");
		path.attr("d", function() {
				return lineGenerator(data);
			})
			.attr("stroke", "black")
			.attr("fill", "none");
	};
	
	/**
	 * Called from the table to update the selected type of data
	 *
	 * @param type - The type of data: meteorites, fireballs, or future events
	 */
	updateType(type) {
		if (type === "Meteorites") this.category = "meteors";
		else if (type === "Fireballs") this.category = "fireballs";
		else if (type === "Future Events") this.category = "futureEvents";
		
		this.selectedData = this.allData[this.category];
		
		let options = d3.select("#columnSelect")
			.selectAll("option")
			.data(this.selectedData.columns);
		
		options.exit().remove();
		options = options.enter().append("option").merge(options);
		options.attr("value", function(d) { return d; })
			.text(function(d) { return d; });
	};
	
	/**
	 * Called from the timeline to update the selected year
	 *
	 * @param year - The selected year
	 */
	updateYear(year) {
		this.year = year;
		this.selectedData = this.allData[this.category]
			.filter(function(d) {
				if (d.yr === year) return d;
			});
	};
}