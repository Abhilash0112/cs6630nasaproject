class Timeline {
	/**
     * Constructor for the Timeline
     */
	constructor(allTimelineData, map) {
		this.timelineData = allTimelineData;
		this.map = map;
    };
	
	update() {
		let _this = this;
		let meteorCountData = {};
		let fireballCountData = {};
		
		//Count the meteorites
		for (let i = 0; i < _this.timelineData.meteors.length; i++) {
			let year = 0;
			
			if (_this.timelineData.meteors[i].year != "") {
				let datetime = _this.timelineData.meteors[i].year.split(" ");
				let date = datetime[0].split("/");
				year = date[2];
			} else {
				year = "unknown";
			}
			
			let currentDate = new Date();
			if (parseInt(year) > currentDate.getFullYear()) {
				year = "unknown";
			}
			
			if (meteorCountData[year] == null) {
				meteorCountData[year] = 1;
			} else {
				meteorCountData[year]++;
			}
		}
		
		//Count the fireballs
		for (let i = 0; i < _this.timelineData.fireballs.length; i++) {
			let year;
			
			if (_this.timelineData.fireballs[i].year != "") {
				let datetime = _this.timelineData.fireballs[i]["Peak Brightness Date/Time (UT)"].split(" ");
				let date = datetime[0].split("-");
				year = date[0];
			} else {
				year = "unknown";
			}
			
			let currentDate = new Date();
			if (parseInt(year) > currentDate.getFullYear()) {
				year = "unknown";
			}
			
			if (fireballCountData[year] == null) {
				fireballCountData[year] = 1;
			} else {
				fireballCountData[year]++;
			}
		}
		
		//Combine the data
		let data = [];
		for (let key in meteorCountData) {
			let fireballCount = 0;
			if (fireballCountData[key] != null) {
				fireballCount = fireballCountData[key];
			}
			if (parseInt(key) >= d3.min(Object.keys(fireballCountData)))
			data.push({"year":key, "meteorCount":meteorCountData[key], "fireballCount":fireballCount});
		}
		for (let key in fireballCountData) {
			let meteorCount = 0;
			if (meteorCountData[key] != null) {
				meteorCount = meteorCountData[key];
			}
			if (parseInt(key) > 2013)
			data.push({"year":key, "meteorCount":meteorCount, "fireballCount":fireballCountData[key]});
		}
		
		//Initialize the map
		let minYear = d3.min(data, d => d.year);
		_this.map.updateMap(_this.timelineData, minYear);
		
		//Initialize the table
		
		
		//Draw the timeline
		let timeline = d3.select("#timeline");
		let timeScale = d3.scaleBand()
			.range([0, 849])
			.padding(0.1);
		timeScale.domain(data.map(d => d.year));
		
		let timeAxis = d3.axisBottom();
		timeAxis.scale(timeScale);
		timeline.select("#timeAxis")
			.attr("transform", "translate(0," + (50) + ")")
			.call(timeAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", "rotate(-90)")
			.attr("x", -10)
			.attr("y", -5)
			.on("click", function(d) {
				//Update the map
				_this.map.updateMap(_this.timelineData, d);
				
				//Update the table
				
			});
	};
}