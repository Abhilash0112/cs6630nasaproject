class Map {
	/**
     * Constructor for the Map
     */
	constructor() {
		this.projection = d3.geoNaturalEarth1().scale(150);
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
			.attr("d", path);
		d3.select("#graticules")
			.append("path")
			.datum(graticule)
			.attr("d", path);
	}
}