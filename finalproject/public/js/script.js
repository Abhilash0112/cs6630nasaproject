//load the data
let meteorite_landings_data, cneos_fireball_data, cneos_futureimpact_data, cneos_fireball_data_map = [], i = 0;
let map = new Map();
d3.json("data/world.json", function (error, world) {
	map.drawMap(world);
});

d3.csv("data/meteorite_landings_data.csv", function(error, data) {
	if (error) throw error;
    meteorite_landings_data = data;
    map.updateMap("meteors", meteorite_landings_data);
});

d3.csv("data/cneos_fireball_data.csv", function(error, data) {
	if (error) throw error;
    cneos_fireball_data = data;
    for(let iter of cneos_fireball_data)
    {
    	let factor = 1;
    	let char = iter["Longitude (deg.)"].slice().replace(/[0-9]/gi, '');
    	if(char == ".W")
    		factor = -1;
    	else
    		factor = 1;
    	iter["lng"] = factor * iter["Longitude (deg.)"].slice().replace(/[a-z]/gi, '');

    	char = iter["Latitude (deg.)"].slice().replace(/[0-9]/gi, '');
    	if(char == ".S")
    		factor = -1;
    	else
    		factor = 1;
    	iter["lat"] = factor * iter["Latitude (deg.)"].slice().replace(/[a-z]/gi, '');

    	if(iter["Latitude (deg.)"] && iter["Longitude (deg.)"])
    		cneos_fireball_data_map[i++] = iter;
    	
    }
    map.updateMap("fireballs", cneos_fireball_data_map);
});

d3.csv("data/cneos_futureimpact_data.csv", function(error, data) {
	if (error) throw error;
    cneos_futureimpact_data = data;
});

let timeline = new Timeline();
let table = new Table();