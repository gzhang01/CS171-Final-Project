/**
 * Created by MWoo on 4/10/16.
 */

dataOne = [];
colorScale = d3.scale.category10();
format = d3.time.format("%Y");

loadData();

function loadData() {

    d3.csv("data/leagues_NBA_stats_stats.csv", function(error, csv) {

        csv.forEach(function(d) {
            d['3P'] = +d['3P'];
            d['3PA'] = +d['3PA'];
            d.FG = +d.FG;
            d.FGA = +d.FGA;
            d['2P'] = +d['2P'];
            d['2PA'] = +d['2PA'];
            d.date = format.parse(d.Year);
        });

        dataOne = csv;

        csv.sort(function(a, b) {
            return a.date - b.date;
        });

        console.log(dataOne);

        colorScale.domain(d3.keys(dataOne[0]).filter(function(d) {
            return (["2P","2PA","3P","3PA","FG","FGA"].indexOf(d) > -1)}));

        createVis();
    });
}

function createVis() {

    visualization_one = new visOne("visOne", dataOne);

}