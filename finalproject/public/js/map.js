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

    updateMap(type, vizData) {
    	let _this = this;
    	let markers, newCircle;
    	if(vizData && type == "meteors"){
			
			markers = _this.meteors.selectAll(".meteros").data(vizData);
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
					.attr("class", d=>type);
    	}
    	else if(vizData && type == "fireballs"){
    		let min_small = d3.min(vizData, function(d){return parseFloat(d["Calculated Total Impact Energy (kt)"]);}) * 1000;
    		let max_small = d3.max(vizData, function(d){
    			let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
    			if(val <= 1)
    				return val;
    			return 0;
    		}) * 1000;

    		let min_big = d3.min(vizData, function(d){
    			let val =  parseFloat(d["Calculated Total Impact Energy (kt)"]);
    			if(val > 1)
    				return val;
    			return 0;
    		}) * 1000;
    		let max_big = d3.max(vizData, function(d){
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
			

			markers = _this.fireballs.selectAll(".fireballs").data(vizData);
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
					.attr("class", d=>type);
    	}
	}
}