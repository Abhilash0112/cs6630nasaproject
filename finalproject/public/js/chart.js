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
		this.height = 390;
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
	updateChart(data, yAxisLabel = "count") {

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
			.style("font-size", "9pt")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5);
		
		//Draw the count/y axis
		let yAxis = d3.axisLeft()
			.tickFormat(function(d) {
				if (Math.floor(d) != d) {
					d3.select(this.parentNode).select("line").remove();
					return;
				}
				return d;
			});
		yAxis.scale(_this.yScale);
		
		chart.select("#yAxis")
			.attr("transform", "translate(" + _this.xOffset + ", " + _this.yOffset + ")")
			.call(yAxis);
		
		chart.selectAll(".descriptionLabel").remove();
		chart.append("text")
			.text(yAxisLabel)
			.attr("class", "descriptionLabel")
			.attr("transform", "translate(" + (10) + ", " + (_this.yOffset + _this.height / 2) + ") rotate(-90)")
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
			.attr("r", 4)
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

	
	meteorCharts(index)
	{
		let _this = this;
		
		let minVal = function(x, y){
			if (x < y) return x;
			return y;
		}

		let data = this.allData[this.category].filter(function(d){if (d.yr === _this.year) return d;});
		let chartData = [], k = 0;
		let min, max, intervalSize, intervals = [], buckets = [], bucketCount = [], bucket = {};

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

	fireballCharts(index)
	{
		let _this = this;
		let data = this.allData[this.category].filter(function(d){if (d.yr === _this.year) return d;});
		let chartData = [], k = 0;
		let min, max, intervalSize, intervals = [], buckets = [], bucketCount = [], bucket = {};
		if(index == 1)
		{
			let e10 = 10000000000, maxLength = 5;
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
			for(let i = 1; i<= maxLength; i++)
			{
				bucketCount[i-1] = 0;
			}
			for(let iter of data)
			{	
				for(let i = 0; i< maxLength; i++)
				{
					if(iter["Total Radiated Energy (J)"]/e10 < intervals[i])
					{
						bucketCount[i]++;
						break;
					}
				}
			}
			for(let i = 0; i< maxLength; i++)
			{
				chartData[i] = {"bucket" : buckets[i], "count": bucketCount[i]};
			}
			this.updateChart(chartData);
		}
		else if(index == 2)
		{	
			let maxLength = 6;
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

			for(let i = 1; i<= maxLength; i++)
			{
				bucketCount[i-1] = 0;
			}
			for(let iter of data)
			{	
				for(let i = 0; i< maxLength; i++)
				{
					if(iter["Calculated Total Impact Energy (kt)"] < intervals[i])
					{
						bucketCount[i]++;
						break;
					}
				}
			}
			for(let i = 0; i< maxLength; i++)
			{
				chartData[i] = {"bucket" : buckets[i], "count": bucketCount[i]};
			}
			this.updateChart(chartData);
		}
		else
			this.clearChart();
	}

	futureEventCharts(index, maxLength = 15) {
		let chartData = [], k = 0;
		let futureData = this.allData[this.category], factor = 1, yscale ="", yscaleLabel ="count", status = false;
		//ObjectDestination Vs Potential Impact
		if(index == 1)
		{
			yscale = "Potential Impacts  ";
			yscaleLabel = "Potential Impacts";
			status = true;
			
		}
		//ObjectDestination Vs Impact Probability (in E-3)
		else if(index == 2)
		{
			yscale = "Impact Probability (cumulative)";
			yscaleLabel = "Impact Probability (in terms of E-3)";
			factor = 1000;
			status = true;
		}
		//ObjectDestination Vs Vinfinity (km/s)
		else if(index == 3)
		{
			yscale = "Vinfinity (km/s)";
			yscaleLabel = "Relative Velocity w.r.t Earth (km/s)";
			status = true;
		}
		//ObjectDestination Vs Magnitude
		else if(index == 4)
		{
			yscale = "H (mag)";
			yscaleLabel = "Absolute Magnitude";
			status = true;
		}
		//"ObjectDestination Vs Estimated Diameter (km)"
		else if(index == 5)
		{
			yscale = "Estimated Diameter (km)";
			yscaleLabel = "Estimated Diameter (km)";
			status = true;
		}
		//ObjectDestination Vs Palermo Scale (cumulative)
		else if(index == 6)
		{
			yscale = "Palermo Scale (cum.)";
			yscaleLabel = "Palermo Scale (cumulative)";
			status = true;
		}
		//ObjectDestination Vs Palermo Scale (max.)
		else if(index == 7)
		{
			yscale = "Palermo Scale (max.)";
			yscaleLabel = "Palermo Scale (max.)";
			status = true;
		}
		else
		{
			this.clearChart();
			status = false;
		}
		if(status)
		{
			futureData.sort(function(x, y){
				return parseFloat(x[yscale]) - parseFloat(y[yscale]);
			})
			futureData.reverse();
			
			for(let i = 0; i< maxLength; i++)
			{
				chartData[i] = {"bucket" : futureData[i]["Object Designation  "], "count": parseFloat(futureData[i][yscale]) * factor};
			}
			this.updateChart(chartData, yscaleLabel);
		}
	}

	updateSelection(index) {
		
		d3.select(".categoryLabel2").style("visibility", "hidden");
		d3.select("#columnSelect2").style("visibility", "hidden");
		if(this.category == "default")
		{
			this.clearChart();
		}
		else 
		{
			if(this.category == "meteors")
			{
				this.meteorCharts(index);
			}
			else if(this.category == "fireballs")
			{
				this.fireballCharts(index);
			}
			else if(this.category == "futureEvents")
			{
				d3.select(".categoryLabel2").style("visibility", "visible");
				d3.select("#columnSelect2").style("visibility", "visible");
				let e2 = document.getElementById("columnSelect2");
				if (e2.selectedIndex!=0)
					this.futureEventCharts(index, parseInt(e2.options[e2.selectedIndex].value));
				else
					this.futureEventCharts(index);
			}
		}
	}
}
