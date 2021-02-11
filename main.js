"use-strict;"

import { getDataset, getGroupedData, getQuantileData } from "./aux.js";

getDataset().then((data) => {
    
    const aGroupedData = getGroupedData(data, 'United States', 'Experience');
    const aQuantData = getQuantileData(aGroupedData, "base_usd", 0.014);

    console.log('data', data, aQuantData);

    renderCompensation(document.getElementById("compensation-graph"), aQuantData);

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
function renderCompensation(elTargetDom, aData) {
    const elWrapper = document.createElement("div");
    const elUl = document.createElement("ul");
    elWrapper.appendChild(elUl);

    const ul = d3.select(elUl);
    ul.classed("cg-group", true);

    const li = ul.selectAll("li.cg-li")
        .data(aData);

    const liSelection = li.join("li")
        .classed("cg-li", true)
        .html(d => `<div>

            <div class="left-content">
                <label class="lbl-title">${d[0]}</label>
                <label class="lbl-subtitle">${d[4]} record${d[4] > 1 ? 's' : ''}</label>
            </div>
            <div class="right-content">
                Median of <i>${d[3]}</i>
            </div>
        `);
        // .html(d => `${d[0]} – Median of <i>${d[3]}</i> having ${d[4]} records`);
    
    liSelection.on("click", (event, d) => {
        console.log(event.currentTarget, d);
        renderCompensation(event.currentTarget, d[1]);
    })
    
    elTargetDom.appendChild(elWrapper);
}