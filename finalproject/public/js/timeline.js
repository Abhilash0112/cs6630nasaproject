class Timeline {
	/**
     * Constructor for the Timeline
     */
	constructor(allTimelineData, map) {
		this.timelineData = allTimelineData;
		this.map = map;
    };
	
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
	
	generateData(type) {
		let _this = this;
		let data = [];
		let meteorCountData = _this.countEvents("meteors", "year", "/", 2);
		let fireballCountData = _this.countEvents("fireballs", "Peak Brightness Date/Time (UT)", "-", 0);
		
		if (type === "Combined" || type === "Future Events") {
			for (let key in meteorCountData) {
				let fireballCount = 0;
				if (fireballCountData[key] != null) {
					fireballCount = fireballCountData[key];
				}
				if (parseInt(key) >= d3.min(Object.keys(fireballCountData)))
					data.push({"year":key, "meteorCount":meteorCountData[key], "fireballCount":fireballCount});
			}
		} else if (type === "Meteorites") {
			for (let key in meteorCountData) {
				data.push({"year":key, "meteorCount":meteorCountData[key]});
			}
		} else if (type === "Fireballs") {
			for (let key in fireballCountData) {
				data.push({"year":key, "fireballCount":fireballCountData[key]});
			}
		}
		
		return data;
	};
	
	update(type) {
		let _this = this;
		let data = _this.generateData(type);
		
		//Initialize the map
		let minYear = d3.min(data, d => d.year);
		let maxYear = d3.max(data, d => d.year);
		_this.map.updateMap(_this.timelineData, minYear);
		
		//Initialize the table
		
		
		//Initialize timeline drawing variables
		let width = 849
		let height = 150;
		let xOffset = 55;
		let yOffset = 15;
		let mTimeline = d3.select("#meteorTimeline");
		let fTimeline = d3.select("#fireballTimeline");
		
		if (type === "Meteorites") {
			d3.select("#fireballTimeline").attr("height", 0);
		} else {
			d3.select("#fireballTimeline").attr("height", 200);
		}
		if (type === "Fireballs") {
			d3.select("#meteorTimeline").attr("height", 0);
		} else {
			d3.select("#meteorTimeline").attr("height", 200);
		}
		
		//Draw the year axis
		let timeScale = d3.scaleBand()
			.range([0, width - xOffset])
			.padding(0.1);
		timeScale.domain(data.map(d => d.year));
		let timeAxis = d3.axisBottom();
		timeAxis.scale(timeScale);
		
		mTimeline.select("#mTimeAxis")
			.attr("transform", "translate(" + xOffset + ", " + (height + yOffset) + ")")
			.call(timeAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5)
			.on("click", function(d) {
				//Update the map
				_this.map.updateMap(_this.timelineData, d + "");
				
				//Update the table
				
			});
			
		fTimeline.select("#fTimeAxis")
			.attr("transform", "translate(" + xOffset + ", " + (height + yOffset) + ")")
			.call(timeAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5)
			.on("click", function(d) {
				//Update the map
				_this.map.updateMap(_this.timelineData, d + "");
				
				//Update the table
				
			});
			
		//Draw the count axis
		let maxMeteorCount = d3.max(data, d => d.meteorCount);
		let maxFireballCount = d3.max(data, d => d.fireballCount);
		let maxCount = d3.max([maxMeteorCount, maxFireballCount]);
		
		let mCountScale = d3.scaleLinear()
			.domain([maxMeteorCount, 0])
			.range([0, height])
			.nice();
		let mCountAxis = d3.axisLeft();
		mCountAxis.scale(mCountScale);
		mTimeline.select("#mCountAxis")
			.attr("transform", "translate(" + xOffset + ", " + yOffset + ")")
			.call(mCountAxis);
		
		let fCountScale = d3.scaleLinear()
			.domain([maxFireballCount, 0])
			.range([0, height])
			.nice();
		let fCountAxis = d3.axisLeft();
		fCountAxis.scale(fCountScale);
		fTimeline.select("#fCountAxis")
			.attr("transform", "translate(" + xOffset + ", " + yOffset + ")")
			.call(fCountAxis);
			
		//Draw the points
		let meteors = mTimeline.select("#mPoints")
			.selectAll("circle")
			.data(data);
		meteors.exit().remove();
		meteors = meteors.enter().append("circle").merge(meteors);
		meteors.attr("transform", function(d){
				return "translate(" + timeScale(d.year) + ", " + (height + yOffset) + ") scale(1, -1)";
			})
			.attr("r", 5)
			.style("fill", "black")
			.attr("cx", xOffset + timeScale.bandwidth()/2)
			.attr("cy", function(d) {
				return mCountScale(0) - mCountScale(d.meteorCount);
			});
		
		let fireballs = fTimeline.select("#fPoints")
			.selectAll("circle")
			.data(data);
		fireballs.exit().remove();
		fireballs = fireballs.enter().append("circle").merge(fireballs);
		fireballs.attr("transform", function(d){
				return "translate(" + timeScale(d.year) + ", " + (height + yOffset) + ") scale(1, -1)";
			})
			.attr("r", 5)
			.style("fill", "red")
			.attr("cx", xOffset + timeScale.bandwidth()/2)
			.attr("cy", function(d) {
				return fCountScale(0) - fCountScale(d.fireballCount);
			});
			
		//Draw the lines
		
	};
}