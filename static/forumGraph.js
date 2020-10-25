// Note: v4->v5 breaks this code
// In v5 promises are used to load
// json, so I'd have to add a .then...
// Color arrays with 20 colors
// have also been changed from v4 to v5

// We load the d3.js library from the Web.
require.config({paths:
    {d3: "https://d3js.org/d3.v4.min"}});
require(["d3"], function(d3) {
    // The code in this block is executed when the
    // d3.js library has been loaded.
    // define the dragging rules
  const drag = simulation => {

        function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }
  // Specify the size of the canvas
  // containing the visualization (size of the
  // <div> element).
  var width = 800, height = 600;

  // We create a color scale.
  // NOTE: this line will cause problems in d3js v5
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  // We create a force-directed dynamic graph layout.
  // We center it slightly up and left to be closer
  // to the search box.
  var sim = d3.forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 1.9, height / 1.9));

  // In the <div> element, we create a <svg> graphic
  // that will contain our interactive visualization.
  var svg = d3.select("#d3-example").select("svg")
  if (svg.empty()) {
    svg = d3.select("#d3-example").append("svg")
          .attr("width", width)
          .attr("height", height);
  }
    
    //Define the button click listener
    var myBtn = document.getElementById("search");
    myBtn.addEventListener("click", function () {
        //find the node
        var selectedVal = document.getElementById('searchinp').value;
        var node = svg.selectAll(".node"); // select the circles
        var link = svg.selectAll(".link"); //select the links
        node.interrupt(); // if an animation is still running, stop it
        link.interrupt(); // if an animation is still running, stop it
        if (selectedVal == "") {
            // reset to defaults
            node.style("opacity",1);
            link.style("opacity",1);
        } else {
            var selected = node.filter(function (d) {
                return d.name.toLowerCase().startsWith(selectedVal.toLowerCase());
            });

            node.style("opacity", 0); // hide all nodes
            selected.style("opacity", 1)// but this one

            
            link.style("opacity", 0);// hide all links
            // and then show them all again after some time
            node.transition()
                .duration(5000)
                .style("opacity", 1);
            link.transition()
                .duration(5000)
                .style("opacity", 1);
    }
});
  

  // We load the JSON file.
  d3.json("/forumGraph", function(error, graph) {
    // In this block, the file has been loaded
    // and the 'graph' object contains our graph.

    // We load the nodes and links in the
    // force-directed graph.
    sim.nodes(graph.nodes);

    // We create a <line> SVG element for each link
    // in the graph.
    var link = svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link");

    // We create a <circle> SVG element for each node
    // in the graph, and we specify a few attributes.
    var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)  // radius
      .style("fill", function(d) {
         // The node color depends on the indegree.
         return color(d.community);
      })
      .call(drag(sim))
      .on("click", function(d) {
        d3.select("#flow-data").text(d.flow);
        d3.select("#name-data").text(d.name);
        d3.select("#best-post").text(d.best_post);
      });
    
    sim.force("link", d3.forceLink(graph.links));

    // The name of each node is the player name.
    node.append("title")
        .text(function(d) { return d.name; });

    // We bind the positions of the SVG elements
    // to the positions of the dynamic force-directed
    // graph, at each time step.
    sim.on("tick", function() {
      link.attr("x1", function(d){return d.source.x})
          .attr("y1", function(d){return d.source.y})
          .attr("x2", function(d){return d.target.x})
          .attr("y2", function(d){return d.target.y});

      node.attr("cx", function(d){return d.x})
          .attr("cy", function(d){return d.y});
    });
  });
});