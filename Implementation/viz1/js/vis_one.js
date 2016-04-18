/**
 * Created by MWoo on 4/10/16.
 */

visOne = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

/*
 *  Initialize the first visualization
 */

visOne.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 50, right: 50, bottom: 50, left: 50 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.boxmargin = 4,
        vis.lineheight = 16,
        vis.boxwidth = 160,

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    //Making x and y-axis
    vis.x = d3.scale.ordinal()
        .domain(vis.data.map(function(d) { return d.Season; }))
        .rangeBands([vis.width, 0],1,0);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    var dataCategories = colorScale.domain();

    console.log(vis.data);

    // Rearrange data to include relevant metrics only
    vis.cleanData = dataCategories.map(function(name) {
        return {
            name: name,
            values: vis.data.map(function(d) {
                return {
                    Year: d.Year,
                    Season: d.Season,
                    Fg: d[name]}
            })
        };
    })

    vis.line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return vis.x(d.Season)})
        .y(function(d) { return vis.y(d.Fg)});

    vis.wrangleData();
}

visOne.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = vis.cleanData;

    vis.updateVis();
}

visOne.prototype.updateVis = function() {

    var vis = this;

    vis.y.domain([
        d3.min(vis.displayData, function(c) { return d3.min(c.values, function(v) { return v.Fg; }); }),
        100
    ]);

    console.log(vis.displayData);

    var metric = vis.svg.selectAll(".metric")
        .data(vis.displayData)

    metric.enter().append("path")
        .attr("class", "line")
        .attr("d", function(d) {
            return vis.line(d.values)})
        .style("stroke", function(d) { return colorScale(d.name); });

    var legend = vis.svg.selectAll('.g')
        .data(vis.displayData)
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', vis.width)
        .attr('y', function(d, i){ return i *  20;})
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
            return colorScale(d.name);
        });

    legend.append('text')
        .attr('x', vis.width +15)
        .attr('y', function(d, i){ return (i *  20) + 9;})
        .text(function(d){return d.name; });

    metric.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .attr("y", 10)
        .attr("x", 0)
        .attr("dy", ".35em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    vis.svg.select(".x-axis")
        .append("text")
        .attr("x", vis.width)
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Season");


    vis.svg.select(".y-axis").call(vis.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Shots");
}