//load the data
d3.csv("data/data.csv", function(error, data) {
	let map = new Map();
	d3.json("data/world.json", function (error, world) {
        if (error) throw error;
        map.drawMap(world);
    });
	
	let timeline = new Timeline();
	let table = new Table();
});