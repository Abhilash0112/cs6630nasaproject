class Table {
	/**
     * Constructor for the Table
     */
    constructor(map, alldata) {
        this.map = map; 
        this.timeline;
        this.alldata = alldata;
    	this.year = 2013;
        this.cell = {
            "width": 155,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };
      	this.table = d3.select("#numericdata").select("tbody");
        this.createTable();
        console.log(alldata);
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
		let table = _this.table.selectAll("tr")
						.data([{"name": "Meteorites", "data": _this.alldata.meteors}, {"name": "Fireballs", "data": _this.alldata.fireballs}, {"name": "Future Events", "data":_this.alldata.futureEvents}]);

		let tr = table.enter().append("tr")
						.on("click", function (d){
							_this.updateList(d3.select(this).attr("id"));})
						.on("mouseover", function(d){
							//_this.timeline.update(d3.select(this).attr("id"));
							_this.map.highlightMap(d3.select(this).attr("id"), "highlight");
						})
						.on("mouseout", function(d){
							//_this.timeline.update("Combined");
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

    processTableData(year, name){
    	let _this = this;
    	let i = 0, tabledata = [];
    	if(name == "Meteorites")
    	{
    		tabledata[i++] = {"name": "Meteorites", "data": _this.alldata.meteors};
    		tabledata[i++] = {"name": "meteorHeader", "data": ["Name", "Rec. Class", "Mass (g)", "Year", "Latitude", "Longitude"]};
    		for(let iter of _this.alldata.meteors)
	    	{
	    		if(iter.yr == year) {
	    			let data = [iter.name, iter.recclass, iter["mass (g)"], iter.yr, iter.reclat, iter.reclong];
	    			tabledata[i++] = {"name": iter.name, "data": data};
	    		}
	    	}
	    	tabledata[i++] = {"name": "Fireballs", "data": _this.alldata.fireballs};
	    	tabledata[i++] = {"name": "Future Events", "data": _this.alldata.futureEvents};
    	}
    	else if(name == "Fireballs")
    	{
    		tabledata[i++] = {"name": "Meteorites", "data": _this.alldata.meteors};
    		tabledata[i++] = {"name": "Fireballs", "data": _this.alldata.fireballs};
    		tabledata[i++] = {"name": "fireballHeader", "data": ["Date", "Peak Brightness", "Altitude (km)", "Velocity (km/s)", "Total Radiated Energy (J)", "Cal. Total Impact Energy (kt)", "Latitude", "Longitude"]};
    		let j = 0;
    		for(let iter of _this.alldata.fireballs)
	    	{
	    		if(iter.yr == year) {
		    		let data = [iter.date, iter.time, iter["Altitude (km)"], iter["Velocity (km/s)"], iter["Total Radiated Energy (J)"], iter["Calculated Total Impact Energy (kt)"], iter.lat, iter.lng];
		    		tabledata[i++] = {"name": "fireball"+(j++), "data": data};
	    		}	
	    	}	
	    	tabledata[i++] = {"name": "Future Events", "data": _this.alldata.futureEvents};
    	}
    	else if(name == "Future Events")
    	{
    		tabledata[i++] = {"name": "Meteorites", "data": _this.alldata.meteors};
    		tabledata[i++] = {"name": "Fireballs", "data": _this.alldata.fireballs};
    		tabledata[i++] = {"name": "Future Events", "data": _this.alldata.futureEvents};
    		tabledata[i++] = {"name": "futureHeader", "data": ["Object Designation", "Year Range", "Potential Impacts", "Impact Probability", "Vinfinity (km/s)", "H (mag)", "Estimated Diameter (km)", "Palermo Scale (cum.)", "Palermo Scale (max.)", "Torino Scale (max.)"]};
    		for(let iter of _this.alldata.futureEvents)
	    	{
	    		let data = [iter["Object Designation  "], iter["Year Range  "], iter["Potential Impacts  "], iter["Impact Probability (cumulative)"], iter["Vinfinity (km/s)"], iter["H (mag)"], iter["Estimated Diameter (km)"], iter["Palermo Scale (cum.)"], iter["Palermo Scale (max.)"], iter["Torino Scale (max.)"] ];
	    		tabledata[i++] = {"name": iter["Object Designation  "], "data": data};
	    	}		
    	}
    	return tabledata;
    }

    updateList(d) {
    	let _this = this;
    	let cellcenter = this.cell.height/2;
    	//dataProcessing
    	let tabledata = this.processTableData(_this.year, d);
    	this.tableData = tabledata;

    	let table = _this.table.selectAll("tr").data(tabledata);
    	let tr = table.enter().append("tr");
    	
    	table.exit().remove();
    	table = tr.merge(table);

    	table.attr("id", d=>d.name);
		d3.select(".expanded").classed("expanded", false);
		d3.select("#" + d).attr("class", "expanded");
		
    	/* Adding header for the expanded table */ 
		let filter = table.filter(function(d){return (d.name == "meteorHeader") || (d.name == "fireballHeader") || (d.name == "futureHeader")})
    	filter.on("click", null);
    	filter.selectAll("td").remove();

    	let th = filter.selectAll("th")
    					.data(d=>d.data);
    	let newth = th.enter()
    					.append("th");

    	th.exit().remove();
    	th = newth.merge(th);

    	th.classed("category", false)
    		.attr("COLSPAN", 1);

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
								.attr("x", 2)
								.attr("y", cellcenter);
		
		textfield.exit().remove();
		textfield = newtext.merge(textfield);
		
		textfield.attr("width", this.cell.width)
				.attr("height", this.cell.height)			
				.text(d=>d);


		/* Adding corresponding row click data to the expanded table */
    	filter = table.filter(function(d){return (d.name != "Meteorites") && (d.name != "Fireballs") && (d.name != "Future Events") && (d.name != "meteorHeader") && (d.name != "fireballHeader") && (d.name != "futureHeader")});
		filter.on("click", null);
		filter.selectAll("th").remove();
    	let td = filter.selectAll("td")
    					.data(d=>d.data);
    	let newtd = td.enter()
    					.append("td");

    	td.exit().remove();
    	td = newtd.merge(td);

    	svg = td.selectAll("svg").data(function(d){return d3.select(this).data();});
    	newSvg = svg.enter().append("svg")
    						.attr("width", this.cell.width)
							.attr("height", this.cell.height);

		svg.exit().remove();
		svg = newSvg.merge(svg);
		
		textfield = svg.selectAll("text")
						.data(function(d){return d3.select(this).data();});
		newtext = textfield.enter()
								.append("text")
								.attr("x", 0)
								.attr("y", cellcenter);
		
		textfield.exit().remove();
		textfield = newtext.merge(textfield);
		
		textfield.attr("width", this.cell.width)
				.attr("height", this.cell.height)			
				.text(d=>d);


		/* Adding the three cateogies available to the table */
		filter = table.filter(function(d){return (d.name == "Meteorites") || (d.name == "Fireballs") || (d.name == "Future Events")})
		filter.on("click", function (d){
			_this.updateList(d3.select(this).attr("id"));
		});
		filter.selectAll("td").remove();
    	th = filter.selectAll("th")
    					.data(function(d){return d3.select(this).data();});
    	newth = th.enter()
    				.append("th");

    	th.exit().remove();
    	th = newth.merge(th);

    	th.attr("class", "category").attr("COLSPAN", "100%");

		svg = th.selectAll("svg").data(function(d){return d3.select(this).data();});
    	newSvg = svg.enter().append("svg")
    						.attr("width", this.cell.width)
							.attr("height", this.cell.height);

		svg.exit().remove();
		svg = newSvg.merge(svg);
		
		textfield = svg.selectAll("text")
						.data(function(d){return d3.select(this).data();});
		newtext = textfield.enter()
								.append("text")
								.attr("x", 0)
								.attr("y", cellcenter);
		
		textfield.exit().remove();
		textfield = newtext.merge(textfield);
		
		textfield.attr("width", this.cell.width)
				.attr("height", this.cell.height)			
				.text(d=>d.name);


    }
}