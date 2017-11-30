class Timeline {
	/**
     * Constructor for the timeline
     */
	constructor(allTimelineData, map, table, chart) {
		this.timelineData = allTimelineData;
		this.map = map;
		this.table = table;
		this.chart = chart;
		
		this.width = 599;
		this.height = 130;
		this.xOffset = 60;
		this.yOffset = 30;
		
		this.countData = [];
		
		this.timeScale;
		this.meteorCountScale;
		this.fireballCountScale;
		
		this.initialize();
    };
	
	/**
     * Initializes the timeline
     */
	initialize() {
		let _this = this;
		
		//Generate the count data
		_this.countData = _this.generateData();
		
		//Find the minimum and maximum variables
		let minYear = d3.min(_this.countData.Meteorites, d => d.year);
		let maxYear = d3.max(_this.countData.Meteorites, d => d.year);
		let maxMeteorCount = d3.max(_this.countData.Meteorites, d => d.meteorCount);
		let maxFireballCount = d3.max(_this.countData.Fireballs, d => d.fireballCount);
		
		/* Create the scales */
		//years
		_this.timeScale = d3.scaleBand()
			.range([0, _this.width - _this.xOffset])
			.padding(0.1);
		_this.timeScale.domain(_this.countData.Meteorites.map(d => d.year));
		//meteor counts
		_this.meteorCountScale = d3.scaleLinear()
			.domain([maxMeteorCount, 0])
			.range([0, _this.height])
			.nice();
		//fireball counts
		_this.fireballCountScale = d3.scaleLinear()
			.domain([maxFireballCount, 0])
			.range([0, _this.height])
			.nice();
		
		//Draw the timeline
		d3.select("#meteorTimeline").append("text")
			.text("Meteorite Timeline")
			.attr("class", "categoryLabel")
			.attr("y", 15);
		d3.select("#fireballTimeline").append("text")
			.text("Fireball Timeline")
			.attr("class", "categoryLabel")
			.attr("y", 15);
		_this.drawAxes("meteor");
		_this.drawAxes("fireball");
		_this.drawLines("meteor");
		_this.drawLines("fireball");
		_this.drawPoints("meteor");
		_this.drawPoints("fireball");
		
		//Initialize the views to the first year
		_this.updateYear(minYear + "");
	};
	
	/**
     * Counts the number of events in the data
	 *
	 * @param type - The type of data, either "meteors" or "fireballs"
	 * @param column - The name of the column in the data where the date is stored
	 * @param character - The character used to parse the date
	 * @param index - The index at which the parsed year can be found
     */
	countEvents(type, column, character, index) {
		let _this = this;
		
		let result = {};
		
		for (let i = 0; i < _this.timelineData[type].length; i++) {
			let year = 0;
			
			if (_this.timelineData[type][i].year != "") {
				let datetime = _this.timelineData[type][i][column].split(" ");
				let date = datetime[0].split(character);
				year = date[index];
			} else {
				continue;//year = "unknown";
			}
			
			let currentDate = new Date();
			if (parseInt(year) > currentDate.getFullYear()) {
				continue;//year = "unknown";
			}
			
			if (result[year] == null) {
				result[year] = 1;
			} else {
				result[year]++;
			}
		}
		
		return result;
	};
	
	/**
     * Returns the count data for meteorite and fireball events
     */
	generateData() {
		let _this = this;
		
		let mData = [];
		let fData = [];
		
		let meteorCountData = _this.countEvents("meteors", "year", "/", 2);
		let fireballCountData = _this.countEvents("fireballs", "Peak Brightness Date/Time (UT)", "-", 0);
		
		for (let key in meteorCountData) {
			let fireballCount = 0;
			if (fireballCountData[key] != null) {
				fireballCount = fireballCountData[key];
			}
			if (parseInt(key) >= d3.min(Object.keys(fireballCountData))) {
				mData.push({"year":key, "meteorCount":meteorCountData[key]});
				fData.push({"year":key, "fireballCount":fireballCount});
			}
		}
		
		return {"Meteorites":mData, "Fireballs":fData};
	};
	
	/**
     * Draws the axes for the timeline chart
	 *
	 * @param type - The type of data, either "meteor" or "fireball"
     */
	drawAxes(type) {
		let _this = this;
		
		let timeline = d3.select("#" + type + "Timeline");
		
		//Year axis
		let timeAxis = d3.axisBottom();
		timeAxis.scale(_this.timeScale);
		
		timeline.select("#" + type + "TimeAxis")
			.attr("transform", "translate(" + _this.xOffset + ", " + (_this.height + _this.yOffset) + ")")
			.call(timeAxis)
			.selectAll("text")
			.attr("id", function(d) {
				return type + d + "Text";
			})
			.attr("class", "unselectedYearText")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5)
			.on("click", function(d) {
				_this.updateYear(d + "");
			});
			
		timeline.append("text")
			.text("year")
			.attr("class", "descriptionLabel")
			.attr("transform", "translate(" + (_this.width / 2) + ", " + (210) + ")")
			.style("text-anchor", "middle");
		
		//Count axis
		let countAxis = d3.axisLeft();
		if (type === "meteor") countAxis.scale(_this.meteorCountScale);
		else if (type === "fireball") countAxis.scale(_this.fireballCountScale);
		
		timeline.select("#" + type + "CountAxis")
			.attr("transform", "translate(" + _this.xOffset + ", " + _this.yOffset + ")")
			.call(countAxis);
			
		timeline.append("text")
			.text("event count")
			.attr("class", "descriptionLabel")
			.attr("transform", "translate(" + (10) + ", " + (_this.yOffset + _this.height / 2) + ") rotate(-90)")
			.style("text-anchor", "middle");
	};
	
	/**
     * Draws the points for the timeline chart
	 *
	 * @param type - The type of data, either "meteor" or "fireball"
     */
	drawPoints(type) {
		let _this = this;
		
		let timeline = d3.select("#" + type + "Timeline");
		
		let points = timeline.select("#" + type + "Points")
			.selectAll("circle")
			.data(function() {
				if (type === "meteor") return _this.countData.Meteorites;
				else if (type === "fireball") return _this.countData.Fireballs;
			});
		points.exit()
			.remove();
		points = points.enter()
			.append("circle")
			.merge(points);
		points.attr("id", function(d) {
				return type + d.year + "Point";
			})
			.attr("class", "unselectedCountPoint")
			.attr("transform", function(d) {
				return "translate(" + _this.timeScale(d.year) + ", " + (_this.height + _this.yOffset) + ") scale(1, -1)";
			})
			.style("fill", function(d) {
				if (type === "meteor") return "red";
				else if (type === "fireball") return "orange";
			})
			.attr("cx", _this.xOffset + _this.timeScale.bandwidth()/2)
			.attr("cy", function(d) {
				if (type === "meteor") return _this.meteorCountScale(0) - _this.meteorCountScale(d.meteorCount);
				else if (type === "fireball") return _this.fireballCountScale(0) - _this.fireballCountScale(d.fireballCount);
			})
			.on("click", function(d) {
				_this.updateYear(d.year + "");
			})
			.append("svg:title")
			.text(function(d) { 
				if (type === "meteor") return d.year + " count = " + d.meteorCount;
				else if (type === "fireball") return d.year + " count = " + d.fireballCount;
			});
			
		points.on("mouseover", function(d){
				let selection = d3.select(this);
				if (selection.classed("unselectedCountPoint") == true) selection.classed("mouseOverCountPoint", true);
				let selectionText = d3.select("#" + type + d.year + "Text");
				if (selectionText.classed("unselectedYearText") == true) selectionText.classed("mouseOverYearText", true);
			})
			.on("mouseout", function(d){
				let selection = d3.select(this);
				if (selection.classed("unselectedCountPoint") == true) selection.classed("mouseOverCountPoint", false);
				let selectionText = d3.select("#" + type + d.year + "Text");
				if (selectionText.classed("unselectedYearText") == true) selectionText.classed("mouseOverYearText", false);
			});
			
		d3.select("#" + type + "TimeAxis").selectAll("text")
			.on("mouseover", function(d){
				let selection = d3.select(this);
				if (selection.classed("unselectedYearText") == true) selection.classed("mouseOverYearText", true);
				let selectionPoint = d3.select("#" + type + d + "Point");
				if (selectionPoint.classed("unselectedCountPoint") == true) selectionPoint.classed("mouseOverCountPoint", true);
			})
			.on("mouseout", function(d){
				let selection = d3.select(this);
				if (selection.classed("unselectedYearText") == true) selection.classed("mouseOverYearText", false);
				let selectionPoint = d3.select("#" + type + d + "Point");
				if (selectionPoint.classed("unselectedCountPoint") == true) selectionPoint.classed("mouseOverCountPoint", false);
			});
	};
	
	/**
     * Draws the lines for the timeline chart
	 *
	 * @param type - The type of data, either "meteor" or "fireball"
     */
	drawLines(type) {
		let _this = this;
		
		let lineGenerator;
		
		if (type === "meteor") 
			lineGenerator = d3.line()
				.x(d => _this.xOffset + _this.timeScale(d.year) + _this.timeScale.bandwidth()/2)
				.y(d => _this.yOffset + _this.meteorCountScale(d.meteorCount));
		else if (type === "fireball")
			lineGenerator = d3.line()
				.x(d => _this.xOffset + _this.timeScale(d.year) + _this.timeScale.bandwidth()/2)
				.y(d => _this.yOffset + _this.fireballCountScale(d.fireballCount));
		
		let line = d3.select("#" + type + "Lines");
		let path = line.selectAll("path");
		path.attr("d", function() {
				if (type === "meteor") return lineGenerator(_this.countData.Meteorites);
				else if (type === "fireball") return lineGenerator(_this.countData.Fireballs);
			})
			.attr("stroke", function() {
				if (type === "meteor") return "red";
				else if (type === "fireball") return "orange";
			})
			.attr("fill", "none");
	};
	
	/**
     * Updates the type of data selected
	 *
	 * @param type - The type of data
     */
	updateType(type) {
		let _this = this;
	};
	
	/**
     * Updates the year selected
	 *
	 * @param year - The selected year
     */
	updateYear(year) {
		let _this = this;
		
		//Remove the previous selection
		d3.selectAll(".selectedYearText")
			.attr("class", "unselectedYearText");
		d3.selectAll(".selectedCountPoint")
			.attr("class", "unselectedCountPoint");
		
		//Highlight the new selection
		d3.select("#meteor" + year + "Text")
			.attr("class", "selectedYearText");
		d3.select("#fireball" + year + "Text")
			.attr("class", "selectedYearText");
		d3.select("#meteor" + year + "Point")
			.attr("class", "selectedCountPoint");
		d3.select("#fireball" + year + "Point")
			.attr("class", "selectedCountPoint");
			
		//Update the map
		_this.map.updateMap(_this.map.mapData, year);
		
		//Update the chart
		_this.chart.updateYear(year);
		
		//Update the table
		_this.table.yearSelected(year);
		
		_this.table.updateList("timelineUpdate");
	

	};
}