class Table {
	/**
     * Constructor for the Table
     */
    constructor(map, alldata, chart) {
        this.map = map; 
        this.alldata = alldata;
		this.chart = chart;
        this.timeline;
    	this.year = 2013;
        this.cell = {
            "width": 160.2,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };
      	this.table = d3.select("#numericdata");
        this.createTable();
        this.category = "";
    };
    
    max(a, b){
		return a>b?a:b;
	};
	
	min(a, b){
		return a<b?a:b;
	};

	yearSelected(d) {
		this.year = d;
	}

	createTable() {
		let _this = this;
		let table = _this.table.select("thead").selectAll("tr")
						.data([{"name": "Meteorites", "data": _this.alldata.meteors}, {"name": "Fireballs", "data": _this.alldata.fireballs}, {"name": "Future Events", "data":_this.alldata.futureEvents}]);

		let tr = table.enter().append("tr")
						.on("click", function (d){
							_this.updateList(d3.select(this).attr("id"));
							_this.chart.updateType(d3.select(this).attr("id"));
						})
						.on("mouseover", function(d){
							_this.map.highlightMap(d3.select(this).attr("id"), "highlight");
						})
						.on("mouseout", function(d){
							_this.map.highlightMap(d3.select(this).attr("id"), "removeHighlight");
						});

		table.exit().remove();
		table = tr.merge(table);
		
		table.attr("id", d=>d.name);

		let th = table.selectAll("th").data(function(d){return d3.select(this).data();});
		let newth = th.enter().append("th");

		th.exit().remove();
		th = newth.merge(th);

		th.attr("class", "category").attr("COLSPAN", 4);

		let svg = th.selectAll("svg").data(function(d){return d3.select(this).data();});
    	let newSvg = svg.enter().append("svg")
    						.attr("width", this.cell.width)
							.attr("height", this.cell.height);

		svg.exit().remove();
		svg = newSvg.merge(svg);
		
		let textfield = svg.selectAll("text")
						.data(function(d){return d3.select(this).data();});
		let newtext = textfield.enter()
								.append("text")
								.attr("x", 0)
								.attr("y", _this.cell.height/2);
		
		textfield.exit().remove();
		textfield = newtext.merge(textfield);
		
		textfield.attr("width", this.cell.width)
				.attr("height", this.cell.height)			
				.text(d=>d.name);


    }

    getLeadingRows(name){
    	let tabledata = [];
    	if(this.category == name)
    	{
    		tabledata[0] = {"name": "Meteorites", "data": this.alldata.meteors};
    		tabledata[1] = {"name": "Fireballs", "data": this.alldata.fireballs};
			tabledata[2] = {"name": "Future Events", "data": this.alldata.futureEvents};
    	}
    	else if(name == "Meteorites")
    	{
    		tabledata[2] = {"name": "Meteorites", "data": this.alldata.meteors};
    		tabledata[0] = {"name": "Fireballs", "data": this.alldata.fireballs};
			tabledata[1] = {"name": "Future Events", "data": this.alldata.futureEvents};
    	}
    	else if(name == "Fireballs")
    	{
    		tabledata[0] = {"name": "Meteorites", "data": this.alldata.meteors};
			tabledata[1] = {"name": "Future Events", "data": this.alldata.futureEvents};
    		tabledata[2] = {"name": "Fireballs", "data": this.alldata.fireballs};
    	}
    	else
    	{
    		tabledata[0] = {"name": "Meteorites", "data": this.alldata.meteors};
    		tabledata[1] = {"name": "Fireballs", "data": this.alldata.fireballs};
			tabledata[2] = {"name": "Future Events", "data": this.alldata.futureEvents};
    	}
    	
    	return tabledata;
    }

    processTableData(year, name){
    	let _this = this;
    	let i = 0, tabledata = [];
    	let action;
    	if(this.category == name)
    		action = "collapse";
    	else
    		action = "expand";

    	if(action == "expand")
    	{
	    	if(name == "Meteorites")
	    	{
	    		tabledata[i++] = {"name": "meteorHeader", "data": ["Name", "Class", "Mass (g)", "Latitude", "Longitude"]};
	    		for(let iter of _this.alldata.meteors)
		    	{
		    		if(iter.yr == year) {
		    			let data = [iter.name, iter.recclass, iter["mass (g)"], iter.reclat, iter.reclong];
		    			tabledata[i++] = {"name": iter.name, "data": data};
		    		}
		    	}
	    	}
	    	else if(name == "Fireballs")
	    	{
	    		let j = 0;
	    		tabledata[i++] = {"name": "fireballHeader", "data": ["Date", "Time", "Altitude (km)", "Velocity (km/s)", "Radiated Energy (J)", "Impact Energy (kt)", "Latitude", "Longitude"]};	    		
	    		for(let iter of _this.alldata.fireballs)
		    	{
		    		if(iter.yr == year) {
			    		let data = [iter.date, iter.time, iter["Altitude (km)"], iter["Velocity (km/s)"], iter["Total Radiated Energy (J)"], iter["Calculated Total Impact Energy (kt)"], iter.lat, iter.lng];
			    		tabledata[i++] = {"name": iter.id, "data": data};
		    		}	
		    	}	
	    	}
	    	else if(name == "Future Events")
	    	{
	    		tabledata[i++] = {"name": "futureHeader", "data": ["Object Designation", "Year Range", "Impacts", "Probability", "Velocity (km/s)", "Mag.", "Est. Diameter (km)", "Palermo (cum.)", "Palermo (max.)", "Torino (max.)"]};
	    		for(let iter of _this.alldata.futureEvents)
		    	{
		    		let data = [iter["Object Designation  "], iter["Year Range  "], iter["Potential Impacts  "], iter["Impact Probability (cumulative)"], iter["Vinfinity (km/s)"], iter["H (mag)"], iter["Estimated Diameter (km)"], iter["Palermo Scale (cum.)"], iter["Palermo Scale (max.)"], iter["Torino Scale (max.)"] ];
		    		tabledata[i++] = {"name": iter["Object Designation  "], "data": data};
		    	}		
	    	}
	    	this.category = name;
    	}
    	else if(action == "collapse")
    	{
    		this.category = "";
 			tabledata = null;
 	   	}
    	return tabledata;
    }

    getHeader(name) {
    	let tabledata = [];
    	if(this.category == name)
    		tabledata = null;
    	else if(name == "Meteorites")
    		tabledata[0] = {"name": "meteorHeader", "data": ["Name", "Rec. Class", "Mass (g)", "Latitude", "Longitude"]};
    	else if(name == "Fireballs")
    		tabledata[0] = {"name": "fireballHeader", "data": ["Date", "Peak Brightness", "Altitude (km)", "Velocity (km/s)", "Total Radiated Energy (J)", "Cal. Total Impact Energy (kt)", "Latitude", "Longitude"]};	    		
    	else
    		tabledata[0] = {"name": "futureHeader", "data": ["Object Designation", "Year Range", 
								    						"Potential Impacts", "Impact Probability", "Vinfinity (km/s)", "H (mag)", 
								    						"Estimated Diameter (km)", "Palermo Scale (cum.)", "Palermo Scale (max.)", "Torino Scale (max.)"]};
    	return "";
    	return tabledata;
    }

    updateList(data) {
    	let _this = this;
    	let cellcenter = this.cell.height/2;

 		if(data == "timelineUpdate")
 		{
 			data = this.category;
 			this.category = "";
 		}
 		
 		let chartOptions = data;

 		if(data == this.category)
 			chartOptions = "default";

		this.chart.updateType(chartOptions);
		chooseData();
    	//dataProcessing
    	let leadingRows = this.getLeadingRows(data);
    	let header = this.getHeader(data);
    	let tabledata = this.processTableData(_this.year, data);

    	let columnSpan = {"Meteorites": 9, "Fireballs": 9, "Future Events": 9};
		let columnWidth = {"Meteorites": "20%", "Fireballs": "20%", "Future Events": "20%"};
    	
    	/*Updating data to table > thead*/
    	if(leadingRows)
    	{
    		let tableHead = _this.table.select("thead").selectAll("tr").data(leadingRows);
	    	let trHead = tableHead.enter().append("tr");

	    	tableHead.exit().remove();
	    	tableHead = trHead.merge(tableHead);


			tableHead.attr("id", d=>d.name)
					 .on("click", function (d){
						_this.updateList(d3.select(this).attr("id"));
					 });

	    	let thHead = tableHead.selectAll("th")
	    					.data(function(d){return d3.select(this).data();});
	    	let newthHead = thHead.enter()
	    				.append("th");

	    	thHead.exit().remove();
	    	thHead = newthHead.merge(thHead);

	    	thHead.attr("class", "category").attr("COLSPAN", d=>columnSpan[d.name]);

			let svgHead = thHead.selectAll("svg").data(function(d){return d3.select(this).data();});
	    	let newSvgHead = svgHead.enter().append("svg")
	    						.attr("width", this.cell.width)
								.attr("height", this.cell.height);

			svgHead.exit().remove();
			svgHead = newSvgHead.merge(svgHead);
			
			let textfieldHead = svgHead.selectAll("text")
							.data(function(d){return d3.select(this).data();});
			let newtextHead = textfieldHead.enter()
									.append("text")
									.attr("x", 0)
									.attr("y", cellcenter);
			
			textfieldHead.exit().remove();
			textfieldHead = newtextHead.merge(textfieldHead);
			
			textfieldHead.attr("width", this.cell.width)
					.attr("height", this.cell.height)			
					.text(d=>d.name);
		}
		else {
			_this.table.select("thead").selectAll("tr").remove();
		}

		/*Updating data to table > tbody*/
		if(header)
    	{
    		let tableBody = _this.table.select("tbody").selectAll("tr").data(header);
	    	let trBody = tableBody.enter().append("tr");

	    	tableBody.exit().remove();
	    	tableBody = trBody.merge(tableBody);


			tableBody.attr("id", d=>d.name);

	    	let thBody = tableBody.selectAll("th")
	    					.data(d=>d.data);
	    	let newthBody = thBody.enter()
	    				.append("th");

	    	thBody.exit().remove();
	    	thBody = newthBody.merge(thBody);

	    	thBody.attr("COLSPAN", 1);

			let svgBody = thBody.selectAll("svg").data(function(d){return d3.select(this).data();});
	    	let newSvgBody = svgBody.enter().append("svg")
	    						.attr("width", this.cell.width)
								.attr("height", this.cell.height);

			svgBody.exit().remove();
			svgBody = newSvgBody.merge(svgBody);
			
			let textfieldBody = svgBody.selectAll("text")
							.data(function(d){return d3.select(this).data();});
			let newtextBody = textfieldBody.enter()
									.append("text")
									.attr("x", 0)
									.attr("y", cellcenter);
			
			textfieldBody.exit().remove();
			textfieldBody = newtextBody.merge(textfieldBody);
			
			textfieldBody.attr("width", this.cell.width)
					.attr("height", this.cell.height)			
					.text(d=>d);
		}
		else {
			_this.table.select("tbody").selectAll("tr").remove();
		}

		/*Updating data to table > tfoot*/
		if(tabledata)
		{
	    	let tableFoot = _this.table.select("tfoot").selectAll("tr").data(tabledata);
	    	let trFoot = tableFoot.enter().append("tr");
	    	
	    	tableFoot.exit().remove();
	    	tableFoot = trFoot.merge(tableFoot);

	    	tableFoot.attr("id", d=>d.name)
	    			 .on("mouseover", function(d){
	    			 		if(_this.category != "Future Events" && d.name != "fireballHeader" && d.name != "meteorHeader")
	    			 		{
								_this.map.highlightObject(d.name.replace(/ /g, ""), _this.category, "highlight");
							}
						})
					.on("mouseout", function(d){
						if(_this.category != "Future Events" && d.name != "fireballHeader" && d.name != "meteorHeader")
	    			 		{
								_this.map.highlightObject(d.name.replace(/ /g, ""), _this.category, "removeHighlight");
							}
						});

	    	let tdFoot = tableFoot.selectAll("td")
	    					.data(d=>d.data);
	    	let newtdFoot = tdFoot.enter()
	    					.append("td");

	    	tdFoot.exit().remove();
	    	tdFoot = newtdFoot.merge(tdFoot);

	    	tdFoot.classed("category", false)
	    		.attr("COLSPAN", 1);

	    	let svgFoot = tdFoot.selectAll("svg").data(function(d){return d3.select(this).data();});
	    	let newSvgFoot = svgFoot.enter().append("svg")
	    						.attr("width", this.cell.width)
								.attr("height", this.cell.height);

			svgFoot.exit().remove();
			svgFoot = newSvgFoot.merge(svgFoot);
			
			let textfieldFoot = svgFoot.selectAll("text")
							.data(function(d){return d3.select(this).data();});
			let newtextFoot = textfieldFoot.enter()
									.append("text")
									.attr("x", 2)
									.attr("y", cellcenter);
			
			textfieldFoot.exit().remove();
			textfieldFoot = newtextFoot.merge(textfieldFoot);
			
			textfieldFoot.attr("width", this.cell.width)
					.attr("height", this.cell.height)			
					.text(d=>d);
					
			if(_this.category === "Future Events") {
				d3.select("#futureHeader")
					.selectAll("td")
					.data([	"Object Designation - The temporary designation or permanent number for the object.",
							"Year Range - The time span over which impacts have been detected for the object.",
							"Potential Impacts - The number of potential impacts detected by the JPL Sentry System.",
							"Impact Probability (cumulative) - The sum of the impact probabilities of all detected potential impacts.",
							"Velocity - The velocity, in kilometers per second, of the object relative to Earth, assuming a massless Earth.",
							"Absolute Magnitude - The apparent magnitude, a measure of intrinsic brightness, of the object.",
							"Estimated Diameter - The estimated diameter, in kilometers, of the object.",
							"Palermo Scale (cumulative) - The cumulative hazard rating according to the Palermo technical impact hazard scale.",
							"Palermo Scale (maximum) - The maximum hazard rating according to the Palermo technical impact hazard scale.",
							"Torino Scale (maximum) - The maximum detected hazard rating according to the Torino impact hazard scale."])
					.attr("title", function(d) { return d + " [3]"; });
							
			} else if (_this.category === "Fireballs") {
				d3.select("#fireballHeader")
					.selectAll("td")
					.data([	"Date - The date of peak brightness for the event.",
							"Time - The time of peak brightness for the event.",
							"Altitude - The altitude, in kilometers, above the reference geoid for this event.",
							"Velocity - The magnitude of the meteor's pre-impact velocity in kilometers per second.",
							"Total Radiated Energy - The approximate total radiated energy of the event in Joules.",
							"Calculated Total Impact Energy - The impact energy of the event in kilotons of TNT.",
							"Latitude - The latitude of the event.",
							"Longitude - The longitude of the event."])
					.attr("title", function(d) { return d + " [2]"; });
			} else if (_this.category === "Meteorites") {
				d3.select("#meteorHeader")
					.selectAll("td")
					.data([	"Name - The name of the meteorite.",
							"Class - The classification of the meteorite.",
							"Mass - The mass of the meteorite in grams.",
							"Latitude - The latitude of where the meteorite was recovered.",
							"Longitude - The longitude of where the meteorite was recovered."])
					.attr("title", function(d) { return d + " [1]"; });
			}
		}
		else{
			_this.table.select("tfoot").selectAll("tr").remove();
		}
    }
}