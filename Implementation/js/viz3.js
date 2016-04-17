/*
 * Viz3 Constructor
 */

Vis3 = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    console.log(this.data);

    this.initVis();
};

/*
 * Initialize visualization
 */
Vis3.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 40, bottom: 60, left: 60};
    vis.width = 960 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // Height and width for two graphs
    vis.line = {width: ~~(vis.width * 0.5), height: vis.height};
    vis.scatter = {width: ~~(vis.width * 0.5), height: vis.height};

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Add groups for two charts
    vis.lineChart = vis.svg.append("g");
    vis.scatterPlot = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.width - vis.scatter.width) + ",0)");

    // Get range of seasons to graph
    var years = [];
    this.data.forEach(function(d) {
        d.values.forEach(function(v) {
            years.push(v.season);
        })
    });
    years = years.sort().filter(function(v, i, a) {
        return (i == 0) || a[i] != a[i - 1];
    });

    // Scales
    vis.lineX = d3.scale.ordinal()
        .domain(years)
        .rangePoints([0, vis.line.width], 0);
    vis.lineY = d3.scale.linear()
        .domain([
            d3.min(vis.data, function(d) { return d3.min(d.values, function(v) {return v.tsp}) }),
            d3.max(vis.data, function(d) { return d3.max(d.values, function(v) {return v.tsp}) })
        ])
        .range([vis.line.height, 0]);

    // Axes
    vis.lineXAxis = d3.svg.axis().scale(vis.lineX).orient("bottom");
    vis.lineYAxis = d3.svg.axis().scale(vis.lineY).orient("left");

    // Line
    vis.lines = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return vis.lineX(d.season); })
        .y(function(d) { return vis.lineY(d.tsp); });

    // Draw axes
    vis.lineChart.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.line.height + ")")
        .call(vis.lineXAxis)
        .append("text")
        .attr("transform", "translate(" + vis.line.width + ",0)")
        .attr("dy", -5)
        .text("Season");
    vis.lineChart.append("g")
        .attr("class", "y-axis axis")
        .call(vis.lineYAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("True Shooting Percentage");
    vis.scatterPlot.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.line.height + ")");

    // Add lines
    var player = vis.lineChart.selectAll(".player")
        .data(vis.data)
        .enter().append("g")
        .attr("class", "player");
    player.append("path")
        .attr("class", "player_line")
        .style("stroke", strokeColor)
        .attr("d", function(d) { return vis.lines(d.values); })
    .on("mouseover", function(d) {
        d3.select("#" + d.name.replace(/ /g, "")).style("opacity", 1);
        d3.select(this).style("stroke", "red");
    })
    .on("mouseout", function(d) {
        d3.select("#" + d.name.replace(/ /g, "")).style("opacity", 0);
        d3.select(this).style("stroke", strokeColor(d));
    });

    // Add names to players
    player.append("text")
        .text(function(d) { return d.name; })
        .attr("class", "name")
        .attr("id", function(d) { return d.name.replace(/ /g, ""); })
        .attr("x", vis.line.width)
        .attr("y", function(d) { return vis.lineY(d.values[d.values.length - 1].tsp); })
        .attr("dx", 6)
        .attr("dy", 6)
        .style("opacity", 0);

    // Make year on line chart selectable
    console.log(d3.select(".x-axis").selectAll(".tick"));
    d3.select(".x-axis")
        .selectAll(".tick")
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "red");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", null);
        })
        .on("click", function(d) {
            d3.select(".x-axis").selectAll(".select")
                .attr("class", null)
                .style("stroke", null);
            d3.select(this).select("text")
                .attr("class", "select")
                .style("stroke", "black");
        });

    vis.wrangleData();

};

Vis3.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.data;

    vis.updateVis();
};

Vis3.prototype.updateVis = function() {
    var vis = this;


};

function strokeColor(d) {
    if (d.name == "Stephen Curry") {
        return "orange";
    } else if (d.name == "Average") {
        return "green";
    } else {
        return "lightgray";
    }
}


