class Map {
	/**
     * Constructor for the Map
     */
	constructor() {
		this.projection = d3.geoEquirectangular().scale(150).translate([420, 210]);
    	this.meteors = d3.select("#meteors");
    	this.fireballs = d3.select("#fireballs");
    };
	
	/**
     * Renders the map
     * @param JSON data representing all countries
     */
    drawMap(world) {
		let features = topojson.feature(world, world.objects.countries)
			.features;
		let map = d3.select("#map");
		let path = d3.geoPath()
			.projection(this.projection);
		let graticule = d3.geoGraticule();
		map.selectAll("path")
			.data(features)
			.enter()
			.append("path")
			.attr("id", function(d) {
				return d.id;
			})
			.attr("d", path)
			.classed("countries", true);
		d3.select("#graticules")
			.append("path")
			.datum(graticule)
			.attr("d", path);
	}

    updateMap(vizData, year) {
    	let _this = this;
    	let markers, newCircle;
		
		let mapData = [];
		mapData.meteors = vizData.meteors.filter(function(d) {
			let datetime = d.year.split(" ");
			let date = datetime[0].split("/");
			let dYear = date[2];
			if (dYear === year) return d;
		});
		mapData.fireballs = vizData.fireballs.filter(function(d) {
			let datetime = d["Peak Brightness Date/Time (UT)"].split(" ");
			let date = datetime[0].split("-");
			let dYear = date[0];
			if (dYear === year) return d;
		});
		mapData.futureEvents = vizData.futureEvents;
		
    	if(mapData.meteors){
			
			markers = _this.meteors.selectAll(".meteors").data(mapData.meteors);
			newCircle = markers.enter().append("circle");

			markers.exit().remove();
			markers = newCircle.merge(markers);

			markers.attr("cx", function (d) {
						return _this.projection([d.reclong, d.reclat])[0];
					})
					.attr("cy", function (d) {
						return _this.projection([d.reclong, d.reclat])[1];
					})
					.attr("r", 1)
					.attr("class", "meteors");
    	}
    	if(mapData.fireballs){
    		let min_small = d3.min(mapData.fireballs, function(d){return parseFloat(d["Calculated Total Impact Energy (kt)"]);}) * 1000;
    		let max_small = d3.max(mapData.fireballs, function(d){
    			let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
    			if(val <= 1)
    				return val;
    			return 0;
    		}) * 1000;

    		let min_big = d3.min(mapData.fireballs, function(d){
    			let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
    			if(val > 1)
    				return val;
    			return 0;
    		}) * 1000;
    		let max_big = d3.max(mapData.fireballs, function(d){
    			let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
    			if(val > 1)
    				return val;
    			return 0;
    		}) * 1000;

    		let bigScale = d3.scaleLinear()
    							.domain([min_big, max_big])
    							.range([6, 12]);

			let smallScale = d3.scaleLinear()
								.domain([min_small, max_small])
								.range([2,5]);
			

			markers = _this.fireballs.selectAll(".fireballs").data(mapData.fireballs);
			newCircle = markers.enter().append("circle");

			markers.exit().remove();
			markers = newCircle.merge(markers);

			markers.attr("cx", function (d) {
						return  _this.projection([d["lng"], d["lat"]])[0];
					})
					.attr("cy", function (d) {
						return _this.projection([d["lng"], d["lat"]])[1];
					})
					.attr("r", function(d){
						let val = parseFloat(d["Calculated Total Impact Energy (kt)"]);
						if(val <= 1)
							return smallScale(val * 1000);
						return bigScale(val * 1000);
					})
					.attr("id", (d,i)=>"fireball"+i)
					.attr("class", "fireballs");
    	}
	}

	highlightMap(classH, status)
	{
		let _this = this;
		if(status == "removeHighlight")
		{
			_this.meteors.selectAll(".meteors").classed("selected", false).classed("background", false).classed("meteors", true);
			_this.fireballs.selectAll(".fireballs").classed("selected", false).classed("background", false).classed("fireballs", true);
		}
		else if(classH == "Meteorites")
		{
			_this.meteors.selectAll(".meteors").classed("selected", true);
			_this.fireballs.selectAll(".fireballs").classed("background", true);
		}
		else if(classH == "Fireballs")
		{
			_this.meteors.selectAll(".meteors").classed("background", true);
			_this.fireballs.selectAll(".fireballs").classed("selected", true);
		}
	}
}