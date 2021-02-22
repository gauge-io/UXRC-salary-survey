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
function renderCompensation(
	elTargetDom,
	aData,
	maxQuantBoundary,
	bIsSecondLevel = false,
	iGraphWidth = 400
) {
	const elWrapper = document.createElement("div");
	const elUl = document.createElement("ul");
	elWrapper.appendChild(elUl);
	elWrapper.classList.add(
		bIsSecondLevel ? "cg-li__subcontent" : "cg-li__primarycontent"
	);

	// cleanup
	if (!bIsSecondLevel) {
		elTargetDom.innerHTML = null;
	}
	elTargetDom.appendChild(elWrapper);

	const graphWidth =
		iGraphWidth || Math.floor(0.7 * elWrapper.getBoundingClientRect().width);

	console.log(graphWidth);

	const ul = d3.select(elUl);
	ul.classed("cg-group", true);

	const li = ul.selectAll("li.cg-li").data(aData);

	const liSelection = li
		.join("li")
		.classed("cg-li", true)
		.html(
			(d) => `
        <div>
            <div class="left-content">
                <label class="lbl-title">${d[0]}</label>
                <label class="lbl-subtitle">${d[4]} record${
				d[4] > 1 ? "s" : ""
			}</label>
            </div>
            <div class="right-content">
                ${compensationChart(
									[...d[2], d[3]],
									maxQuantBoundary,
									graphWidth,
									35
								)}
            </div>
        </div>
        `
		);

	if (!bIsSecondLevel) {
		liSelection.on("click", (event, d) => {
			// console.log(event.currentTarget, d);
			d.expanded = !d.expanded;

			if (!d.expandRendered && d.isPrimary) {
				d.expandRendered = true;
				renderCompensation(
					event.currentTarget,
					d[1],
					maxQuantBoundary,
					true,
					graphWidth
				);
			}

			// toggle class
			d3.select(event.currentTarget).classed("highlighted", d.expanded);
		});
	}
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

/**
 * Apply a set of filters on a dataset.
 * Filters are AND
 * @param  {Array} aFilters Array of filter Objects
 * @param  {Array} aData    Dataset
 * @return {Array}          Filtered dataset. Does NOT modifies the input.
 */
function applyFiltersOnData(aFilters, aData) {
	var aFilteredData = aData,
		aBooleanFilters = [];

	// Loop for each filter type
	// and build boolean functions
	//

	aFilters.forEach(function (oF) {
		// Type of filter.
		// Determines how its value properties should be treated.
		// Supported types - dropdown, multi-dropdown, checkbox
		//
		var sType = oF.type;

		try {
			if (sType == "range-slider") {
				try {
					/**
					 * value is an object with two properties min & max
					 */
					aBooleanFilters.push(function (d) {
						var b;

						try {
							b = oF.isRangeValue
								? d[oF.metric].min >= oF.value.min &&
								  d[oF.metric].max <= oF.value.max
								: d[oF.metric] >= oF.value.min && d[oF.metric] <= oF.value.max;
						} catch (e) {
							console.log("ERROR", "boolean", e.message);
						}

						return !!b;
					});
				} catch (e) {
					console.log("ERROR", "boolean filters", e.message);
				}
			} else if (sType == "dropdown") {
				// If value is 'All', return true
				//
				if (oF.value == "All") {
					return true;
				}

				try {
					/**
					 * value is string
					 */
					aBooleanFilters.push(function (d) {
						var b;

						try {
							b = d[oF.metric].toString() == oF.value;
						} catch (e) {
							console.log("ERROR", e.message);
						}

						return !!b;
					});
				} catch (e) {
					console.log("ERROR", e.message);
				}
			} else if (sType == "multi-dropdown") {
				/**
				 * value an Array of String
				 */
				aBooleanFilters.push(function (d) {
					// Empty Array or 'All' in the value means all are selected
					//
					if (!oF.value.length || oF.value.indexOf("All") > -1) {
						return true;
					}

					var b;

					try {
						// Two possibilities -
						// 1. When the metric value is not an array
						// 2. When the metric value is an array
						//
						if (Array.isArray(d[oF.metric]) && d[oF.metric].length) {
							// 2.
							b =
								_.difference(d[oF.metric], oF.value).length <
								d[oF.metric].length;
						} else {
							// 1.
							b = oF.value.indexOf(d[oF.metric]) > -1;
						}
					} catch (e) {
						console.log("ERROR", e.message);
					}

					return !!b;
				});
			} else if (sType == "checkbox") {
				/**
				 * value boolean
				 */
				aBooleanFilters.push(function (d) {
					var b;

					try {
						b = oF.value == !!d[oF.metric];
					} catch (e) {
						console.log("ERROR", e.message);
					}

					return !!b;
				});
			}
		} catch (e) {
			console.log("ERROR", "Filter", oF, e.message);
		}
	});

	// Apply functions on the dataset
	//

	aFilteredData = aFilteredData.filter(function (d) {
		var bPass = true,
			i = aBooleanFilters.length - 1;

		while (i > -1 && bPass) {
			bPass = bPass && aBooleanFilters[i--](d);
		}

		return bPass;
	});

	return aFilteredData;
}

/**
 * Prepare filters for the map data
 * @param {Object} oFilters
 */
function getFilters() {
	const oFilters = getFilterValues();
	const aKeys = Object.keys(oFilters);
	const aFilters = aKeys
		.filter((k) => {
			return !["calculate", "commute", "currency", "colorization"].includes(k);
		})
		.map((k) => {
			return {
				type: "dropdown",
				metric: k,
				value: oFilters[k],
			};
		});

	return aFilters;
}

/**
 * Parse salary value
 * @param {string} s
 */
function format_salary(s) {
	return Number((s || "").replaceAll(",", "").replaceAll("$", "")) || 0;
}

/**
 * Group data based on given primary and secondary dimensions
 * @param {Array} aData
 * @param {String} sPrimaryDimension
 * @param {String} sSecondaryDimension
 */
function getGroupedData(aData, sPrimaryDimension, sSecondaryDimension) {
	return d3.groups(
		aData.filter((d) =>
			sPrimaryDimension == "International" ? d.international : !d.international
		),
		(d) => d.residence,
		(d) => d[sSecondaryDimension]
	);
}

/**
 * Calculate quantile values on the dataset
 * @param {Array} aGroupedData
 * @param {String} sCalculateMetric
 * @param {Number} fCurrencyFactor
 * @param {Boolean} bAdjustCostOfLiving
 */
function getQuantileData(
	aGroupedData,
	sCalculateMetric,
	fCurrencyFactor,
	bAdjustCostOfLiving = false
) {
	aGroupedData.forEach((pd) => {
		const aPDLevelSalary = [];
		const quantile = d3.scaleQuantile().range(["A", "B", "C", "D", "E"]);

		pd[1].forEach((sd) => {
			const sFieldName = bAdjustCostOfLiving
				? `adjusted_${sCalculateMetric}`
				: sCalculateMetric;
			const aSalary = sd[1].map((d) => d[sFieldName] / Number(fCurrencyFactor));

			// secondary dimension level
			quantile.domain(aSalary);

			// is already calculated before?
			if (sd[2]) {
				// replace existing values
				sd[2] = quantile.quantiles();
				sd[3] = d3.median(aSalary);
				// number of records
				sd[4] = aSalary.length;
			} else {
				// add calculated values
				sd.push(quantile.quantiles());
				sd.push(d3.median(aSalary));
				sd.push(aSalary.length);
			}

			// push to primary dimension level for calculation
			aPDLevelSalary.push.apply(aPDLevelSalary, aSalary);
		});

		pd[1].sort((a, b) => d3.ascending(a[3], b[3]));

		// primary dimension level details
		quantile.domain(aPDLevelSalary);

		// salary quantiles
		pd[2] = quantile.quantiles();
		// median salary
		pd[3] = d3.median(aPDLevelSalary);
		// number of records
		pd[4] = aPDLevelSalary.length;

		pd.isPrimary = true;
	});

	return aGroupedData.sort((a, b) => d3.descending(a[4], b[4]));
}

async function getDataset() {
	return (await fetch("datasets/parsedData.json")).json();
}

/**
 * Get values of all the available filters on the page
 */
function getFilterValues() {
	const oFilters = {};

	d3.selectAll(".fi").each(function () {
		let el;

		if ((el = d3.select(this).select("select").node())) {
			oFilters[el.getAttribute("data-metric")] = el.value;
		}
		if ((el = d3.select(this).select("input[type=checkbox]").node())) {
			oFilters[el.getAttribute("data-metric")] = el.checked;
		}
	});

	return oFilters;
}

const CURRENCY_DATA = d3.csvParse(
	`Code,Name,Factor
AED,United Arab Emirates Dirham,0.27000
AUD,Australian Dollar,0.77000
CAD,Canadian Dollar,0.78000
BRL,Brazilian Real,0.19000
ARS,Argentinian Peso,0.01200
CHF,Swiss Franc,1.13000
CLP,Chilean Peso,0.00140
CZK,Czech Koruna,0.04700
GBP,British Pound,1.36000
COP,Colombian Peso,0.00029
DKK,Danish Krone,0.16000
EGP,Egyptian Pound,0.06400
EUR,European Dollar,1.23000
HUF,Hungarian Forint,0.00340
IDR,Indonesian Rupiah,0.00007
INR,Indian Rupee,0.01400
ISK,Icelandic Króna,0.00780
JPY,Japanese Yen,0.00970
KRW,South Korean Won,0.00092
MXN,Mexican Peso,0.05000
NGN,Nigerian Naira,0.00260
ILS,Israeli New Shekel,0.31000
NOK,Norwegian Krone,0.12000
NTD,New Taiwan Dollar,0.03600
NZD,New Zealand Dollar,0.72000
PEN,Peruvian Sol,0.27000
PHP,Philippine Peso,0.02100
ZAR,South African Rand,0.06800
RON,Romanian Leu,0.25000
RUB,Russian Ruble,0.01300
SEK,Swedish Krona,0.12000
SGD,Singapore Dollar,0.76000
TRY,Turkish Lira,0.13000
USD,United States Dollar,1.00000
VND,Vietnamese Dong,0.00004
`,
	d3.autoType
);

function renderCurrencyFilter(elSelector) {
	const selCurrency = d3
		.select(elSelector)
		.selectAll("option")
		.data(CURRENCY_DATA)
		.join("option")
		.attr("value", (d) => d.Factor)
		.html((d) => `${d.Code} – ${d.Name}`);

	selCurrency.filter((d) => d.Code == "USD").attr("selected", true);
}

function getUniqueOfficeLocations(aData) {
	const oOfficeLocationsByLatLon = {};
	JSON.parse(JSON.stringify(aData)).forEach((d) => {
		if (d.office_lat && d.office_lon && !d.is_office_same_city) {
			oOfficeLocationsByLatLon[`${d.office_lat},${d.office_lon}`] = d;
			d.lat = d.office_lat;
			d.lon = d.office_lon;
		}
	});
	return Object.values(oOfficeLocationsByLatLon);
}

function getGeoJSONPointDataset(aData) {
	return {
		type: "FeatureCollection",
		features: aData.map((d) => {
			return {
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [d.lon, d.lat],
				},
				properties: d,
			};
		}),
	};
}

function getOfficeToResidenceArcsDataset(aData) {
	// Add arcs from office to participants
	return aData.filter((d) => !d.is_office_same_city);
}

function getGeoJSONArcDataset(aData) {
  const {
    projection,
    lineDistance,
    midpoint,
    destination,
    bearing,
    lineArc,
    distance,
  } = turf;

  const aLineFeatures = [];
  aData.forEach((d) => {
    const start = {
        lat: d.office_lat,
        lon: d.office_lon,
      },
      finish = {
        lat: d.residence_lat,
        lon: d.residence_lon,
      };

    let route = {
      type: "LineString",
      coordinates: [
        [start.lon, start.lat],
        [finish.lon, finish.lat],
      ],
    };
    route = projection.toWgs84(route);
    const lineD = lineDistance(route, { units: "kilometers" });
    const mp = midpoint(route.coordinates[0], route.coordinates[1]);
    const center = destination(
      mp,
      lineD,
      bearing(route.coordinates[0], route.coordinates[1]) - 90
    );
    const lA = lineArc(
      center,
      distance(center, route.coordinates[0]),
      bearing(center, route.coordinates[1]),
      bearing(center, route.coordinates[0])
    );

    aLineFeatures.push(
      Object.assign(projection.toMercator(lA), {
        properties: d,
      })
    );
  });

  return {
    type: "FeatureCollection",
    features: aLineFeatures,
  };
}

function addMapStyleProperties(aData) {
  const oFilters = getFilterValues();

  // add Calculate property
  return aData.map(d => {

    d.calculated_compensation = d[oFilters.calculate];

    return d;
  })
}

export {
	getDataset,
	applyFiltersOnData,
	format_salary,
	getGroupedData,
	getQuantileData,
	CURRENCY_DATA,
	renderCompensation,
	compensationChart,
	getFilterValues,
	getFilters,
  renderCurrencyFilter,

  // Map utils
  addMapStyleProperties,
  getGeoJSONArcDataset,
	getGeoJSONPointDataset,
	getUniqueOfficeLocations,
	getOfficeToResidenceArcsDataset,
};
