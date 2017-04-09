(function(){

//pseudo-global variables
var attrArray = ["Alc_Imp_Accidents", "DUI_Count", "Establishments", "Population", "Total_Accidents"]; //list of attributes
var expressed = attrArray[0]; //initial attribute


//begin script when window loads
window.onload = setMap();
window.onload = donut();

//set up choropleth map
function setMap(){

  //map frame dimensions
   var width = 800,
       height = 500;

   //create new svg container for the map
   var map = d3.select("body")
       .append("svg")
       .attr("class", "map")
       .attr("width", width)
       .attr("height", height);

   //create Albers equal area conic projection centered on France
       var projection = d3.geoAlbers()
        .center([0, 42.67])
        .rotate([98, 4, 0])
        .parallels([45.00, 45.5])
        .scale(1000)
        .translate([width / 2, height / 2]);

       var path = d3.geoPath()
        .projection(projection);

    //use d3.queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/FinalAlcoholNormalized_2014.csv") //load attributes from csv
        .defer(d3.json, "data/StatesTopo.topojson") //load spatial data
        .await(callback);

    function callback(error, csvData, usa){

            setGraticule(map,path)

            // translate topojson to GeoJSON
            var unitedStates = topojson.feature(usa, usa.objects.States).features;

                //join csv data to GeoJSON enumeration units
            unitedStates = joinData(unitedStates, csvData);

            // console.log(csvData,usa);
            // console.log(unitedStates);

            var colorScale = makeColorScale(csvData);

            setEnumerationUnits(unitedStates, map, path, colorScale);
            createDropdown(csvData);




    };
};


// original working donut function
function donut(){

  //var attributes = ["Alc_Imp_Accidents", "DUI_Count", "Establishments", "Population", "Total Accidents"];

  var margin = {top:20, right: 20, bottom: 20, left: 20},
      width = 700 - margin.right - margin.left,
      height = 700 - margin.top - margin.bottom
      radius = width/2;

  var arc = d3.arc()
      .innerRadius(150)
      .outerRadius(200);

  var labelArc = d3.arc()
      .outerRadius(220)
      .innerRadius(200);

  var pie = d3.pie()
      .value(function(d){
          return d.Alc_Imp_Accidents;
      });


  var svg = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate("+ width/2 +","+ height/2 +")");

  var lines =   svg.append("g")
  	.attr("class", "lines");

  var labels = svg.append("g")
  	.attr("class", "labels");


  //import data
  d3.csv("data/FinalAlcoholNormalized_2014.csv", function(error, data){
      if (error) throw error;

      //parse data
      data.forEach(function(d){
          d.Establishments = +d.Alc_Imp_Accidents;
          d.State = d.State;
      });

      // append g elements (arc)
      var g = svg.selectAll(".arc")
          .data(pie(data))
          .enter().append("g")
          .attr("class", "arc");

      var colorScale = makeColorScale(data);

      var color = d3.scaleOrdinal(d3.schemeCategory20);
          // .range(["red","orange","yellow","green","blue","indigo","violet"]);

      //
      g.append("text")
          .attr("x", 0)
          .attr("y", 0 )
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .html("Alcohol-impaired Incidents per 100 Fatal Traffic Accidents");


      // append path of the arc
      g.append("path")
          .attr("d", arc)
          .style("fill",function(d){ return choropleth(d.data, colorScale);})
          .transition()
          .ease(d3.easeExp)
          .duration(2000)
          .attrTween("d", pieTween);

      // // append the text
      // g.append("text")
      //     .transition()
      //     .ease(d3.easeLinear)
      //     .duration(2000)
      //     .attr("transform", function(d){ return "translate(" + labelArc.centroid(d) + ")";})
      //     .attr("dy", ".35em")
      //     .text(function(d) {return d.data.State;});

        g.append("text")
               .transition()
               .delay(2000)
              .ease(d3.easeLinear)
              .duration(500)
              .attr("transform", function(d) {
              var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
              return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
              .attr("dy", ".35em")
              .attr('text-anchor',function(midAngle){
                var anchorLocation = midAngle["endAngle"] < Math.PI ? "start" : "end"
                return anchorLocation
              })
              .text(function(d) {return (d.data.State+": "+Math.round(d.data.Establishments));});


          // var polyline = svg.select(".lines").selectAll("polyline")
          // .data(pie(data), function(d){ return d.data.label });
          //
          // polyline.enter()
          //     .append("polyline");
          //
          // polyline.transition().duration(1000)
          //     .attrTween("points", function(d){
          //         this._current = this._current || d;
          //         var interpolate = d3.interpolate(this._current, d);
          //         this._current = interpolate(0);
          //         return function(t) {
          //             var d2 = interpolate(t);
          //             var pos = outerArc.centroid(d2);
          //             pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          //             return [arc.centroid(d2), outerArc.centroid(d2), pos];
          //         };
          //     });


  })

  function pieTween(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) {return arc(i(t));};
  };

};

function setGraticule(map,path){
  //create graticule generator
   var graticule = d3.geoGraticule()
       .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

       //create graticule lines
   var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
       .data(graticule.lines()) //bind graticule lines to each element to be created
       .enter() //create an element for each datum
       .append("path") //append each element to the svg as a path element
       .attr("class", "gratLines") //assign class for styling
       .attr("d", path); //project graticule lines
};

function joinData(states, csvData){
  //loop through csv to assign each set of csv attribute values to geojson region
  for (var i=0; i<csvData.length; i++){
      var csvRegion = csvData[i]; //the current region
      var csvKey = csvRegion.State; //the CSV primary key

      //loop through geojson regions to find correct region
      for (var a=0; a<states.length; a++){

          var geojsonProps = states[a].properties; //the current region geojson properties
          var geojsonKey = geojsonProps.name; //the geojson primary key

          //where primary keys match, transfer csv data to geojson properties object
          if (geojsonKey == csvKey){

              //assign all attributes and values
              attrArray.forEach(function(attr){
                  var val = parseFloat(csvRegion[attr]); //get csv attribute value
                  geojsonProps[attr] = val; //assign attribute and value to geojson properties
              });
          };
      };
  };

    return states;
};

function choropleth(props, colorScale){
    //make sure attribute value is a number

    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {

        return "#CCC";
    };
};

function setEnumerationUnits(unitedStates, map, path, colorScale){
  var states = map.selectAll(".states")
  .data(unitedStates)
  .enter()
  .append("path")
  .attr("class", function(d){
      return "states " + d.properties.name;
  })
  .attr("d", path)
  .style("fill", function(d){
    return choropleth(d.properties,colorScale);
  });
};

function makeColorScale(data){
    var colorClasses = [
        "#fee5d9",
        "#fcae91",
        "#fb6a4a",
        "#de2d26",
        "#a50f15"
    ];


    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
};

//function to create a dropdown menu for attribute selection
function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value,csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};

//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var states = d3.selectAll(".states")
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });
};


})();
