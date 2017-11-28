class Chart {
	/**
     * Constructor for the chart
     */
	constructor(allData, selectionData) {
		this.allData = allData;
		this.selectionData = selectionData;
		this.selectedData = [];
		this.category = "meteors";
		this.year = 1988;
		
		this.width = 599;
		this.height = 300;
		this.xOffset = 60;
		this.yOffset = 20;
		
		this.xScale;
		this.yScale;
    };
	
	clearChart(){
		d3.select("#compChart").selectAll("text").remove();
		d3.select("#xAxis").selectAll("g").remove();
		d3.select("#xAxis").selectAll("path").remove();
		d3.select("#yAxis").selectAll("g").remove();
		d3.select("#yAxis").selectAll("path").remove();
		d3.select("#dataLines").selectAll("g").remove();
		d3.select("#dataLines").selectAll("path").attr("d", "");
		d3.select("#dataPoints").selectAll("circle").remove();
	}

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
			.attr("transform", "translate(" + (7) + ", " + (_this.yOffset + _this.height / 2) + ") rotate(-90)")
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
		else this.category = "default";
		let selectedData = this.selectionData[this.category]; //this.allData[this.category];
		
		let options = d3.select("#columnSelect")
			.selectAll("option")
			.data(selectedData);
		
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
		/*this.chartData = this.allData[this.category]
			.filter(function(d) {
				if (d.yr === year) return d;
			});*/
	};

	/*"meteors": ["Select Stat.", "Number Vs. Mass", "Number Vs. Rec. Class", "Location Vs. Density (selected year)"], 
      "fireballs": ["Select Stat.", "Number Vs. Radiated Energy", "Number Vs. Impact Energy"], 
      "futureEvents": ["NA"], 
      "default" : ["Select a category in the table to explore", ""]});*/
	
	updateSelection(index) {
		let _this = this;
		if(this.category == "default")
		{
			this.clearChart();
		}
		else 
		{
			let data = this.allData[this.category].filter(function(d){if (d.yr === _this.year) return d;});

			if(this.category == "meteors")
			{
				let chartData = [], k = 0;
				if(index == 1)
				{
					let min = parseFloat(d3.min(data, function(d){return d["mass (g)"];}));
					let max = parseFloat(d3.max(data, function(d){return d["mass (g)"];}));
					let intervalSize = (max - min) / 10;
					let intervals = [], bucketCount = [];
					for(let i = 1; i<= 10; i++)
					{
						intervals[i-1] = min + i * intervalSize;
						bucketCount[i-1] = 0;
					}
					for(let iter of data)
					{	
						for(let i = 0; i< 10; i++)
						{
							if(iter["mass (g)"] < intervals[i])
							{
								bucketCount[i]++;
								break;
							}
						}
					}
					for(let i = 0; i< 10; i++)
					{
						let bucket = parseFloat((intervals[i] - intervalSize)).toFixed(3) + " - " + parseFloat(intervals[i]).toFixed(3);
						chartData[i] = {"bucket" : bucket, "count": bucketCount[i]};
					}
					this.updateChart(chartData);
				}
				else if(index == 2)
				{	
					let buckets = {};
					for(let iter of data)
					{	
						if(!buckets[iter.recclass])
							buckets[iter.recclass] = 1;
						else
							buckets[iter.recclass]++;
					}
					for(let iter in buckets)
					{
						chartData[k++] = {"bucket" : iter, "count": buckets[iter]};
					}
					console.log(chartData);
					this.updateChart(chartData);
				}
				else if(index == 3)
				{	
					let buckets = {};
					for(let iter of data)
					{	
						let key = iter.name.replace(/\d*/g,'');
						if(!buckets[key])
							buckets[key] = 1;
						else
							buckets[key]++;
					}
					for(let iter in buckets)
					{
						chartData[k++] = {"bucket" : iter, "count": buckets[iter]};
					}
					console.log(chartData);
					this.updateChart(chartData);
				}
				else
					this.clearChart();
			}
			else if(this.category == "fireballs")
			{

			}
			else if(this.category == "futureEvents")
				this.clearChart();
		}
	}
}
