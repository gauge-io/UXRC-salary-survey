import {
	getDataset,
	getGroupedData,
	getQuantileData,
	renderCompensation,
	renderCurrencyFilter,
	getFilterValues,
	getFilters,
	applyFiltersOnData,
	addMapStyleProperties,
	getGeoJSONArcDataset,
	getGeoJSONPointDataset,
	getUniqueOfficeLocations,
	getUniqueParticipantLocations,
	getOfficeToResidenceArcsDataset,
	showTooltip,
	hideTooltip,
	currencyFormat,
} from "./_aux.js";

// mapbox token
mapboxgl.accessToken =
	"pk.eyJ1IjoiaWFzaGlzaHNpbmdoIiwiYSI6ImNra2dweDA5aTE1czMydW1ucGxkYTdtY2sifQ.mbkBR2PjRtKrpAw59dvJ_g";

class App {
	constructor() {
		this.dispatch = d3.dispatch("filterChanged", "dataAvailable");
		this.data = null;

		this.map;

		getDataset().then((data) => {
			this.data = data;
			this.dispatch.apply("dataAvailable");
			console.log("data", data);
		});
	}

	init() {
		console.log("app.frontend.min.js -> App -> init()");
		const dispatch = this.dispatch;
		const app = this;

		const setLegendIsVisible = () => {
			document.querySelector( '.section-legend' ).classList.toggle( 'isVisible' );
		};

		barba.init({
			debug: true,
			views: [
				// INDEX
				{
					namespace: "index",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="compensation"]' ).classList.add( 'active' );

						console.log("data", data);

						renderCurrencyFilter("select[data-metric=currency]");

						// Render Graph
						dispatch.on("filterChanged.compensation", (oPayload) => {
							setTimeout(() => {
								app.compensation();
							}, 1);
						});

						if (app.data) {
							dispatch.apply("filterChanged");
						} else {
							const iDataLoadInterval = setInterval(() => {
								if (app.data) {
									clearInterval(iDataLoadInterval);
									dispatch.apply("filterChanged");
								}
							}, 100);
						}
					},
					beforeLeave(data) {
						// console.log( 'SPA.js -> leaving index' );
						dispatch.on("filterChanged.compensation", null);
					},
				},

				// CONFIG
				{
					namespace: "commutation",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="commutation"]' ).classList.add( 'active' );

						renderCurrencyFilter("select[data-metric=currency]");

						// Render Graph
						dispatch.on("filterChanged.commutation", (oPayload) => {
							setTimeout(() => {
								const aData = JSON.parse(JSON.stringify(app.data));

								const aFilterdData = addMapStyleProperties(applyFiltersOnData(getFilters(), aData));

								console.log("filterChanged.commutation", oPayload, aFilterdData);

								if (!app.bMapRendered) {
									app.bMapRendered = true;
									app.commutation();
								} else {

									const map = app.map;

									// ui related filters
									if ([ "commute" , ].includes(Object.keys(oPayload)[0])) {
										if (oPayload.commute) {
											map.setLayoutProperty("arcs-layer", "visibility", oPayload.commute);
										}
									} else {

										// add participants data as a source to map
										map.getSource("participants-source")
											.setData(getGeoJSONPointDataset(getUniqueParticipantLocations(aFilterdData)));

										// add office locations data as a source
										map.getSource("office-source")
											.setData(getGeoJSONPointDataset(getUniqueOfficeLocations(aFilterdData)));

										// add office-to-residence arcs data as a source
										map.getSource("arcs-source")
											.setData(getGeoJSONArcDataset(getOfficeToResidenceArcsDataset(aFilterdData)));
									}
								}

							}, 1);
						});

						if (app.data) {
							dispatch.apply("filterChanged");
						} else {
							const iDataLoadInterval = setInterval(() => {
								if (app.data) {
									clearInterval(iDataLoadInterval);
									dispatch.apply("filterChanged");
								}
							}, 100);
						}

					},
					beforeLeave(data) {
						dispatch.on("filterChanged.commutation", null);
					},
				},

				// ANALYZE
				{
					namespace: "correlation",
					beforeEnter(data) {},
					afterEnter(data) {
						document.querySelector( '[data-page="correlation"]' ).classList.add( 'active' );
					},
					beforeLeave(data) {},
				},
			],
			transitions: [
				{
					name: "page-transition",
					once(data) {
						// console.log( 'SPA.js -> first load', data.next.container.dataset.barbaNamespace );
						document.querySelector( '#toggle-legend' ).addEventListener( 'click', setLegendIsVisible );
					},

					async leave(data) {
						document.querySelectorAll( 'ul.menu li').forEach( item => item.classList.remove( 'active') );
						document.querySelector( '.animation-content').classList.add( 'animate' );
						await new Promise(resolve => setTimeout(resolve, 1000));

						document.querySelector( '#toggle-legend' ).removeEventListener( 'click', setLegendIsVisible );
						// console.log( 'leave ');
					},
					afterLeave(data) {

					},
					enter(data) {
						// console.log( 'barba: enter:', data.next.container.dataset.barbaNamespace );
						// console.log( 'enter ');
						document.querySelector( '#toggle-legend' ).addEventListener( 'click', setLegendIsVisible );
					},
					async afterEnter(data) {
						// await new Promise(resolve => setTimeout(resolve, 500));
						document.querySelector( '.animation-content').classList.remove( 'animate' );
					},
					after(data) {},
				},
			],
		});

		this.initEventListeners();
	}

	initEventListeners() {
		const dispatch = this.dispatch;

		// Bind listeners on filters
		d3.selectAll(".single-dropdown select").on("change", function (e) {
			const sMetric = this.getAttribute("data-metric"),
				sValue = this.value;
			console.log(sMetric, sValue);
			dispatch.apply("filterChanged", this, [ {[sMetric]: sValue,} , ]);
		});

		d3.selectAll(".checkbox input").on("change", function (e) {
			const sMetric = this.getAttribute("data-metric"),
				sValue = this.value;
			console.log(sMetric, sValue);
			dispatch.apply("filterChanged");
		});
	}

	compensation() {
		const aData = JSON.parse(JSON.stringify(this.data));
		const oFilters = getFilterValues();
		const aGroupedData = getGroupedData(
			aData,
			oFilters.primary,
			oFilters.secondary
		);
		const aQuantData = getQuantileData(
			aGroupedData,
			oFilters.calculate,
			Number(oFilters.currency),
			oFilters.adjust
		);
		const maxQuantBoundary = d3.max(aQuantData, (d) => d[5]);

		console.log("data", aQuantData, oFilters, maxQuantBoundary);

		// TODO: Truncate
		if (oFilters["truncate-results"]) {
			d3.select("#truncated-comp").classed("visible", true);
			d3.select("#all-comp").classed("visible", false);

			renderCompensation(
				document.getElementById("top-5"),
				aQuantData.slice(0, 5),
				maxQuantBoundary
			);

			renderCompensation(
				document.getElementById("bottom-5"),
				aQuantData.slice(-5),
				maxQuantBoundary
			);
		} else {
			d3.select("#truncated-comp").classed("visible", false);
			d3.select("#all-comp").classed("visible", true);

			renderCompensation(
				document.getElementById("all-comp"),
				aQuantData,
				maxQuantBoundary
			);
		}
	}

	commutation() {

		const map = this.map = new mapboxgl.Map({
			container: "commutation-map", // Specify the container ID
			style: "mapbox://styles/mapbox/dark-v10", // Specify which map style to use
			zoom: 1.34,
			center: [ 13.747157081573533, 7.254837457058102 , ],
		});

		map.on("load", () => {

			const dataset = addMapStyleProperties(JSON.parse(JSON.stringify(this.data)));

			// add participants data as a source to map
			map.addSource("participants-source", {
				type: "geojson",
				data: getGeoJSONPointDataset(getUniqueParticipantLocations(dataset)),
				cluster: false,
				// Max zoom to cluster points on
				clusterMaxZoom: 13,
				// // Radius of each cluster when clustering points (defaults to 50)
				// clusterRadius: 50
			});

			// add office locations data as a source
			map.addSource("office-source", {
				type: "geojson",
				data: getGeoJSONPointDataset(getUniqueOfficeLocations(dataset)),
			});

			// add office-to-residence arcs data as a source
			map.addSource("arcs-source", {
				type: "geojson",
				data: getGeoJSONArcDataset(getOfficeToResidenceArcsDataset(dataset)),
			});

			// add office location layer
			map.addLayer({
				id: "office-layer",
				type: "circle",
				source: "office-source",
				//'source-layer': 'sf2010',
				paint: {
					// make circles larger as the user zooms from z12 to z22
					"circle-radius": {
						base: 5,
						stops: [
							[ 12, 5 , ],
							[ 22, 180 , ],
						],
					},
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					"circle-color": "rgb(255,234,0)",
					"circle-opacity": 0.85,
				},
			});

			// add arcs layer
			map.addLayer({
				id: "arcs-layer",
				type: "line",
				source: "arcs-source",
				paint: {
					// // make circles larger as the user zooms from z12 to z22
					// 'circle-radius': {
					//     'base': 6,
					//     'stops': [
					//         [12, 6],
					//         [22, 10]
					//     ]
					// },
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					//'circle-color': "orange",
					"line-color": "rgb(54,151,14)",
					"line-opacity": 0.85,
					"line-width": [
						"interpolate",
						[ "linear" , ],
						[ "number", [ "get", "calculated_compensation" , ] , ],
						40000,
						0.1,
						60000,
						0.25,
						80000,
						0.5,
						100000,
						1,
						140000,
						2.5,
						160000,
						3.5,
						180000,
						5,
					],
				},
			});

			// add participants layer
			map.addLayer({
				id: "participants-layer",
				type: "circle",
				source: "participants-source",
				//'source-layer': 'sf2010',
				paint: {
					// make circles larger as the user zooms from z12 to z22
					// "circle-radius": {
					// 	base: 6,
					// 	stops: [
					// 		[ 12, 6 , ],
					// 		[ 22, 10 , ],
					// 	],
					// },
					"circle-radius": [
						"interpolate",
						[ "linear" , ],
						[ "number", [ "get", "count" , ] , ],
						5,
						3,
						25,
						5,
						50,
						8,
						75,
						11,
						100,
						15,
					],
					// color circles by ethnicity, using a match expression
					// https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
					"circle-color": "rgb(54,151,14)",
					// "circle-color": [
					// 	"interpolate-hcl",
					// 	[ "linear" , ],
					// 	[ "number", [ "get", "calculated_compensation" , ] , ],
					// 	40000,
					// 	"#2DC4B2",
					// 	60000,
					// 	"#3BB3C3",
					// 	80000,
					// 	"#669EC4",
					// 	100000,
					// 	"#8B88B6",
					// 	140000,
					// 	"#A2719B",
					// 	180000,
					// 	"#AA5E79",
					// ],
					"circle-stroke-width": 1,
					"circle-stroke-color": [
						"case",
						[ "boolean", [ "get", "is_office_same_city" , ] , ],
						"yellow",
						"transparent",
					],
				},
			});

			// add markers for undefined locations
			// dataset.filter(d => d.marker).forEach(d => {
			// 	// create a DOM element for the marker
			// 	var el = document.createElement('div');
			// 	el.className = 'marker';
			// 	el.innerHTML = d.marker;

			// 	var marker = new mapboxgl.Marker(el)
			// 		.setLngLat([ d.lon, d.lat , ])
			// 		.addTo(map);
			// });

			map.on('mousemove', 'participants-layer', function (e) {
				map.getCanvas().style.cursor = 'pointer';

				const elMap = document.getElementById("commutation-map");
				const { top } = elMap.getBoundingClientRect();
				
				const { x, y } = e.point;
				const datum = e.features[0].properties;

				const { currencyCode } = getFilterValues();
				
				const coordinates = e.features[0].geometry.coordinates.slice();

				const _tipContent = `
					<label class="nom">${datum.residence}</label>
					<label class="sep"></label>
					<label class="nom">${datum.count} Respondent${datum.count > 1 ? 's' : ''}</label>
					<label class="sep"></label>
					<label class="nom">Average Salary – ${currencyCode} ${currencyFormat(datum.avg_calculated_compensation)}</label>
				`;
				showTooltip(_tipContent, x + 60, y + top + window.scrollY);

				// mapPopup
				// 	.setLngLat(coordinates)
				// 	.setHTML(d3.create("div").html(`${datum.base_usd}`).node().innerHTML)
				// 	.addTo(map);
			});
			map.on('mouseleave', 'participants-layer', function () {
				map.getCanvas().style.cursor = '';
				hideTooltip();
			});

			map.on('mousemove', 'office-layer', function (e) {
				map.getCanvas().style.cursor = 'pointer';

				const elMap = document.getElementById("commutation-map");
				const { top } = elMap.getBoundingClientRect();
				
				const { x, y } = e.point;
				const datum = e.features[0].properties;

				const { currencyCode } = getFilterValues();
				
				const coordinates = e.features[0].geometry.coordinates.slice();

				const _tipContent = `
					<label class="nom">${datum.residence}</label>
					<label class="sep"></label>
					<label class="nom">${datum.count} Respondent${datum.count > 1 ? 's' : ''}</label>
					<label class="sep"></label>
					<label class="nom">Average Salary – ${currencyCode} ${currencyFormat(datum.avg_calculated_compensation)}</label>
				`;
				showTooltip(_tipContent, x + 60, y + top + window.scrollY);

			});
			map.on('mouseleave', 'office-layer', function () {
				map.getCanvas().style.cursor = '';
				hideTooltip();
			});

			map.on('mousemove', 'arcs-layer', function (e) {
				map.getCanvas().style.cursor = 'pointer';

				const elMap = document.getElementById("commutation-map");
				const { top } = elMap.getBoundingClientRect();
				
				const { x, y } = e.point;
				const datum = e.features[0].properties;

				const { currencyCode } = getFilterValues();
				
				const coordinates = e.features[0].geometry.coordinates.slice();

				const getPositionsHTML = (aPositions) => aPositions.map(p => `<label class="nom">${p}</label>`).join('');

				const _tipContent = `
					<label class="nom">${datum.residence}</label>
					<label class="sep"></label>
					<label class="nom">${datum.office_metro}, ${datum.office_country}</label>
					<label class="sep"></label>
					<label class="nom">${datum.count} Respondent${datum.count > 1 ? 's' : ''}</label>
					<label class="sep"></label>
					<label class="nom">Average Salary – ${currencyCode} ${currencyFormat(datum.avg_calculated_compensation)}</label>
					<label class="sep"></label>
					${getPositionsHTML(JSON.parse(datum.aPositions) || [])}
				`;
				showTooltip(_tipContent, x + 60, y + top + window.scrollY);

			});

			map.on('mouseleave', 'arcs-layer', function () {
				map.getCanvas().style.cursor = '';
				hideTooltip();
			});

		});
	}
}

const app = new App();
document.addEventListener("DOMContentLoaded", app.init());
