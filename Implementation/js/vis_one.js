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

    vis.margin = { top: 30, right: 10, bottom: 50, left: 30 };

    // Width and height for each svg
    vis.width = 400 - vis.margin.left - vis.margin.right;
    vis.height = 200 - vis.margin.top - vis.margin.bottom;

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
        .tickSubdivide(1)
        .tickSize(-vis.width);


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
        vis.xpos = d3.mouse(this)[0];
        vis.year = vis.x.invert(vis.xpos).getFullYear();
        vis.date = format.parse('' + vis.year);
        vis.index = 0;

        vis.circle
            .attr("cx", vis.x(vis.date))
            .attr("cy", function(d) {
                vis.index = vis.bisect(d.values, vis.date, 0, d.values.length - 1);
                return vis.y(d.values[vis.index].Fg);
            });

        vis.caption.attr("x", vis.x(vis.date))
            .attr("y", function(d) {
                return vis.y(d.values[vis.index].Fg);
            }).text(function(d) {
            return d.values[vis.index].Fg;
        });

        vis.curYear
            .attr("x", vis.x(vis.date))
            .text(vis.year);
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

    vis.percentageDiff = function (num1, num2) {
        if (num1 == num2) {
            return 0 + "%";
        }
        else if (num1 < num2) {
            return (((num2 - num1) / num1) * 100).toFixed(2) + "%";
        }
        else {
            return -(((num1 - num2) / num2) * 100).toFixed(2) + "%";
        }
    }

    vis.click = function (d) {
        console.log(d);

        vis.circle
            .transition()
            .duration(250)
            .attr("r", 16)
            .transition()
            .duration(250)
            .attr("r",4);

        if (!$("#seasonOne").html()) {
            $(document).ready(function () {

                vis.tableYear = vis.year;
                vis.tableSeason = vis.displayData[0].values[vis.index].Season;
                vis.tableFg = vis.displayData[0].values[vis.index].Fg;
                vis.tableFga = vis.displayData[1].values[vis.index].Fg;
                vis.table3fg = vis.displayData[2].values[vis.index].Fg;
                vis.table3fga = vis.displayData[3].values[vis.index].Fg;
                vis.table2fg = vis.displayData[4].values[vis.index].Fg;
                vis.table2fga = vis.displayData[5].values[vis.index].Fg;

                $('#seasonOne').text(vis.tableSeason);
                $('#fgOne').text(vis.tableFg);
                $('#fgaOne').text(vis.tableFga);
                $('#3ptOne').text(vis.table3fg);
                $('#3ptaOne').text(vis.table3fga);
                $('#2ptOne').text(vis.table2fg);
                $('#2ptaOne').text(vis.table2fga);
            });
        }
        else if(!$("#seasonTwo").html()) {
            $(document).ready(function () {
                $('#seasonTwo').text(vis.displayData[0].values[vis.index].Season);
                $('#fgTwo').text(vis.displayData[0].values[vis.index].Fg);
                $('#fgaTwo').text(vis.displayData[1].values[vis.index].Fg);
                $('#3ptTwo').text(vis.displayData[2].values[vis.index].Fg);
                $('#3ptaTwo').text(vis.displayData[3].values[vis.index].Fg);
                $('#2ptTwo').text(vis.displayData[4].values[vis.index].Fg);
                $('#2ptaTwo').text(vis.displayData[5].values[vis.index].Fg);
            });

            $(document).ready(function () {
                $('#fgComp').text(vis.percentageDiff(vis.tableFg, vis.displayData[0].values[vis.index].Fg));
                $('#fgaComp').text(vis.percentageDiff(vis.tableFga, vis.displayData[1].values[vis.index].Fg));
                $('#3ptComp').text(vis.percentageDiff(vis.table3fg, vis.displayData[2].values[vis.index].Fg));
                $('#3ptaComp').text(vis.percentageDiff(vis.table3fga, vis.displayData[3].values[vis.index].Fg));
                $('#2ptComp').text(vis.percentageDiff(vis.table2fg, vis.displayData[4].values[vis.index].Fg));
                $('#2ptaComp').text(vis.percentageDiff(vis.table2fga, vis.displayData[5].values[vis.index].Fg));
            });
        }
        else {
            $(document).ready(function () {
                $("#table-body > tr > td > span").text("");

                vis.tableYear = vis.year;
                vis.tableSeason = vis.displayData[0].values[vis.index].Season;
                vis.tableFg = vis.displayData[0].values[vis.index].Fg;
                vis.tableFga = vis.displayData[1].values[vis.index].Fg;
                vis.table3fg = vis.displayData[2].values[vis.index].Fg;
                vis.table3fga = vis.displayData[3].values[vis.index].Fg;
                vis.table2fg = vis.displayData[4].values[vis.index].Fg;
                vis.table2fga = vis.displayData[5].values[vis.index].Fg;

                $('#seasonOne').text(vis.tableSeason);
                $('#fgOne').text(vis.tableFg);
                $('#fgaOne').text(vis.tableFga);
                $('#3ptOne').text(vis.table3fg);
                $('#3ptaOne').text(vis.table3fga);
                $('#2ptOne').text(vis.table2fg);
                $('#2ptaOne').text(vis.table2fga);
            });
        }
    }

    vis.wrangleData();

}

visOne.prototype.wrangleData = function() {

    var vis = this;

    vis.displayData = vis.cleanData;

    vis.updateVis();

}

visOne.prototype.updateVis = function() {

    var vis = this;

    //Initialize the values at the start
    $(document).ready(function () {

        vis.tableYear = vis.year;
        vis.tableSeason = vis.displayData[0].values[0].Season;
        vis.tableFg = vis.displayData[0].values[0].Fg;
        vis.tableFga = vis.displayData[1].values[0].Fg;
        vis.table3fg = vis.displayData[2].values[0].Fg;
        vis.table3fga = vis.displayData[3].values[0].Fg;
        vis.table2fg = vis.displayData[4].values[0].Fg;
        vis.table2fga = vis.displayData[5].values[0].Fg;

        $('#seasonOne').text(vis.tableSeason);
        $('#fgOne').text(vis.tableFg);
        $('#fgaOne').text(vis.tableFga);
        $('#3ptOne').text(vis.table3fg);
        $('#3ptaOne').text(vis.table3fga);
        $('#2ptOne').text(vis.table2fg);
        $('#2ptaOne').text(vis.table2fga);

        $('#seasonTwo').text(vis.displayData[0].values[36].Season);
        $('#fgTwo').text(vis.displayData[0].values[36].Fg);
        $('#fgaTwo').text(vis.displayData[1].values[36].Fg);
        $('#3ptTwo').text(vis.displayData[2].values[36].Fg);
        $('#3ptaTwo').text(vis.displayData[3].values[36].Fg);
        $('#2ptTwo').text(vis.displayData[4].values[36].Fg);
        $('#2ptaTwo').text(vis.displayData[5].values[36].Fg);

        $('#fgComp').text(vis.percentageDiff(vis.tableFg, vis.displayData[0].values[36].Fg));
        $('#fgaComp').text(vis.percentageDiff(vis.tableFga, vis.displayData[1].values[36].Fg));
        $('#3ptComp').text(vis.percentageDiff(vis.table3fg, vis.displayData[2].values[36].Fg));
        $('#3ptaComp').text(vis.percentageDiff(vis.table3fga, vis.displayData[3].values[36].Fg));
        $('#2ptComp').text(vis.percentageDiff(vis.table2fg, vis.displayData[4].values[36].Fg));
        $('#2ptaComp').text(vis.percentageDiff(vis.table2fga, vis.displayData[5].values[36].Fg));
    });

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
        .on("mouseout", vis.mouseout)
        .on("click", vis.click);

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
        .style("fill", function(d) { return "#FDB927"});

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
