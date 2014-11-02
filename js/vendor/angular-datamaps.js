'use strict';

angular.module('datamaps', []);

'use strict';

angular.module('datamaps')

  .directive('datamap', ['$compile', function($compile) {
    return {
      restrict: 'EA',
      scope: {
        data: '=',			//map data, [required]
        options: '=',		//map options, [required]
        colors: '=?',    //map colors array, [optional]
        type: '@?',     //map scope, world or usa, [optional, defaults to usa]
      },
      link: function(scope, element) {

        // Generate base map options
        function mapOptions() {
          return {
            element: element[0].children[0],
            scope: (scope.type === 'usa' || scope.type === 'world') ? scope.type : 'usa',
            height: scope.height,
            width: scope.width,
            projection: scope.type === 'world' ? 'mercator' : 'equirectangular',
            fills: {
              defaultFill: '#b9b9b9'
            },
            data: {}
          };
        }

        // Extend the mapOptions object with data and fill values
        function mapData(dst, data) {
          angular.forEach(data, function(val) {
            dst.data[val.location] = { fillKey: val.value };
          });

          if (!scope.options.fillQuartiles) {
            var fillKeys = [];
            angular.forEach(data, function(data) {
              if (fillKeys.indexOf(data.value) === -1) {
                fillKeys.push(data.value);
              }
            });

            angular.forEach(fillKeys, function(key, idx) {
              dst.fills[key] = scope.colors[idx];
            });
          }
          else {
            // @TODO Map numeric ranges to quartiles
          }

          return dst;
        }

        scope.mapOptions = mapOptions();

        scope.api = {

          // Fully refresh directive
          refresh: function() {
            scope.api.updateWithOptions(scope.options, scope.data);
          },

          // Update chart with new options
          updateWithOptions: function(options, data) {

            // Clearing
            scope.api.clearElement();

            // Exit if options are not yet bound
            if (!angular.isDefined(options)) {
              return;
            }

            // Update bounding box
            scope.width = options.width || 600;
            scope.height = options.height || scope.width * 0.6;
            scope.legendHeight = options.legendHeight || 50;

            scope.mapOptions = mapOptions();

            // Add data to map redraw
            if (data[0].values.length) {
              // update the map element
              scope.mapOptions = mapData(scope.mapOptions, data[0].values);
            }

            scope.mapOptions.geographyConfig = angular.extend({}, options.geographyConfig);

            scope.map = new Datamap(scope.mapOptions);

            if (!options) {
              return;
            }

            // set labels
            if (options.labels) {
              scope.map.labels({
                labelColor: options.labelColor ? options.labelColor : '#333333',
                fontSize: options.labelSize ? options.labelSize : 12
              });
            }

            // set legend
            if (options.legend) {
              scope.map.legend();
            }

          },

          // Update chart with new data
          updateWithData: function(data) {
            scope.map.updateChoropleth(data);
          },

          // Fully clear directive element
          clearElement: function () {
            scope.map = null;
            element.empty();
            var mapContainer = $compile('<div style="position: relative; display: block; padding-bottom: {{ legendHeight }}px;"></div>')(scope);
            element.append(mapContainer);
          }
        };

        // Watching on options, colors changing
        scope.$watch('[options, colors]', function() {
          scope.api.refresh();
        }, true);

        // Watch data changing. Only refresh if options or data map points have changed
        scope.$watch('data', function(data, old) {
          if (data[0].values.length !== old[0].values.length) {
            scope.api.refresh();
          }
          else {
            var _data = {};
            angular.forEach(data[0].values, function(val) {
              _data[val.location] = { fillKey: val.value };
            });
            scope.api.updateWithData(_data);
          }
        }, true);
      }
    };
  }]);
