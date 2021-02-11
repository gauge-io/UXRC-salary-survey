"use-strict;"

import { getDataset, getGroupedData, getQuantileData } from "./aux.js";

getDataset().then((data) => {
    
    const aGroupedData = getGroupedData(data, 'United States', 'Experience');
    const aQuantData = getQuantileData(aGroupedData, "base_usd", 0.014);

    console.log('data', data, aQuantData);

    const comp_graph_html = renderCompensation(aQuantData);

    document.getElementById("compensation-graph").innerHTML = comp_graph_html;

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
function renderCompensation(aData) {
    const elWrapper = document.createElement("div");
    const elUl = document.createElement("ul");
    elWrapper.appendChild(elUl);

    const ul = d3.select(elUl);

    const li = ul.selectAll("li.primary-dim")
        .data(aData);

    li.join("li")
        .html(d => `${d[0]} – Median of <i>${d[3]}</i> having ${d[4]} records`);
    
    return elWrapper.innerHTML;
}