class Chart {
	/**
     * Constructor for the chart
     */
	constructor(allData) {
		this.allData = allData;
		this.selectedData = [];
		this.category = "meteors";
		this.year = 1988;
		
		this.width = 499;
		this.height = 400;
		this.xOffset = 60;
		this.yOffset = 50;
		
		this.xScale;
		this.yScale;
    };
	
	/**
	 * Updates the chart based on the selected column of data
	 *
	 * @param column - The column of data to visualize
	 */
	updateChart(column) {
		let _this = this;
		
		_this.xScale = d3.scaleBand()
			.range([0, _this.width - _this.xOffset])
			.padding(0.1);
		_this.xScale.domain(_this.selectedData.map(d => d[column]));
		
		_this.yScale = d3.scaleLinear()
			.domain([0, 0])
			.range([0, _this.height])
			.nice();
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