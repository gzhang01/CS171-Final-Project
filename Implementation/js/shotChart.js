/*
 * Viz2 Constructor
 */

ShotChart = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis();
};

/*
 *  Initialize station map
 */

ShotChart.prototype.initVis = function() {
  var vis = this;

  var heatRange = ['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48'];
  vis.svg = d3.select("#" + vis.parentElement)
    .append("svg")
    .chart("BasketballShotChart", {
      // set svg width
      width: 600,
      // set title
      title: 'Barnes Shot chart',
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
    }).draw(vis.data);

  vis.wrangleData();
};

/*
 *  Data wrangling
 */

ShotChart.prototype.wrangleData = function() {
  var vis = this;

  // Currently no data wrangling/filtering needed
   vis.displayData = vis.data;

  // Update the visualization
  vis.updateVis();
}


/*
 *  The drawing function
 */

ShotChart.prototype.updateVis = function() {

}