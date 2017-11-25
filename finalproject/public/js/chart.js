class Chart {
	/**
     * Constructor for the chart
     */
	constructor(allData) {
		this.allData = allData;
		this.category;
    };
	
	/**
	 * Updates the chart based on the selected column of data
	 *
	 * @param column - The column of data to visualize
	 */
	updateChart(column) {
		
	};
	
	/**
	 * Called from the table to update the selected type of data
	 *
	 * @param type - The type of data: meteorites, fireballs, or future events
	 */
	updateType(type) {
		//TODO: Update the chart to show the expanded category of data in the table
		this.category = type;
	};
	
	/**
	 * Called from the timeline to update the selected year
	 *
	 * @param year - The selected year
	 */
	updateYear(year) {
		//TODO: Update the chart's data to reflect the selected year in the timeline
	};
}