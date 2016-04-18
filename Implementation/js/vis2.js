// Contains all data
var vis2Data = [];

// Visualization
var vis2;

var shotData = [];
var finalData = [];

// Start by loading data
vis2LoadData();

// Loads data
function vis2LoadData() {
  d3.csv("data/barnes_df.csv", function(error, data) {

    var x = [];
    var y = [];
    var made = [];
    var attempts = [];

    data.forEach(function(d){
      d.LOC_X = +d.LOC_X;
      d.LOC_Y = +d.LOC_Y;
      d.SHOT_MADE_FLAG = +d.SHOT_MADE_FLAG;
      d.SHOT_ATTEMPTED_FLAG = +d.SHOT_ATTEMPTED_FLAG;

      x.push(Math.ceil((d.LOC_X+243)/10));
      y.push(Math.ceil((d.LOC_Y+17)/9));
      made.push(d.SHOT_MADE_FLAG);
      attempts.push(d.SHOT_ATTEMPTED_FLAG);
    });

    for(var i = 0; i < data.length; i++){
      shotData.push({
        "x": x[i],
        "y": y[i],
        "made": made[i],
        "attempts": attempts[i]
      });
    }

    calculate_z_values(shotData);

    vis2CreateVis();
  });
}

function calculate_z_values(shotData){
  var reformatted = d3.nest()
      .key(function(d) {return [d.x, d.y]; })
      .rollup(function(v){return{
          made: d3.sum(v, function(d) {return d.made;}),
          attempts: d3.sum(v, function(d){return d.attempts;}),
          shootingPercentage:  d3.sum(v, function(d) {return d.made;})/d3.sum(v, function(d){return d.attempts;})
      };})
      .entries(shotData);

  var z = [];
  reformatted.forEach(function(a){
      a.key = JSON.parse("[" + a.key + "]");
      z.push(a.values.shootingPercentage);
  });

  var shotMean = math.mean(z);
  var shotStd = math.std(z);

  reformatted.forEach(function(a){
      var k = (a.values.shootingPercentage - shotMean)/shotStd;
      finalData.push({"x": a.key[0], "y": a.key[1], "z": k, "made": a.values.made, "attempts": a.values.attempts});
  });
}

function vis2CreateVis() {
  console.log(finalData);

  vis2 = new ShotChart("vis-2-shot-chart", finalData);
}
