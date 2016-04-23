/**
 * Created by MWoo on 4/10/16.
 */

visOne = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    console.log(this.data);

    this.initVis();
}

/*
 *  Initialize the first visualization
 */

visOne.prototype.initVis = function() {

    var vis = this;

    var dataCategories = colorScale.domain();

    // Rearrange data to include relevant metrics only
    vis.cleanData = dataCategories.map(function(name) {
        return {
            name: name,
            values: vis.data.map(function(d) {
                return {
                    year: d.Year,
                    date: d.date,
                    Season: d.Season,
                    Fg: d[name]}
            })
        };
    });

    console.log(vis.cleanData);

    vis.circle = null;
    vis.curYear = null;
    vis.caption = null;

    vis.margin = { top: 30, right: 12, bottom: 50, left: 30 };

    // Width and height for each svg
    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

    vis.bisect = d3.bisector(function(d) { return d.date; }).left;

    vis.x = d3.time.scale()
        .domain(d3.extent(vis.cleanData[0].values, function(d){
            return d.date;
        }))
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .domain([0,100])
        .range([vis.height, 0]);

    /*
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");
*/

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .ticks(4)
        .outerTickSize(0)
        .tickSubdivide(1);

    vis.line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return vis.x(d.date)})
        .y(function(d) { return vis.y(d.Fg)});

    vis.lines;

    //Mouse tooltip functions
    vis.mouseover = function() {
        vis.circle.attr("opacity", 1.0);
        d3.selectAll(".static_year").classed("hidden", true);
        return vis.mousemove.call(this);
    };

    vis.mousemove = function() {
        var xpos = d3.mouse(this)[0];
        var year = vis.x.invert(xpos).getFullYear();
        var date = format.parse('' + year);
        var index = 0;

        vis.circle
            .attr("cx", vis.x(date))
            .attr("cy", function(d) {
                index = vis.bisect(d.values, date, 0, d.values.length - 1);
                return vis.y(d.values[index].Fg);
            });

        vis.caption.attr("x", vis.x(date))
            .attr("y", function(d) {
                return vis.y(d.values[index].Fg);
            }).text(function(d) {
            return d.values[index].Fg;
        });
        
        vis.curYear
            .attr("x", vis.x(date))
            .text(year);
        return true;
    };

    vis.mouseout = function() {
        d3.selectAll(".static_year")
            .classed("hidden", false);
        vis.circle.attr("opacity", 0);
        vis.caption.text("");
        vis.curYear.text("");
        return true;
    };


    vis.wrangleData();

}

visOne.prototype.wrangleData = function() {

    var vis = this;

    vis.displayData = vis.cleanData;

    vis.updateVis();

}

visOne.prototype.updateVis = function() {

    var vis = this;

    console.log(this);

    vis.div = d3.select("#visOne")
        .selectAll(".chart")
        .data(this.displayData);

    vis.div.enter()
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .append("g");

    vis.svg = vis.div.select("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.g = vis.svg
        .select("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.g.append("rect")
        .attr("class", "background")
        .style("pointer-events", "all")
        .attr("width", vis.width + vis.margin.right)
        .attr("height", vis.height)
        .on("mouseover", vis.mouseover)
        .on("mousemove", vis.mousemove)
        .on("mouseout", vis.mouseout);

    vis.lines = vis.g.append("g");

    vis.lines.append("path")
        .attr("class", "line")
        .style("pointer-events", "none")
        .attr("d", function(d) {
            return vis.line(d.values);
        });

    vis.lines.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", vis.height)
        .attr("dy", vis.margin.bottom / 2 + 5)
        .attr("x", vis.width / 2)
        .text(function(d) {
            return d.name;
        });

    vis.lines.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "start")
        .style("pointer-events", "none")
        .attr("dy", 13)
        .attr("y", vis.height)
        .attr("x", vis.width-15)
        .text(function(d) {
            return d.values[d.values.length - 1].date.getFullYear();
        });

    vis.lines.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "end")
        .style("pointer-events", "none")
        .attr("dy", 13)
        .attr("y", vis.height)
        .attr("x", 0)
        .text(function(d) {
            return d.values[0].date.getFullYear();
        });

    // hide for now
    vis.circle = vis.lines.append("circle")
        .attr("r", 4)
        .attr("opacity", 0)
        .style("pointer-events", "none")
        .style("fill", function(d) { return "#FDB927"});;

    vis.caption = vis.lines.append("text")
        .attr("class", "caption")
        .attr("text-anchor", "middle")
        .attr("dy", -8)
        .style("pointer-events", "none");

    vis.curYear = vis.lines.append("text")
        .attr("class", "year")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", 13)
        .attr("y", vis.height);

    vis.g.append("g")
        .attr("class", "y axis")
        .call(vis.yAxis)
        .append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Shots");

    /*
    vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis)
        */
}