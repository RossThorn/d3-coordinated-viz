(function(){

//pseudo-global variables
var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

  //map frame dimensions
   var width = 1200,
       height = 700;

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
        .scale(1500)
        .translate([width / 2, height / 2]);

       var path = d3.geoPath()
        .projection(projection);

    //use d3.queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/FinalAlcohol_2014.csv") //load attributes from csv
        .defer(d3.json, "data/StatesTopo.topojson") //load spatial data
        .await(callback);

    function callback(error, csvData, usa){

            setGraticule(map,path)

            // translate topojson to GeoJSON
            var unitedStates = topojson.feature(usa, usa.objects.States).features;

            var states = map.selectAll(".states")
            .data(unitedStates)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "states " + d.properties.name;
            })
            .attr("d", path);

            console.log(csvData,usa);


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

function joinData(states,csvData){

};

})();
