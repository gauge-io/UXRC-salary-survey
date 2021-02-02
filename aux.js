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

export { applyFiltersOnData };