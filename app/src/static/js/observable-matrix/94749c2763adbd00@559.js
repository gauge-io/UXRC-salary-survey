// https://observablehq.com/d/94749c2763adbd00@559
import define1 from "./e93997d5089d7165@2283.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Scatterplot Matrix with Brushing as a Function

Hex Mode - When you brush, it will use the selected area to filter the number of datapoints within the bounds, then sets the fill-opacity of the hexbin to the percent of datapoints within the bounds.`
)});
  main.variable(observer("graph")).define("graph", ["mode","scatterplotMatrix","data","columns","colorBy","width","height","padding","hexbinMatrix","d3radius"], function(mode,scatterplotMatrix,data,columns,colorBy,width,height,padding,hexbinMatrix,d3radius){return(
mode == "normal" ? scatterplotMatrix(data, columns, colorBy, width, height, padding, true) : hexbinMatrix(data, columns, width, height, padding, true, d3radius)
)});
  main.variable(observer("viewof mode")).define("viewof mode", ["radio"], function(radio){return(
radio({
  title: 'Rendering Mode',
  options: [
    { label: 'Normal', value: 'normal' },
    { label: 'Hexbin', value: 'hex' }
  ],
  value: 'hex'
})
)});
  main.variable(observer("mode")).define("mode", ["Generators", "viewof mode"], (G, _) => G.input(_));
  main.variable(observer("viewof d3radius")).define("viewof d3radius", ["slider"], function(slider){return(
slider({
  min: 1, 
  max: 10,
  step: 1, 
  value: 6,
  //title: "Hexbin Radius"
})
)});
  main.variable(observer("d3radius")).define("d3radius", ["Generators", "viewof d3radius"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`##### Color by Column`
)});
  main.variable(observer("colorBy")).define("colorBy", function(){return(
"Segment"
)});
  main.variable(observer()).define(["md"], function(md){return(
md`##### Matrix Columns`
)});
  main.variable(observer("matrixcolumns")).define("matrixcolumns", function(){return(
["Software Score", "Savviness Index", "Protection opinion"]
)});
  main.variable(observer()).define(["md"], function(md){return(
md`##### Columns List`
)});
  main.variable(observer()).define(["data"], function(data){return(
data.columns
)});
  main.variable(observer("scatterplotMatrix")).define("scatterplotMatrix", ["d3","DOM"], function(d3,DOM){return(
(data, columns, colorColumn, width, height, padding, brushing = false) => {
  
  const size = (width - (columns.length + 1) * padding) / columns.length + padding
  
  const svg = d3.select(DOM.svg(width, width))
      .attr("viewBox", `${-padding} 0 ${width} ${width}`)
      .style("max-width", "100%")
      .style("height", "auto");
  
  const x = columns.map(c => d3.scaleLinear()
    .domain(d3.extent(data, d => d[c]))
    .rangeRound([padding / 2, size - padding / 2]))
  
  const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]))
  
  const z = d3.scaleOrdinal()
    .domain(data.map(d => d[colorColumn]))
    .range(d3.schemeCategory10);
  
  function xAxis() {
    
    const axis = d3.axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);
    
    d3.select(this).selectAll("g").data(x).enter().append("g")
        .attr("transform", (d, i) => `translate(${(columns.length - i - 1) * size},0)`)
        .each(function(d) { return d3.select(this).call(axis.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  }
  
  svg.append("g")
      .attr("class", "x axis")
      .each(xAxis);

  function yAxis() {
    
    const axis = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length);
    
    d3.select(this).selectAll("g").data(y).enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * size})`)
        .each(function(d) { return d3.select(this).call(axis.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  }

  svg.append("g")
      .attr("class", "y axis")
      .each(yAxis);

  const cell = svg.append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
    .join("g")
      .attr("class", "cell")
      .attr("transform", ([i, j]) => `translate(${(columns.length - i - 1) * size},${j * size})`);

  cell.append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding) 
      .attr("height", size - padding);

  cell.each(function([i, j]) {
    
    d3.select(this).selectAll("circle")
      .data(data)
      .enter().append("circle")
        .attr("cx", d => x[i](d[columns[i]]))
        .attr("cy", d => y[j](d[columns[j]]))
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .style("fill", d => z(d[colorColumn]));
  });

  svg.append("g")
      .style("font", "bold 10px sans-serif")
    .selectAll("text")
    .data(columns)
    .join("text")
      .attr("transform", (d, i) => `translate(${(columns.length - i - 1) * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(d => d);
  
   
  
    var brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0,0],[size,size]]);
  
  if(brushing) {
    cell.call(brush);
  }
  
  let brushCell 

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.move, null);
      brushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = d3.brushSelection(this);   
    if(!e) {
      d3.selectAll(".circle").style("fill-opacity", 1)
    } else {
      
      const xScale = x[p[0]]
      const yScale = y[p[1]]

      const xRange = [xScale.invert(e[0][0]), xScale.invert(e[1][0])]
      const yRange = [yScale.invert(e[0][1]), yScale.invert(e[1][1])]

      d3.selectAll("circle").style("fill-opacity", .2)
      d3.selectAll("circle")
        .filter(d => d[columns[p[0]]] >= xRange[0] 
                & d[columns[p[0]]] <= xRange[1] 
                & d[columns[p[1]]] <= yRange[0]
                & d[columns[p[1]]] >= yRange[1])
        .style("fill-opacity", 1)
    }

  }

  // If the brush is empty, select all circles.
  function brushend() {
    var e = d3.brushSelection(this);
    if (e === null) d3.selectAll("circle").style("fill-opacity", 1);
  } 
  
  return svg.node();
  
}
)});
  main.variable(observer("onHover")).define("onHover", function(){return(
function onHover(d){
  // console.log(d);
}
)});
  main.variable(observer("hexbinMatrix")).define("hexbinMatrix", ["d3","DOM","onHover"], function(d3,DOM,onHover){return(
(data, columns, width, height, padding, brushing = false, radiusSize) => {
  
  const size = (width - (columns.length + 1) * padding) / columns.length + padding
  
  const svg = d3.select(DOM.svg(width, width))
      .attr("viewBox", `${-padding} 0 ${width} ${width}`)
      .style("max-width", "100%")
      .style("height", "auto");
  
  const x = columns.map(c => d3.scaleLinear()
    .domain([0, d3.extent(data, d => d[c])[1]])
    .rangeRound([padding / 2, size - padding / 2]))
  
  const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));
  
  
  const brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0,0],[size,size]]);
  
  function xAxis() {
    
    const axis = d3.axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);
    
    d3.select(this).selectAll("g").data(x).enter().append("g")
        .attr("transform", (d, i) => `translate(${(columns.length - i - 1) * size},0)`)
        .each(function(d, i) { return d3.select(this).call(axis.scale(d).tickFormat(i == 0 ? (v) => `${v}%` : d3.format(".2s") )); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  }
  
  svg.append("g")
      .attr("class", "x axis")
      .each(xAxis);

  function yAxis() {
    
    const axis = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length);
    
    d3.select(this).selectAll("g").data(y).enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * size})`)
        .each(function(d, i) { return d3.select(this).call(axis.scale(d).tickFormat(i == 0 ? (v) => `${v}%` : d3.format(".2s") )); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  }

  svg.append("g")
      .attr("class", "y axis")
      .each(yAxis);

  const cell = svg.append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
    .join("g")
      .attr("class", "cell")
      .attr("transform", ([i, j]) => `translate(${(columns.length - i - 1) * size},${j * size})`);  

  cell.append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding) 
      .attr("height", size - padding);
  
  
  if(brushing) {
    cell.call(brush);
  }
  
  cell.each(function([i, j]) {
    
      const hex = d3.hexbin()
          .x(d => x[i](d[columns[i]]))
          .y(d => y[j](d[columns[j]]))
          .radius(radiusSize)
          .extent([[0, 0], [size - padding, size - padding]])

      const bins = hex(data)
        
      const color = d3.scaleSequential(d3.interpolateSpectral)
          .domain([0, d3.max(bins, d => d.length) / 2])
          
      d3.select(this)
        .selectAll("path")
        .data(bins, d => `${d.x}-${d.y}`)
        .join("path")
        .attr("class", "hex")
        .attr("d", d => hex.hexagon())
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .style("fill", d => color(d.length))
        .style("stroke", d => color(d.length))
        .style("stroke-width", .5)
        .on("mousemove", d => onHover(d))
        .on("mouseout", d => onHover(null))
    
  });
  

  svg.append("g")
      .style("font", "bold 10px sans-serif")
    .selectAll("text")
    .data(columns)
    .join("text")
      .attr("transform", (d, i) => `translate(${(columns.length - i - 1) * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(d => d);
  
  let brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.move, null);
      brushCell = this;
    }
    
    svg.classed("brushing", true);
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var e = d3.brushSelection(this);   
    if(!e) {
      d3.selectAll(".hex").style("fill-opacity", 1)
    } else {
      
      const xScale = x[p[0]]
      const yScale = y[p[1]]

      const xRange = [xScale.invert(e[0][0]), xScale.invert(e[1][0])]
      const yRange = [yScale.invert(e[0][1]), yScale.invert(e[1][1])]
    
      const filteredData = data
         .filter(d => d[columns[p[0]]] >= xRange[0] 
                    & d[columns[p[0]]] <= xRange[1] 
                    & d[columns[p[1]]] <= yRange[0]
                    & d[columns[p[1]]] >= yRange[1]);
      onHover(filteredData);
      cell.each(function([i, j]) {
        d3.selectAll(".hex")
          .style("fill-opacity", d => {
            const dem = d.length 
            const numerator = d.filter(e => 
                      e[columns[p[0]]] >= xRange[0] 
                    & e[columns[p[0]]] <= xRange[1] 
                    & e[columns[p[1]]] <= yRange[0]
                    & e[columns[p[1]]] >= yRange[1]).length;
            return numerator / dem;
          })
      });

    }
    svg.classed("brushing", true);

  }

  // If the brush is empty, select all circles.
  function brushend() {
    var e = d3.brushSelection(this);
    if (e === null){ 
      d3.selectAll(".hex").style("fill-opacity", 1);
      svg.classed("brushing", false);
      onHover(null);
    }
    
  } 
  
  return svg.node();
  
}
)});
  main.variable(observer("data")).define("data", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/git-ashish/acde4c3c03ae6c30d35eebe70707f255/raw/d6d6a6040afc4acc4ffb88e596417c21e6ed9f59/survey.csv", d3.autoType)
)});
  main.variable(observer("columns")).define("columns", ["matrixcolumns"], function(matrixcolumns){return(
matrixcolumns
)});
  main.variable(observer("petaldata")).define("petaldata", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/mbostock/b038321e2a8177baf9e6a547195da966/raw/6c8eb7f5c644be0394f7fc384e42de9fab41927f/iris.csv", d3.autoType)
)});
  main.variable(observer("width")).define("width", function(){return(
768
)});
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer("padding")).define("padding", function(){return(
20
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<style>

.brushing path.hex {
  pointer-events: none;
}
</style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5","d3-tile@0.0", "d3-hexbin@0.2")
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("radio", child1);
  return main;
}
