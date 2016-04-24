/*
 * Viz3 Constructor
 */

Vis3 = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
};

/*
 * Initialize visualization
 */
Vis3.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 10, bottom: 60, left: 50};
    vis.width = 750 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    // Height and width for two graphs
    vis.line = {width: ~~(vis.width * 0.43), height: vis.height};
    vis.scatter = {width: ~~(vis.width * 0.4), height: vis.height};

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

    // Get range of seasons, shots, and minutes played for graph
    var years = [];
    var shots = [];
    var minutes = [];
    this.data.forEach(function(d) {
        d.values.forEach(function(v) {
            years.push(v.season);
            shots.push(v.fga);
            minutes.push(v.mp);
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
    vis.scatterX = d3.scale.linear()
        .domain([0, d3.max(shots) + 1])
        .range([0, vis.scatter.width]);
    vis.scatterY = d3.scale.linear()
        .domain(vis.lineY.domain())
        .range([vis.scatter.height, 0]);
    vis.scatterR = d3.scale.linear()
        .domain(d3.extent(minutes))
        .range([5, 15]);

    // Axes
    vis.lineXAxis = d3.svg.axis().scale(vis.lineX).orient("bottom");
    vis.lineYAxis = d3.svg.axis().scale(vis.lineY).orient("left");
    vis.scatterXAxis = d3.svg.axis().scale(vis.scatterX).orient("bottom");
    vis.scatterYAxis = d3.svg.axis().scale(vis.scatterY).orient("left");

    // Line
    vis.lines = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return vis.lineX(d.season); })
        .y(function(d) { return vis.lineY(d.tsp); });

    // Add lines
    var player = vis.lineChart.selectAll(".player")
        .data(vis.data)
        .enter().append("g")
        .attr("class", "player");
    player.append("path")
        .attr("class", function(d) { return d.name.replace(/ |'/g, "") + " player_line"; })
        .style("stroke", color)
        .attr("d", function(d) { return vis.lines(d.values); })
        .on("mouseover", vis.mouseover)
        .on("mouseout", vis.mouseout);

    // Add names to players
    player.append("text")
        .text(function(d) { return d.name.replace(/[A-Za-z]* /g, ""); })
        .attr("class", function(d) { return d.name.replace(/ |'/g, ""); })
        .attr("x", vis.line.width)
        .attr("y", function(d) { return vis.lineY(d.values[d.values.length - 1].tsp); })
        .attr("dx", 6)
        .attr("dy", 6)
        .style("opacity", 0);

    // Make sure Steph Curry's name always shows
    d3.select(d3.selectAll(".StephenCurry")[0][1]).style("opacity", 1);

        // Draw axes
    vis.lineChart.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.line.height + ")")
        .call(vis.lineXAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.3em")
        .attr("dy", "0.8em")
        .attr("transform", "rotate(-20)");
    vis.lineChart.select(".x-axis")
        .append("text")
        .attr("transform", "translate(" + vis.line.width + ",0)")
        .attr("dy", -5)
        .text("Season");
    vis.lineChart.append("g")
        .attr("class", "y-axis axis")
        .call(vis.lineYAxis)
        .append("text")
        .attr("transform", "translate(0," + vis.line.height + ") rotate(-90)")
        .attr("dx", 5)
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("TSP");
    vis.scatterPlot.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.line.height + ")")
        .call(vis.scatterXAxis)
        .append("text")
        .attr("transform", "translate(" + vis.scatter.width + ",0)")
        .attr("dy", -5)
        .text("Shots / 36 Min");
    vis.scatterPlot.append("g")
        .attr("class", "y-axis axis")
        .call(vis.scatterYAxis)
        .append("text")
        .attr("transform", "translate(0," + vis.scatter.height + ") rotate(-90)")
        .attr("dx", 5)
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("TSP");

    // Draw titles
    vis.lineChart.append("text")
        .attr("class", "titletext")
        .attr("x", vis.line.width / 2)
        .attr("y", -20)
        .text("True Shooting Percentage (TSP) Over Time");
    vis.scatterPlot.append("text")
        .attr("class", "titletext")
        .attr("x", vis.scatter.width / 2)
        .attr("y", -20)
        .text("2015-16 TSP vs. Shots / 36 Min");

    // Make year on line chart selectable
    d3.select(".x-axis")
        .selectAll(".tick")
        .on("mouseover", function(d) {
            d3.select(this).style("stroke", "red");
            vis.showDotOnLine(d);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", null);
            vis.removeDotFromLine();
        })
        .on("click", function(d) {
            d3.select(".x-axis").selectAll(".select")
                .attr("class", null)
                .style("stroke", null);
            d3.select(this).select("text")
                .attr("class", "select")
                .style("stroke", "black");
            vis.wrangleData();
        });

    // Set most recent year as default active
    d3.select(".x-axis").selectAll("text")[0].forEach(function(d) {
        if (d.__data__ == years[years.length - 1]) {
            d3.select(d).attr("class", "select").style("stroke", "black");
        }
    });

    // Set average player as default active
    vis.activePlayer = "Average";

    vis.wrangleData();

};

Vis3.prototype.wrangleData = function() {
    var vis = this;
    vis.season = d3.select(".select").text();
    vis.displayData = [];

    // Extract data for scatterplot
    vis.data.forEach(function(d) {
        d.values.forEach(function(v) {
            if (v.season == vis.season) {
                var datum = Object.assign({}, v);
                datum.name = d.name;
                vis.displayData.push(datum);
            }
        })
    });

    vis.updateVis();
};

Vis3.prototype.updateVis = function() {
    var vis = this;

    // Label original circles as old and fade
    vis.scatterPlot.selectAll("circle")
        .attr("class", function(d) { return d.name.replace(/ |'/g, "") + " old"; });

    // Add circles at correct position on line graph
    var xStart = vis.lineX(vis.season) - (vis.width - vis.scatter.width);
    var circles = vis.scatterPlot.selectAll(".new").data(vis.displayData);
    circles.enter().append("circle")
        .attr("cx", xStart)
        .attr("cy", function(d) {return vis.scatterY(d.tsp)})
        .attr("r", 5)
        .attr("class", function(d) { return d.name.replace(/ |'/g, "") + " new"; })
        .on("mouseover", vis.mouseover)
        .on("mouseout", vis.mouseout)
        .attr("fill", color)
        .attr("stroke", "white")
        .on("click", function(d) {
            vis.activePlayer = d.name;
            vis.updateTable();
        });

    // Transition new to proper place on scatterplot
    var duration = ~~(1.8 * (-158 - xStart) + 1500);
    vis.scatterPlot.selectAll(".old").transition().duration(duration).style("fill-opacity", 0.2);
    circles.transition().duration(duration).delay(function(d, i) { return 40 * i; })
        .attr("cx", function(d) {return vis.scatterX(d.fga)})
        .attr("cy", function(d) {return vis.scatterY(d.tsp)})
        .attr("r", function(d) {return vis.scatterR(d.mp)});

    // Remove old circles
    vis.scatterPlot.selectAll(".old").transition().delay(duration + 40 * (circles.length + 10)).remove();

    // Change title of scatterplot
    vis.scatterPlot.select(".titletext")
        .text(vis.season + " TSP vs. Shots / 36 Min");

    // Set table name
    d3.select("#tableName").text(vis.season + " Season");
    vis.activePlayer = "Average";
    vis.updateTable();
};

Vis3.prototype.updateTable = function() {
    var vis = this;

    // Default table to Curry and Average data
    vis.displayData.forEach(function (d) {
        if (d.name == "Stephen Curry") {
            $("#curryName").text(d.name);
            $("#curryTSP").text(d.tsp.toFixed(3));
            $("#curryShotsPer").text(d.fga.toFixed(1));
            $("#curryMinutes").text(d.mp);
        } else if (d.name == vis.activePlayer) {
            $("#compareName").text(d.name);
            $("#compareTSP").text(d.tsp.toFixed(3));
            $("#compareShotsPer").text(d.fga.toFixed(1));
            $("#compareMinutes").text(d.mp);
        }
    });
}

Vis3.prototype.showDotOnLine = function(season) {
    var vis = this;
    var data = [];

    // Extract data for scatterplot
    vis.data.forEach(function(d) {
        d.values.forEach(function(v) {
            if (v.season == season) {
                var datum = Object.assign({}, v);
                datum.name = d.name;
                data.push(datum);
            }
        })
    });

    var circles = vis.lineChart.selectAll("circle").data(data);
    circles.enter().append("circle")
        .attr("cx", vis.lineX(season))
        .attr("cy", function(d) {return vis.lineY(d.tsp)})
        .attr("r", 5)
        .attr("class", "lineDot")
        .attr("fill", color)
        .attr("stroke", "white");
};

Vis3.prototype.removeDotFromLine = function() {
    d3.selectAll(".lineDot").remove();
};

Vis3.prototype.mouseover = function(d) {
    var selections = d3.selectAll("." + d.name.replace(/ |'/g, ""))[0];
    d3.select(selections[0]).style("stroke", "red");
    d3.select(selections[1]).style("opacity", 1);
    if (selections.length > 2) {
        d3.select(selections[2])
            .style("fill", "red")
            .attr("stroke", "red");
    }
};

Vis3.prototype.mouseout = function(d) {
    var selections = d3.selectAll("." + d.name.replace(/ |'/g, ""))[0];
    d3.select(selections[0]).style("stroke", color);
    if (d.name != "Stephen Curry") {
        d3.select(selections[1]).style("opacity", 0);
    }
    if (selections.length > 2) {
        d3.select(selections[2])
            .style("fill", color)
            .attr("stroke", "white");
    }
};

function color(d) {
    if (d.name == "Stephen Curry") {
        return "orange";
    } else if (d.name == "Average") {
        return "green";
    } else {
        return "lightgray";
    }
};

