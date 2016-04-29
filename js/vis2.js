// Visualization
var vis2;

var shotData;

var player = 'curry_df';

var heatRange = ['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48'];
var svg = d3.select("#vis-2-shot-chart").append('svg');

// Start by loading data
vis2LoadData(player);

function filterData(){
  var selectBox = document.getElementById("area-category");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;

  vis2LoadData(selectedValue);
}

// Loads data
function vis2LoadData(player) {
  d3.csv("data/" + player + ".csv", function(error, data) {
    var x = [];
    var y = [];
    var made = [];
    var attempts = [];
    var allData;
    shotData = [];

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

    allData = calculate_z_values(shotData);

    updateVis(allData, player);
  });
}

function calculate_z_values(shotData){
  var finalData = [];
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

  return finalData;
}

function updateVis(allData, player){
  svg.selectAll('*').remove();

  svg.chart("BasketballShotChart", {
    // set svg width
    width: 600,
    // set title
    title: 'Shot Chart',
    hexagonFillValue: function(d) {  return d.z; },
    heatScale: d3.scale.quantile()
        .domain([-2.5, 2.5])
        .range(heatRange),
    hexagonBin: function (point, bin) {
        var currentZ = bin.z || 0;
        var totalAttempts = bin.attempts || 0;
        var totalZ = currentZ * totalAttempts;

        var attempts = point.attempts || 1;
        bin.attempts = totalAttempts + attempts;
        bin.z = (totalZ + (point.z * attempts))/bin.attempts;
    },
  }).draw(allData);

  $(".shot-chart-title").text(player.substring(0,player.length - 3) + " shot chart");
}

