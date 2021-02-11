/**
 * Apply a set of filters on a dataset.
 * Filters are AND
 * @param  {Array} aFilters Array of filter Objects
 * @param  {Array} aData    Dataset
 * @return {Array}          Filtered dataset. Does NOT modifies the input.
 */
function applyFiltersOnData(aFilters, aData) {
  var aFilteredData = _.cloneDeep(aData),
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
 * Parse salary value
 * @param {string} s
 */
function format_salary(s) {
  return Number(s?.replaceAll(",", "").replaceAll("$", "")) || 0;
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
    const quantile = d3.scaleQuantile().range(['A', 'B', 'C', 'D', 'E']);

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
      } else {
        // add calculated values
        sd.push(quantile.quantiles());
        sd.push(d3.median(aSalary));
      }

      // push to primary dimension level for calculation
      aPDLevelSalary.push.apply(aPDLevelSalary, aSalary);
    });

    // primary dimension level details
    quantile.domain(aPDLevelSalary);
    
    // salary quantiles
    pd[2] = quantile.quantiles();
    // median salary
    pd[3] = d3.median(aPDLevelSalary);
    // number of records
    pd[4] = aPDLevelSalary.length;

  });

  return aGroupedData;
}

async function getDataset() {
  return (await fetch("./parsedData.json")).json()
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

export {
  getDataset,
  applyFiltersOnData,
  format_salary,
  getGroupedData,
  getQuantileData,
  CURRENCY_DATA,
};
