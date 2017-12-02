//load the data
let meteorite_landings_data, cneos_fireball_data, cneos_futureimpact_data, cneos_fireball_data_map = [], i = 0;

/*---------------------------------------------------- Creating default visual charts ---------------------------------------------------------*/
let map = new Map();
let chart;
let timeline;
let table;

/*---------------------------------------------------- Drawing The Map ---------------------------------------------------------*/
d3.json("data/world.json", function (error, world) {
	map.drawMap(world);
});

/*---------------------------------------------------- Loading Fireball Data ---------------------------------------------------------*/
d3.csv("data/cneos_fireball_data.csv", function(error, data) {
	if (error) throw error;
    cneos_fireball_data = data;
    let i = 0;
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
    
        /* Processing year*/
        if(iter["Peak Brightness Date/Time (UT)"] != "" || iter["Peak Brightness Date/Time (UT)"] != " "){
            let datetime = iter["Peak Brightness Date/Time (UT)"].split(" ");
            let date = datetime[0].split("-");
            iter["yr"] = date[0];
            iter["date"] = datetime[0];
            iter["time"] = datetime[1];
        }

        if(iter["Latitude (deg.)"] && iter["Longitude (deg.)"])
            cneos_fireball_data_map[i++] = iter;	

        iter["id"] = "fireball"+(i++);
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
	let meteorite_landings_data_map = [];
    for(let iter of meteorite_landings_data)
    {
        if(iter.year != "" || iter.year != " "){
            let datetime = iter.year.split(" ");
            let date = datetime[0].split("/");
            iter["yr"] = date[2];
            iter["time"] = datetime[1];
            if(parseFloat(iter["reclat"]) == 0.000000)
                iter["reclat"] = "-";
            if(parseFloat(iter["reclong"]) ==  0.000000)
                iter["reclong"] = "-";
            
			if (iter["reclat"] != "-" && iter["reclong"] != "-")
				meteorite_landings_data_map.push(iter);
        }
    }

    let allTableData = {"meteors": meteorite_landings_data, "fireballs": cneos_fireball_data, "futureEvents": cneos_futureimpact_data};
	let allTimelineData = {"meteors": meteorite_landings_data, "fireballs": cneos_fireball_data, "futureEvents": cneos_futureimpact_data};
	let allMapData = {"meteors": meteorite_landings_data_map, "fireballs": cneos_fireball_data_map};
	
	map.mapData = allMapData;
	chart = new Chart(allTableData, {"meteors": ["(Select Statistic)", "Number Vs. Mass (g)", "Number Vs. Class", "Number Vs. Location"], 
                                     "fireballs": ["(Select Statistic)", "Number Vs. Radiated Energy", "Number Vs. Impact Energy"], 
                                     "futureEvents": ["(Select Statistic)", "ObjectDesignation Vs. Potential Impacts", "ObjectDesignation Vs. Impact Probability", 
                                                      "ObjectDesignation Vs. Vinfinity (km/s)", "ObjectDesignation Vs. Magnitude", "ObjectDesignation Vs. Estimated Diameter (km)"/*,
                                                      "ObjectDestination Vs Palermo Scale (cumulative)", "ObjectDestination Vs Palermo Scale (max.)"*/], 
                                     "default" : ["Select a category in the table to explore", ""]});
	table = new Table(map, allTableData, chart);
	timeline = new Timeline(allTimelineData, map, table, chart);
	
	table.timeline = timeline;
});

function chooseData() {
    let e = document.getElementById("columnSelect");
    chart.updateSelection(e.selectedIndex) 
};

function chooseDataSize() {
    let e1 = document.getElementById("columnSelect");
    let e2 = document.getElementById("columnSelect2");
    chart.futureEventCharts(e1.selectedIndex, parseInt(e2.options[e2.selectedIndex].value));
};
