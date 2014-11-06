'use strict';
function makeId  ()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

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
.directive('treemap', function () {

    return {      
      restrict: 'A',      
      scope: {
        config: '=',
        name: '&',
        detail: '&'
      },
      link: function (scope, element, attrs) {
        
        scope.config = scope.config;
        scope.width = $(element).width();
        scope.height = $(element).height();
        scope.margin = scope.config.margin;
        scope.formatNumber = d3.format(",d");
        scope.color = d3.scale.category20c();
        scope.transitioning = false;


        var x = d3.scale.linear()
          .domain([0, scope.width])
          .range([0,  scope.width]);

        var y = d3.scale.linear()
          .domain([0,  scope.height])
          .range([0,  scope.height]);

        scope.treemap = d3.layout.treemap()
          .children(function(d, depth) { return depth ? null : d._children; })
          .sort(function(a, b) { return a.value - b.value; })
          .ratio( scope.height /  scope.width * 0.5 * (1 + Math.sqrt(5)))
          .round(false);

        scope.svg = d3.select("#chart").append("svg")
          .attr("width",  scope.width +  scope.margin.left +  scope.margin.right)
          .attr("height",  scope.height +  scope.margin.bottom +  scope.margin.top)
          .style("margin-left", - scope.margin.left + "px")
          .style("margin.right", - scope.margin.right + "px")
          .append("g")
          .attr("transform", "translate(" +  scope.margin.left + "," +  scope.margin.top + ")")
          .style("shape-rendering", "crispEdges");

        scope.grandparent = scope.svg.append("g")
          .attr("class", "grandparent");

        scope.grandparent.append("rect")
          .attr("y", - scope.margin.top)
          .attr("width",  scope.width)
          .attr("height",  scope.margin.top);


        scope.grandparent.append("text")
          .attr("x", 6)
          .attr("y", 6 -  scope.margin.top)
          .attr("dy", ".75em");
        

        d3.json(scope.config.data, function(root) {
          initialize(root);
          accumulate(root);
          layout(root);
          display(root);

          function initialize(root) {
            root.x = root.y = 0;
            root.dx =  scope.width;
            root.dy =  scope.height;
            root.depth = 0;
          }

          // Aggregate the values for internal nodes. This is normally done by the
          // treemap layout, but not here because of our custom implementation.
          // We also take a snapshot of the original children (_children) to avoid
          // the children being overwritten when when layout is computed.
          function accumulate(d) {
            return (d._children = d.children)
              ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
              : d.value;
          }

          // Compute the treemap layout recursively such that each group of siblings
          // uses the same size (1×1) rather than the dimensions of the parent cell.
          // This optimizes the layout for the current zoom state. Note that a wrapper
          // object is created for the parent node for each group of siblings so that
          // the parent’s dimensions are not discarded as we recurse. Since each group
          // of sibling was laid out in 1×1, we must rescale to fit using absolute
          // coordinates. This lets us use a viewport to zoom.
          function layout(d) {
            if (d._children) {
              scope.treemap.nodes({_children: d._children});
              d._children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;                
                layout(c);
              });
            }
          }

          function display(d) {

            scope.grandparent
              .datum(d.parent)
              .on("click", transition)
              .select("text")
              .text(name(d));

            var g1 = scope.svg.insert("g", ".grandparent")
              .datum(d)
              .attr("class", "depth");

            var g = g1.selectAll("g")
              .data(d._children)
              .enter().append("g");

            //g.filter(function(d) { return d._children; })
              g.classed("children", true)
              .on("click", transition);
            g.selectAll(".child")
              .data(function(d) { return d._children || [d]; })
              .enter().append("rect")
              .attr("class", "child")           
              .call(rect);


            g.append("rect")
              .attr("class", "parent")
              .call(rect)
              .append("title")              
              .text(function(d) { return scope.formatNumber(d.value); });

            g.append("text")
              .attr("dy", ".75em")
              .text(function(d) { return d.name; })
              .call(text);

            function transition(d) {
                if (!d._children){                    
                    scope.curNode = d;                    
                    scope.$apply("detail({node:curNode})");
                    return true;
                }
              //console.log(d);
              if (scope.transitioning || !d) return;
              scope.transitioning = true;
              
              scope.curNode = d;
              scope.$apply("detail({node:curNode})");

              var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

              // Update the domain only after entering new elements.
              x.domain([d.x, d.x + d.dx]);
              y.domain([d.y, d.y + d.dy]);

              // Enable anti-aliasing during the transition.
              scope.svg.style("shape-rendering", null);

              // Draw child nodes on top of parent nodes.
              scope.svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

              // Fade-in entering text.
              g2.selectAll("text").style("fill-opacity", 0);

              // Transition to the new view.
              t1.selectAll("text").call(text).style("fill-opacity", 0);
              t2.selectAll("text").call(text).style("fill-opacity", 1);
              t1.selectAll("rect").call(rect);
              t2.selectAll("rect").call(rect);

              // Remove the old node when the transition is finished.
              t1.remove().each("end", function() {
                scope.svg.style("shape-rendering", "crispEdges");

                scope.transitioning = false;
              });
            }

            return g;
          }

          function text(text) {
            text.attr("x", function(d) { return x(d.x) + 6; })
              .attr("y", function(d) { return y(d.y) + 6; })
              ;
          }

          function rect(rect) {
            rect.attr("x", function(d) { return x(d.x); })
              .attr("y", function(d) { return y(d.y); })
              .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
              .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
              .style("color", function(d) { return d.parent ? scope.color(d.name) : null; })
            ;
          }
          function name(d) {
            return d.parent
              ? name(d.parent) + "." + d.name
              : d.name;
          }
        });
      },
      replace:true,
      template:'<div id="chart"></div>'
    }
  })
.directive('force', function () {
    return {
      restrict: 'A',
      scope : {
          config: '='          
      },
      link: function (scope, element, attrs) {
        scope.width = $(element).width();
        scope.height = $(element).height();

        scope.color = d3.scale.category20();

        var  root;
        scope.force = d3.layout.force()
          .size([scope.width, scope.height])
          .on("tick", tick);
        scope.svg = d3.select("#force").append("svg")
          .attr("width", scope.width)
          .attr("height", scope.height);
        scope.link = scope.svg.selectAll(".link");
        scope.node = scope.svg.selectAll(".node");

        d3.json(scope.config.data, function(json) {
          root = json;
          update();
        });

        function update() {
          var nodes = flatten(root),
            links = d3.layout.tree().links(nodes);

          // Restart the force layout.
          scope.force
            .nodes(nodes)
            .links(links)
            .start();

          // Update the links…
          scope.link = scope.link.data(links, function(d) { return d.target.id; });

          // Exit any old links.
          scope.link.exit().remove();

          // Enter any new links.
          scope.link.enter().insert("line", ".node")
            .attr("class", "link")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

          // Update the nodes…
          scope.node = scope.node.data(nodes, function(d) { return d.id; }).style("fill", color);

          // Exit any old nodes.
          scope.node.exit().remove();

          // Enter any new nodes.
          scope.node.enter().append("circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
            .style("fill", color)
            .on("click", click)
            .call(scope.force.drag);
        }

        function tick() {
          scope.link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

          scope.node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }

// Color leaf nodes orange, and packages white or blue.
        function color(d) {
          return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
        }

// Toggle children on click.
        function click(d) {
          if (!d3.event.defaultPrevented) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update();
          }
        }

// Returns a list of all nodes under the root.
        function flatten(root) {
          var nodes = [], i = 0;

          function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
            nodes.push(node);
          }

          recurse(root);
          return nodes;
        }

      },
      replace: true,
      template:'<div id="force"></div>'
    }
  })
.directive('radialProgress', function (){
    return {
      restrict: 'E',
      scope : {
          value: '='   
      },
      link: function (scope, element, attrs) {
        scope.width = 180;
        scope.height = 180;
        scope.divId = makeId();


        scope.color = d3.scale.category20();

        scope.twoPi = 2 * Math.PI;
        scope.radius = 110;
        scope.formatPercent = d3.format(".0%");

      scope.arc = d3.svg.arc()
          .startAngle(0)
          .innerRadius(60)
          .outerRadius(80);

      //appending the body with an svg. then appending the svg with a group "g"
        element.parent().append("<div id="+scope.divId+"></div>");
        element.remove();
       scope.svg = d3.select("#"+scope.divId ).append("svg")
            .attr("width", scope.width)
            .attr("height", scope.height)
            .append("g")
            .attr("transform", "translate(" + scope.width / 2 + "," + scope.height / 2 + ")");

      //giving the group a class
      scope.meter = scope.svg.attr("class", "progress-meter");

      //background path
      scope.meter.append("path")
                  .attr("class", "background")
                  .attr("d", scope.arc.endAngle(scope.twoPi));

      //path mark the time since my birth until the current date
      scope.foreground = scope.meter.append("path")
                                    .attr("class", "foreground")
                                    .attr("d", scope.arc.endAngle(scope.twoPi * scope.value));

    

      scope.text = scope.meter.append("text")
                              .attr("class", "text")
                              .attr("text-anchor", "middle")
                              .attr("fill", "#666")
                              .text(scope.formatPercent(scope.value));

      }
    }
  })
.directive('easyticker',function () {
        return {
            restrict: 'E',
            template: '<div class="vticker">'+
            '<ul>'+
            '<li ng-repeat="line in viewData">{{line}}</li>'+
    '</ul>'+
   ' </div>',
               //templateUrl: 'partials/directives/easy.html',
            link: function(scope, element, attrs){
                scope.config = JSON.parse(attrs.model);
                scope.viewData = scope.config.sendData;
                angular.element('.vticker').easyTicker({
                    direction: (scope.config.direction)?scope.config.direction:'up',
                    speed:  (scope.config.speed)?scope.config.speed:'slow',
                    interval: (scope.config.interval)?scope.config.interval:2000,
                    height:  (scope.config.height)?scope.config.height:'auto',
                    visible: (scope.config.visible) ? scope.config.visible :1,
                    mousePause: (scope.config.mousePause)?scope.config.mousePause:0,
                    controls: {
                        up: '.up',
                        down: '.down',
                        toggle: '.toggle',
                        stopText: 'Stop !!!'
                    }
                }).data('easyTicker');

            }

        }
    });
