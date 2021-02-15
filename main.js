"use-strict;";

import { getDataset, getGroupedData, getQuantileData } from "./aux.js";

getDataset().then((data) => {
  const aGroupedData = getGroupedData(data, "United States", "Experience");
  const aQuantData = getQuantileData(aGroupedData, "base_usd", 0.014);
  const maxQuantBoundary = d3.max(aQuantData, (d) => d[2][3]);

  console.log("data", data, aQuantData);

  renderCompensation(document.getElementById("compensation-graph"), aQuantData, maxQuantBoundary);
});

/**
 *
 * Structure:
 *
 * div
 *  |- ul
 *      |- li
 *          |- div
 *          |- div
 *
 * @param {*} aData
 */
function renderCompensation(elTargetDom, aData, maxQuantBoundary, bIsSecondLevel = false) {
  const elWrapper = document.createElement("div");
  const elUl = document.createElement("ul");
  elWrapper.appendChild(elUl);

  if (bIsSecondLevel) {
    elWrapper.classList.add("cg-li__subcontent");
  }

  const ul = d3.select(elUl);
  ul.classed("cg-group", true);

  const li = ul.selectAll("li.cg-li").data(aData);

  const liSelection = li
    .join("li")
    .classed("cg-li", true)
    .html(
      (d) => `<div">

            <div class="left-content">
                <label class="lbl-title">${d[0]}</label>
                <label class="lbl-subtitle">${d[4]} record${
        d[4] > 1 ? "s" : ""
      }</label>
            </div>
            <div class="right-content">
                ${compensationChart([...d[2], d[3]], maxQuantBoundary, 600, 35)}
            </div>
        `
    );
  
  if (!bIsSecondLevel) {
  
    liSelection.on("click", (event, d) => {
      // console.log(event.currentTarget, d);
      d.expanded = !d.expanded;

      if (!d.expandRendered && d.isPrimary) {
        d.expandRendered = true;
        renderCompensation(event.currentTarget, d[1], maxQuantBoundary, true);
      }

      // toggle class
      d3.select(event.currentTarget).classed("highlighted", d.expanded);
    });

  }

  elTargetDom.appendChild(elWrapper);
}

/**
 * Creates a dot chart
 *
 * @param {Array} data Expects 5 values. Quantiles and the last value being median
 * @param {float} maxValue Max value to use as the x axis extent
 * @param {*} cWidth
 * @param {*} height
 */
function compensationChart(data, maxValue, cWidth = 400, height = 50) {
  const svg = d3.create("svg").attr("viewBox", [0, 0, cWidth, height]);

  maxValue = maxValue || d3.max(data) * 1.1;

  const scaleLinear = d3
    .scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([20, cWidth - 20]);

  const dist = Math.floor(maxValue / 5);

  const axis = d3
    .axisBottom(scaleLinear)
    .tickSizeInner(0)
    .tickFormat("")
    .tickSizeOuter(0);

  const xAxis = (g) =>
    g.attr("transform", `translate(0,${height / 2})`).call(axis);

  svg.append("g").call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height / 2})`)
    .selectAll("path.shape")
    .data(data)
    .join("path")
    .attr("d", (d, i) =>
      d3.symbol(i == 4 ? d3.symbolSquare : d3.symbolCircle, 100)()
    )
    .attr(
      "transform",
      (d, i) => `translate(${scaleLinear(d)}, 0) rotate( ${i == 4 ? 45 : 0})`
    )
    .attr("stroke-width", 1)
    .attr("stroke", "#666")
    .attr(
      "fill",
      (d, i) =>
        [
          "rgb(251,113,114)",
          "rgb(238,209,135)",
          "rgb(91,201,51)",
          "rgb(49,153,13)",
          "rgb(252,254,95)",
        ][i]
    );

  return svg.node().outerHTML;
}
