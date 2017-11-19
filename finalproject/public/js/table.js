class Table {
	/**
     * Constructor for the Table
     */
    constructor(map, timeline) {

        this.map = map; 
        this.timeline = timeline;

        this.cell = {
            "width": 70,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };
        this.createTable();
    };
    
    max(a, b){
		return a>b?a:b;
	};
	
	min(a, b){
		return a<b?a:b;
	};

	createTable() {
		let _this = this;
		let table = d3.select("#numericdata").select("tbody").selectAll("tr").data(["Meteorites", "Fireballs", "Future Events"]);

		let tr = table.enter().append("tr")
						.on("click", (d, i)=>this.updateList(i))
						.on("mouseover", function(d){
							_this.timeline.update(d3.select(this).attr("id"));
							_this.map.highlightMap(d3.select(this).attr("id"), "highlight");
						})
						.on("mouseout", function(d){
							_this.timeline.update("Combined");
							_this.map.highlightMap(d3.select(this).attr("id"), "removeHighlight");
						});

		table.exit().remove();
		table = tr.merge(table);
		
		table.attr("id", d=>d);

		let td = table.selectAll("td").data(function(d){return d3.select(this).data();});
		let newtd = td.enter().append("td");

		td.exit().remove();
		td = newtd.merge(td);

		td.text(d=>d)
			.attr("colspan", 4);
    }
}