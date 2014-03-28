/**
 * Created by hen on 3/8/14.
 */

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:350,
    height:200
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var svg2 = detailVis.append("g")
.attr({
        transform: "translate(" + '70' + "," + '-25' + ")"
    });

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .direction('e')
  .html(function(d) {
    return "Name: " + d['STATION'] + "<br> Total Solar Radiation: " + completeDataSet[d['USAF'].toString()]['sum'].toString();
  })

svg.call(tip);

var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);

var screencoord = projection([71, 42]);

var completeDataSet;

var graphed = false;

var dataSet = {};

var radius_scale;

var bar_scaley = d3.time.scale().range([0, 200]);
var bar_scalex = d3.scale.linear().domain([0, 23]).range([0, 250]);

var bar_axisy;
var bar_axisx = d3.svg.axis().scale(bar_scalex).orient("bottom");

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
        svg.selectAll(".station")
            .data(data)
        .enter().append("circle")
        .filter(function(d) { return (projection([+d["NSRDB_LON(dd)"], +d["NSRDB_LAT (dd)"]]) != null ) })  
          .attr("class", function(d){
            if (d["USAF"].toString() in completeDataSet) { return "station hasData"}
            else {return "station"}})

          // .attr("fill", "grey")
          .attr("cx", function(d) { coords = projection([+d["NSRDB_LON(dd)"], +d["NSRDB_LAT (dd)"]]);
                if (coords != null){return coords[0] }})
         .attr("cy", function(d) { coords = projection([+d["NSRDB_LON(dd)"], +d["NSRDB_LAT (dd)"]]); 
                if (coords != null){return coords[1] }})
         .attr("r", function(d){
            if (d["USAF"].toString() in completeDataSet){ return radius_scale(completeDataSet[d["USAF"].toString()]['sum']);}
            else {return 2;}
         })
        .filter(function(d){return (d["USAF"].toString() in completeDataSet);})
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on("click", function(d){     
            var hrs = completeDataSet[d["USAF"].toString()]['hourly'];   
            var hmax = Math.max.apply(null,
                        Object.keys(hrs).map(function(e) {
                                return hrs[e];
                        }));
            var hmin = Math.min.apply(null,
                        Object.keys(hrs).map(function(e) {
                                return hrs[e];
                        }));
            bar_scaley = d3.scale.linear().domain([hmin, hmax]).rangeRound([150, 0]);
            bar_axisy = d3.svg.axis().scale(bar_scaley).orient("left");
            if (graphed){updateDetailVis(d);}
            else {createDetailVis(d);}});
    });
}


function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
        completeDataSet= data;
        var max = Math.max.apply(null,
                        Object.keys(data).map(function(e) {
                                return data[e]['sum'];
                        }));
        var min = Math.min.apply(null,
                        Object.keys(data).map(function(e) {
                                return data[e]['sum'];
                        }));
        radius_scale = d3.scale.linear().domain([min, max]).range([2, 10]);
		
        loadStations();
    })

}


d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features
    // console.log(usMap);

    svg.selectAll(".country").data(usMap).enter().append("path")
        .attr("class", "country")
      .attr("d", path).on("click", clicked);
    // see also: http://bl.ocks.org/mbostock/4122298

    loadStats();
});

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(data){
    // console.log(completeDataSet[data["USAF"].toString()]['hourly']);
    svg2.selectAll("rect")
        .data(completeDataSet[data["USAF"].toString()]['hourly'])
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d,i) {
        return bar_scaley(d) + 50 - 0.5;})
      .attr("x", function(d,i){ return bar_scalex(i) -0.5;})
      .attr("width", 10)
      .attr("height", function(d) { return 150-bar_scaley(d); });
    graphed = true;

    svg2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(10,200)")
        .call(bar_axisx);

    svg2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(5, 50)")
        .call(bar_axisy);
    // console.log(d);

}


var updateDetailVis = function(data){
    svg2.selectAll("rect")
    .data(function () {var values = Object.keys(completeDataSet[data["USAF"].toString()]['hourly'])
            .map(function(key){return completeDataSet[data["USAF"].toString()]['hourly'][key];});
        return values;})
    .attr("y", function(d,i) {
        return bar_scaley(d) + 50 - 0.5;})
      .attr("x", function(d,i){ return bar_scalex(i);})
      .attr("width", 10)
      .attr("height", function(d) { return 150-bar_scaley(d); });
  
}



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}


