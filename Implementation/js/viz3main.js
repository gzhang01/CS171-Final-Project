// Contains all data
var viz3Data = [];

// Visualization
var viz3;

// Start by loading data
viz3LoadData();

// Loads data
function viz3LoadData() {
    d3.csv("data/vis3/all.csv", function(error, data) {
        tmpData = {};

        // Make sure all needed numbers are numbers
        data.forEach(function(d) {
            pts = +d.PTS;
            fga = +d.FGA;
            fta = +d.FTA;

            // Calculate total shooting percentage
            tsp = pts / (2 * (fga + 0.44 * fta));

            // Input into tmpData
            if (!(d.Name in tmpData)) {
                tmpData[d.Name] = [];
            }
            tmpData[d.Name].push({season: d.Season, tsp: tsp, mp: +d.MP, fga: fga});
        });

        // Constructing data set usable for line graph
        keys = d3.keys(tmpData);
        keys.forEach(function(d) {
            viz3Data.push({
                name: d,
                values: tmpData[d]
            });
        });

        // Construct total without Curry data set
        var total = {};
        viz3Data.forEach(function(d) {
            if (d.name !== "Stephen Curry") {
                d.values.forEach(function(v) {
                    if (!(v.season in total)) {
                        total[v.season] = {tsp: 0, mp: 0, fga: 0, count: 0};
                    }
                    total[v.season].tsp += v.tsp;
                    total[v.season].mp += v.mp;
                    total[v.season].fga += v.fga;
                    total[v.season].count += 1;
                });
            }
        });
        var avgPlayer = { name: "Average", values: [] };
        keys = d3.keys(total).sort();
        keys.forEach(function(season) {
            avgPlayer.values.push({
                season: season,
                mp: ~~(total[season].mp / total[season].count),
                fga: total[season].fga / total[season].count,
                tsp: total[season].tsp / total[season].count
            })
        });
        viz3Data.push(avgPlayer);

        viz3CreateVis();
    })
}

function viz3CreateVis() {
    viz3 = new Vis3("viz3", viz3Data);
}

