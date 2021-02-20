import {
	getDataset,
	getGroupedData,
	getQuantileData,
	renderCompensation,
	renderCurrencyFilter,
	getFilterValues,
} from "./aux.js";

class App {
	constructor() {
		this.dispatch = d3.dispatch("filterChanged", "dataAvailable");
		this.data = null;
		getDataset().then((data) => {
			this.data = data;
			this.dispatch.apply("dataAvailable");
		});
		renderCurrencyFilter("select[data-metric=currency]");
	}

	init() {
		console.log("app.frontend.min.js -> App -> init()");
		const dispatch = this.dispatch;
		const app = this;

		barba.init({
			debug: true,
			views: [
				// INDEX
				{
					namespace: "index",
					beforeEnter(data) {},
					afterEnter(data) {
						console.log("data", data)

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
					},
				},

				// CONFIG
				{
					namespace: "commutation",
					beforeEnter(data) {},
					afterEnter(data) {},
					beforeLeave(data) {},
				},

				// ANALYZE
				{
					namespace: "correlation",
					beforeEnter(data) {},
					afterEnter(data) {},
					beforeLeave(data) {},
				},
			],
			transitions: [
				{
					name: "page-transition",
					once(data) {
						// console.log( 'SPA.js -> first load', data.next.container.dataset.barbaNamespace );
					},

					leave(data) {},
					afterLeave(data) {},
					enter(data) {
						// console.log( 'barba: enter:', data.next.container.dataset.barbaNamespace );
					},
					afterEnter(data) {},
					after(data) {},
				},
			],
		});

		this.initEventListeners();
	}

	initEventListeners() {
		const dispatch = this.dispatch;
		
		// Render Graph
		// TODO: On filter change as well
		dispatch.on("filterChanged", (oPayload) => {
			setTimeout(() => {
				this.compensation();
			}, 1);
		});

		// Bind listeners on filters
		d3.selectAll(".single-dropdown select")
			.on("change", function (e) {
				const sMetric = this.getAttribute("data-metric"),
					sValue = this.value;
				console.log(sMetric, sValue);
				dispatch.apply("filterChanged");
			});
		
		d3.selectAll(".checkbox input")
			.on("change", function (e) {
				const sMetric = this.getAttribute("data-metric"),
					sValue = this.value;
				console.log(sMetric, sValue);
				dispatch.apply("filterChanged");
			})
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
			oFilters.adjust,
		);
		const maxQuantBoundary = d3.max(aQuantData, (d) => d[2][3]);

		console.log("data", aQuantData[0], oFilters);

		// TODO: Truncate
		if (oFilters["truncate-results"]) {
			
		} else {
			renderCompensation(
				document.getElementById("compensation-graph"),
				aQuantData,
				maxQuantBoundary
			);
		}

	}
}

const app = new App();
document.addEventListener("DOMContentLoaded", app.init());
