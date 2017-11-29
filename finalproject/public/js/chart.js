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
			.on("mouseover", function(d){
				d3.select(this)
			        .append("title")
			        .text(d.count);
			})
			.on("mouseout", function(d){
				d3.select(this)
			        .select("title")
			        .remove();
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
		let minVal = function(x, y){
			if (x < y) return x;
			return y;
		}

		if(this.category == "default")
		{
			this.clearChart();
		}
		else 
		{
			let data = this.allData[this.category].filter(function(d){if (d.yr === _this.year) return d;});
			let chartData = [], k = 0;
			let min, max, intervalSize, intervals = [], buckets = [], bucketCount = [], bucket = {};
			if(this.category == "meteors")
			{
				if(index == 1)
				{
					min = parseFloat(d3.min(data, function(d){return parseFloat(d["mass (g)"]);}));
					max = parseFloat(d3.max(data, function(d){return parseFloat(d["mass (g)"]);}));
					intervalSize = (max - min) / 10;
					
					intervals[0] = 1;
					intervals[1] = 10;
					intervals[2] = 100;
					intervals[3] = 1000;
					intervals[4] = max+1;

					buckets[0] = "<1g";
					buckets[1] = "1-10g";
					buckets[2] = "10-100g";
					buckets[3] = "100-1000g";
					buckets[4] = ">1000g";

						
					for(let i = 1; i<= 10; i++)
					{
						bucketCount[i-1] = 0;
					}
					for(let iter of data)
					{	
						for(let i = 0; i< 5; i++)
						{
							if(iter["mass (g)"] < intervals[i])
							{
								bucketCount[i]++;
								break;
							}
						}
					}
					for(let i = 0; i< 5; i++)
					{
						chartData[i] = {"bucket" : buckets[i], "count": bucketCount[i]};
					}
					this.updateChart(chartData);
				}
				else if(index == 2)
				{	
					for(let iter of data)
					{	
						if(!bucket[iter.recclass])
							bucket[iter.recclass] = 1;
						else
							bucket[iter.recclass]++;
					}

					for(let iter in bucket)
					{
						chartData[k++] = {"bucket" : iter, "count": bucket[iter]};
					}
					
					chartData.sort(function(x, y){
						return parseInt(x.count) - parseInt(y.count);
					})

					chartData.reverse();

					this.updateChart(chartData.slice(0, minVal(chartData.length, 20)));
				}
				else if(index == 3)
				{	
					for(let iter of data)
					{	
						let key = iter.name.replace(/\d*/g,'');
						if(!bucket[key])
							bucket[key] = 1;
						else
							bucket[key]++;
					}
					for(let iter in bucket)
					{
						chartData[k++] = {"bucket" : iter, "count": bucket[iter]};
					}
					
					chartData.sort(function(x, y){
						return parseInt(x.count) - parseInt(y.count);
					})

					chartData.reverse();

					this.updateChart(chartData.slice(0, minVal(chartData.length, 20)));
				}
				else
					this.clearChart();
			}
			else if(this.category == "fireballs")
			{
				if(index == 1)
				{
					let e10 = 10000000000;
					min = parseFloat(d3.min(data, function(d){return parseFloat(d["Total Radiated Energy (J)"]);}))/e10;
					max = parseFloat(d3.max(data, function(d){return parseFloat(d["Total Radiated Energy (J)"]);}))/e10;
						
					intervals[0] = 10;
					intervals[1] = 50;
					intervals[2] = 100;
					intervals[3] = 250;
					intervals[4] = max+1;

					buckets[0] = "<10E10 (J)";
					buckets[1] = "10E10-50E10 (J)";
					buckets[2] = "50E10-100E10 (J)";
					buckets[3] = "100E10-250E10 (J)";
					buckets[4] = ">250E10 (J)";
					for(let i = 1; i<= 10; i++)
					{
						bucketCount[i-1] = 0;
					}
					for(let iter of data)
					{	
						for(let i = 0; i< 5; i++)
						{
							if(iter["Total Radiated Energy (J)"]/e10 < intervals[i])
							{
								bucketCount[i]++;
								break;
							}
						}
					}
					for(let i = 0; i< 5; i++)
					{
						chartData[i] = {"bucket" : buckets[i], "count": bucketCount[i]};
					}
					console.log(chartData);
					this.updateChart(chartData);
				}
				else if(index == 2)
				{	
					min = parseFloat(d3.min(data, function(d){return parseFloat(d["Calculated Total Impact Energy (kt)"]);}));
					max = parseFloat(d3.max(data, function(d){return parseFloat(d["Calculated Total Impact Energy (kt)"]);}));
						
					intervals[0] = 0.1;
					intervals[1] = 0.5;
					intervals[2] = 1;
					intervals[3] = 10;
					intervals[4] = 50;
					intervals[5] = max+1;

					buckets[0] = "<0.1 (kt)";
					buckets[1] = "0.1-0.5 (kt)";
					buckets[2] = "0.5-1 (kt)";
					buckets[3] = "1-10 (kt)";
					buckets[4] = "10-50 (kt)";
					buckets[5] = ">50 (kt)";

					for(let i = 1; i<= 10; i++)
					{
						bucketCount[i-1] = 0;
					}
					for(let iter of data)
					{	
						for(let i = 0; i< 6; i++)
						{
							if(iter["Calculated Total Impact Energy (kt)"] < intervals[i])
							{
								bucketCount[i]++;
								break;
							}
						}
					}
					for(let i = 0; i< 6; i++)
					{
						chartData[i] = {"bucket" : buckets[i], "count": bucketCount[i]};
					}
					console.log(chartData);
					this.updateChart(chartData);
				}
				else
					this.clearChart();
			}
			else if(this.category == "futureEvents")
				this.clearChart();
		}
	}
}
