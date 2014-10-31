'use strict';

angular.module('ds.directives', [])
 .directive('jqSparkline', [function () {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {

             var opts={};
             //TODO: Use $eval to get the object
            opts.type = attrs.type || 'line';

            scope.$watch(attrs.ngModel, function () {
                render();
            });
            
            scope.$watch(attrs.opts, function(){
              render();
            }, true);
            var render = function () {
                var model;
                if(attrs.opts) angular.extend(opts, angular.fromJson(attrs.opts));
                //console.log(opts);
                // Trim trailing comma if we are a string
                angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;
                var data;
                // Make sure we have an array of numbers
                angular.isArray(model) ? data = model : data = model.split(',');
                $(elem).sparkline(data, opts);
            };
        }
    }
}])

.directive('map', function() {
    return {
        restrict: 'EAC', 
        link: function(scope, element, attrs) {
          var chart = null;
  
           scope.$watch("datamap" , function(n,o){ 
            
            if (scope.datamap) {
                var statesValues = jvm.values.apply({}, jvm.values(scope.datamap.states));
                //var metroPopValues = Array.prototype.concat.apply([], jvm.values(scope.datamap.metro.population));
                //var metroTweets = Array.prototype.concat.apply([], jvm.values(scope.datamap.metro.tweets));

                var lbl;

                 if(!chart)
                 {
                    //$(element).width('auto')
                    $(element).height(600)

                    chart = $(element).vectorMap({
                            map: 'us_aea_en',
                            backgroundColor: 'white',                            
                            markersSelectable: true,
                            regionsSelectable: false,
                            zoomMax: 1,
                            hoverOpacity: 0.7,                             
                            series: {
                                regions: [{
                                  scale: ['#DEEBF7', '#08519C'],
                                  attribute: 'fill',
                                  values: scope.datamap.states.data,
                                  min: jvm.min(statesValues),
                                  max: jvm.max(statesValues)
                                }]
                              },
                            onRegionLabelShow: function(e, el, code){
                                lbl = el;
                                el.html(el.html() + ": " + scope.datamap.states.data[code] + "k Data Stream ");
                            },
                             onRegionOut: function(e, code) {
                                // return to normal cursor
                                document.body.style.cursor = 'default';
                                //el.html('');
                            },
                            onRegionOver: function(event, code)
                            {
                                document.body.style.cursor = 'pointer';
                            },
                            onRegionClick: function(event, code)
                            {
                                lbl.remove();
                                document.body.style.cursor = 'default';                                
                                // if (regionInfo[code]) {
                                //     //window.location = regionInfo[code].location;
                                //     scope.loadState();
                                // }
                                scope.loadState();
                            }
                    })

                    //chart.setSelectedRegions( JSON.parse( window.localStorage.getItem('jvectormap-selected-regions') || '[]' ) );

                 }else{
                    chart.vectorMap('get', 'mapObject').series.regions[0].setValues(scope.datamap)
                    chart.vectorMap('get', 'mapObject').series.regions[0].setNormalizeFunction('polynomial')
                    chart.vectorMap('get', 'mapObject').series.regions[0].setScale(['#C8EEFF','#0071A4'])
                 }
            }
          });              
        }
    }; 
})
.directive('treeMap', function() {
    return {
        restrict: 'E',
        replace: true,
        template: function() {
            return '<form>' + '<label><input type="radio" ng-model ="radioData.selected" value="size" ng-change = "changeRadio()" > Size</label>' + '<label><input type="radio" ng-model ="radioData.selected" value="count" ng-change = "changeRadio()"> Count</label>' + '</form>';

        },
        link: function(scope, element, attrs) {
            scope.config = JSON.parse(attrs.config);
            scope.color = d3.scale.category20c();
            scope.radioData = {
                'selected': 'size'
            };
            scope.position = function() {
                this.style("left", function(d) {
                    return d.x + "px";
                })
                    .style("top", function(d) {
                    return d.y + "px";
                })
                    .style("width", function(d) {
                    return Math.max(0, d.dx - 1) + "px";
                })
                    .style("height", function(d) {
                    return Math.max(0, d.dy - 1) + "px";
                });
            };
            scope.treemap = d3.layout.treemap()
                .size([scope.config.width, scope.config.height])
                .sticky(true)
                .value(function(d) {
                return d.size;
            });
            scope.div = d3.select("div").append("div")
                .style("position", "relative")
                .style("width", (scope.config.width + scope.config.margin.left + scope.config.margin.right) + "px")
                .style("height", (scope.config.height + scope.config.margin.top + scope.config.margin.bottom) + "px")
                .style("left", scope.config.margin.left + "px")
                .style("top", scope.config.margin.top + "px");
            scope.changeRadio = function() {
                var value = scope.radioData.selected === "count" ? function() {
                        return 1;
                    } : function(d) {
                        return d.size;
                    };
                scope.node.data(scope.treemap.value(value).nodes)
                    .transition()
                    .duration(1500)
                    .call(scope.position);
            };
            d3.json(scope.config.dataJSON, function(error, root) {
                scope.node = scope.div.datum(root).selectAll(".node")
                    .data(scope.treemap.nodes)
                    .enter().append("div")
                    .attr("class", "node")
                    .call(scope.position)
                    .style("background", function(d) {
                    return d.children ? scope.color(d.name) : null;
                })
                    .text(function(d) {
                    return d.children ? null : d.name;
                });
            });
        }
    };
});
