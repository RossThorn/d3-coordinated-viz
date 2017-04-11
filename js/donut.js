// donut labels tutorial 1
function donut(){
  var data = [{
    label: 'Star Wars',
    instances: 207
}, {
    label: 'Lost In Space',
    instances: 3
}, {
    label: 'the Boston Pops',
    instances: 20
}, {
    label: 'Indiana Jones',
    instances: 150
}, {
    label: 'Harry Potter',
    instances: 75
}, {
    label: 'Jaws',
    instances: 5
}, {
    label: 'Lincoln',
    instances: 1
}];

svg = d3.select("svg");
canvas = d3.select("#canvas");
art = d3.select("#art");
labels = d3.select("#labels");

// Create the pie layout function.
// This function will add convenience
// data to our existing data, like
// the start angle and end angle
// for each data element.
jhw_pie = d3.pie()
jhw_pie.value(function (d, i) {
    // Tells the layout function what
    // property of our data object to
    // use as the value.
    return d.instances;
});

// Store our chart dimensions
cDim = {
    height: 500,
    width: 500,
    innerRadius: 50,
    outerRadius: 150,
    labelRadius: 175
}

// Set the size of our SVG element
svg.attr({
    height: cDim.height,
    width: cDim.width
});

// This translate property moves the origin of the group's coordinate
// space to the center of the SVG element, saving us translating every
// coordinate individually.
canvas.attr("transform", "translate(" + (cDim.width / 2) + "," + (cDim.width / 2) + ")");

pied_data = jhw_pie(data);

// The pied_arc function we make here will calculate the path
// information for each wedge based on the data set. This is
// used in the "d" attribute.
pied_arc = d3.arc()
    .innerRadius(50)
    .outerRadius(150);

// This is an ordinal scale that returns 10 predefined colors.
// It is part of d3 core.
pied_colors =d3.scaleOrdinal(d3.schemeCategory10);

// Let's start drawing the arcs.
enteringArcs = art.selectAll(".wedge").data(pied_data).enter();

enteringArcs.append("path")
    .attr("class", "wedge")
    .attr("d", pied_arc)
    .style("fill", function (d, i) {
    return pied_colors(i);
});

// Now we'll draw our label lines, etc.
enteringLabels = labels.selectAll(".label").data(pied_data).enter();
labelGroups = enteringLabels.append("g").attr("class", "label");
labelGroups.append("circle").attr({
    x: 0,
    y: 0,
    r: 2,
    fill: "#000",
    transform: function (d, i) {
        centroid = pied_arc.centroid(d);
        return "translate(" + pied_arc.centroid(d) + ")";
    },
        'class': "label-circle"
});

// "When am I ever going to use this?" I said in
// 10th grade trig.
textLines = labelGroups.append("line").attr({
    x1: function (d, i) {
        return pied_arc.centroid(d)[0];
    },
    y1: function (d, i) {
        return pied_arc.centroid(d)[1];
    },
    x2: function (d, i) {
        centroid = pied_arc.centroid(d);
        midAngle = Math.atan2(centroid[1], centroid[0]);
        x = Math.cos(midAngle) * cDim.labelRadius;
        return x;
    },
    y2: function (d, i) {
        centroid = pied_arc.centroid(d);
        midAngle = Math.atan2(centroid[1], centroid[0]);
        y = Math.sin(midAngle) * cDim.labelRadius;
        return y;
    },
        'class': "label-line"
});

textLabels = labelGroups.append("text").attr({
    x: function (d, i) {
        centroid = pied_arc.centroid(d);
        midAngle = Math.atan2(centroid[1], centroid[0]);
        x = Math.cos(midAngle) * cDim.labelRadius;
        sign = (x > 0) ? 1 : -1
        labelX = x + (5 * sign)
        return labelX;
    },
    y: function (d, i) {
        centroid = pied_arc.centroid(d);
        midAngle = Math.atan2(centroid[1], centroid[0]);
        y = Math.sin(midAngle) * cDim.labelRadius;
        return y;
    },
        'text-anchor': function (d, i) {
        centroid = pied_arc.centroid(d);
        midAngle = Math.atan2(centroid[1], centroid[0]);
        x = Math.cos(midAngle) * cDim.labelRadius;
        return (x > 0) ? "start" : "end";
    },
        'class': 'label-text'
}).text(function (d) {
    return d.data.label
});

alpha = 0.5;
spacing = 12;

function relax() {
    again = false;
    textLabels.each(function (d, i) {
        a = this;
        da = d3.select(a);
        y1 = da.attr("y");
        textLabels.each(function (d, j) {
            b = this;
            // a & b are the same element and don't collide.
            if (a == b) return;
            db = d3.select(b);
            // a & b are on opposite sides of the chart and
            // don't collide
            if (da.attr("text-anchor") != db.attr("text-anchor")) return;
            // Now let's calculate the distance between
            // these elements.
            y2 = db.attr("y");
            deltaY = y1 - y2;

            // Our spacing is greater than our specified spacing,
            // so they don't collide.
            if (Math.abs(deltaY) > spacing) return;

            // If the labels collide, we'll push each
            // of the two labels up and down a little bit.
            again = true;
            sign = deltaY > 0 ? 1 : -1;
            adjust = sign * alpha;
            da.attr("y",+y1 + adjust);
            db.attr("y",+y2 - adjust);
        });
    });
    // Adjust our line leaders here
    // so that they follow the labels.
    if(again) {
        labelElements = textLabels[0];
        textLines.attr("y2",function(d,i) {
            labelForLine = d3.select(labelElements[i]);
            return labelForLine.attr("y");
        });
        setTimeout(relax,20)
    }
}

relax();
};



// donut tutorial 2


d3.select("input[value=\"total\"]").property("checked", true);


var svg = d3.select("body")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labels");
svg.append("g")
	.attr("class", "lines");

var width = 960,
    height = 450,
	radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function(d){ return d.data.label; };

var color = d3.scaleOrdinal()
	.domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

function randomData (){
	var labels = color.domain();
	return labels.map(function(label){
		return { label: label, value: Math.random() }
	});
}

change(randomData());

d3.select(".randomize")
	.on("click", function(){
		change(randomData());
	});


function change(data) {

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color(d.data.label); })
		.attr("class", "slice");

	slice
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		});

	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);

	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};
		});

	polyline.exit()
		.remove();
};



// change function

function change(data, colorScale) {

  var chart = d3.select(".chart");

	/* ------- PIE SLICES -------*/
	var slice = chart.selectAll(".arc")
		.data(pie(data));

    console.log(slice);

	slice.enter()
		.insert("path")
		.style("fill", function(d) {
      console.log(d.data)
      return choropleth(d.data,colorScale); })
		.attr("class", "arc");

	slice
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = chart.select(".labels").selectAll("text")
		.data(pie(data));

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.State;
		});

	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = labelArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	// var polyline = svg.select(".lines").selectAll("polyline")
	// 	.data(pie(data), key);
  //
	// polyline.enter()
	// 	.append("polyline");
  //
	// polyline.transition().duration(1000)
	// 	.attrTween("points", function(d){
	// 		this._current = this._current || d;
	// 		var interpolate = d3.interpolate(this._current, d);
	// 		this._current = interpolate(0);
	// 		return function(t) {
	// 			var d2 = interpolate(t);
	// 			var pos = outerArc.centroid(d2);
	// 			pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
	// 			return [arc.centroid(d2), outerArc.centroid(d2), pos];
	// 		};
	// 	});
  //
	// polyline.exit()
	// 	.remove();
