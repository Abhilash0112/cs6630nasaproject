//load the data
let meteorite_landings_data, cneos_fireball_data, cneos_futureimpact_data, cneos_fireball_data_map = [], i = 0;
let map = new Map();

/*---------------------------------------------------- Drawing The Map ---------------------------------------------------------*/
d3.json("data/world.json", function (error, world) {
	map.drawMap(world);
});

/*---------------------------------------------------- Loading Fireball Data ---------------------------------------------------------*/
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
});

/*---------------------------------------------------- Loading Future Impact Data ---------------------------------------------------------*/
d3.csv("data/cneos_futureimpact_data.csv", function(error, data) {
	if (error) throw error;
    cneos_futureimpact_data = data;
});

/*---------------------------------------------------- Loading Meteorite Data ---------------------------------------------------------*/
d3.csv("data/meteorite_landings_data.csv", function(error, data) {
	if (error) throw error;
    meteorite_landings_data = data;


    let allTableData = {"meteros": meteorite_landings_data, "fireballs": cneos_fireball_data, "futureEvents": cneos_futureimpact_data};
	let allTimelineData = {"meteors": meteorite_landings_data, "fireballs": cneos_fireball_data_map, "futureEvents": cneos_futureimpact_data};
	let allMapData = {"meteors": meteorite_landings_data, "fireballs": cneos_fireball_data_map};
	//map.updateMap(allMapData);
	
	let timeline = new Timeline(allTimelineData, map);
	timeline.update();
});


/*---------------------------------------------------- Creating default visual charts ---------------------------------------------------------*/

let table = new Table(map, timeline);