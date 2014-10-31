'use strict';

/* Controllers */

angular.module('ds.controllers', ['ngTagsInput'])

.controller('AuthCtrl', ['$rootScope','$scope', '$cookies','$cookieStore', '$http', '$location', 'AuthFactory', 'authService', function($rootScope, $scope, $cookies,$cookieStore, $http, $location, AuthFactory, authService) {

        $rootScope.user = {}

        $scope.msgStatus = '';

        $scope.$on('signup-successful', function(){
            $scope.msgStatus = 'Yeh! - Sign up successful, please sign in';
            $scope.displayAlert = true;
        });


        $scope.$on('event:auth-loginRequired', function(){
            $scope.msgStatus = 'Signin failed - invalid username or password';
            $scope.displayAlert = true;
        });


        $scope.hideAlert = function(){
            $scope.displayAlert = false;
        }
        
        $scope.authenticate = function(){

            AuthFactory.signIn($scope.email, $scope.password).success(function(user){                                                
                 authService.loginConfirmed();
                 $rootScope.user = user;
                  $cookieStore.put('user', user);
                $location.path('/app/dashboard');
            }).error(function(){                        
                $scope.msgStatus = 'Signin failed - invalid username or password';
                 $scope.displayAlert = true;                    
            });
        }

}])
.controller('RegistrationCtrl', ['$rootScope', '$scope', '$http', '$location', 'AuthFactory', function($rootScope, $scope, $http, $location, AuthFactory) {

        $scope.displayError = false;

        $scope.register = function(){                        
            AuthFactory.signup($scope.user).success(function(response){
                $scope.displayError = false;

                if (response.status == 1){
                    $scope.error = response.message;
                    $scope.displayError = true;
                }else{
                    $rootScope.$broadcast('signup-successful');
                    $location.path('/signin');                            
                }                        
            }).error(function(){
                $scope.displayError = true;
                $scope.error = "Sign up failed, try again";
            });                      
        }

}])
.controller('PasswordResetCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

        $scope.passwordReset = function(){
              $location.path('/signin');
        }

}])        
.controller('ContainerCtrl', ['$rootScope', '$scope', '$cookieStore', '$http', '$location', 'AuthFactory', 'vertxEventBusService', function($rootScope, $scope, $cookieStore, $http, $location, AuthFactory, vertxEventBusService) {

        $rootScope.user = $cookieStore.get('user');
        
        $scope.facebook = [1,2,3,4,5,4,3,2,1, 1, 10, 2, 8, 12];
        $scope.twitter = [1,2,3,4,5, 10, 2, 8, 12, 4,3,2,1, 1,];
        $scope.newsfeed = [1,2, 10, 2, 8,3,4,5,4,3,2,1, 1, 12];

        //search tag default
        $scope.tags = [{text:'DeepStream'}];

        $rootScope.tweets_rate = 0;

        vertxEventBusService.on('com.deepstream.injestion.tweets.rate', function(tweets_rate) {

          $rootScope.tweets_rate = tweets_rate
        });

        $scope.signOut = function(){                    
            $cookieStore.remove('user');
            AuthFactory.signOut();                    
        }

        $scope.searchHit = function(search){                                
            $location.search('query', search).path('/app/search')
        }

}])     
.controller('SearchCtrl', ['$scope', '$http', '$location', '$stateParams', 'SearchFactory', function($scope, $http, $location, $stateParams, SearchFactory) {

        $scope.search = $stateParams.query;
        $scope.searchResult = [];
        

        SearchFactory.search($scope.search)
                .success(function(result){
                    $scope.searchResult = result;
                }).error(function(){

            });

        $scope.openSearch = function(hit){
            $location.search('id', hit.id).path('/app/search/display');                    
        }

}]) 
.controller('SearchDisplayCtrl', ['$scope', '$http', '$location', '$stateParams', function($scope, $http, $location, $stateParams) {

    $scope.chartDisplayOption = {
        'default':
            [
                {'type' : {'name': 'PPI'}},
                {'type' : {'name': 'DI^2'}}
            ]

    }

    // $scope.chart = new CanvasJS.Chart("chart1", {
    //     theme: 'theme1',    
    //     creditText: '',            
    //     axisY: {
    //         title: "PPI",
    //         labelFontSize: 16,
    //     },
    //     axisX: {
    //         title: "Date time",
    //         labelFontSize: 16,
    //         valueFormatString: "DD MMM"
    //     },
    //     data: [              
    //         {
    //             type: "column",
    //              dataPoints: [                            
    //                 {x: new Date(2013,09, 26), y: 12},                            
    //                 {x: new Date(2013,09, 28), y: 9},                            
    //                 {x: new Date(2013,09, 30), y: 50},                           
    //                 {x: new Date(2013,09, 31), y: 1},                            
    //                 {x: new Date(2013,10, 2), y: 17},                            
    //                 {x: new Date(2013,10, 4), y: 18},                            
    //                 {x: new Date(2013,10, 8), y: 19}                            
    //             ]
    //         }
    //     ]
    //     });

    //     $scope.chart.render();

    //     $scope.chart2 = new CanvasJS.Chart("chart2", {
    //             theme: 'theme2',  
    //             creditText: '',                      
    //             axisY: {
    //                 title: "DI^2",
    //                 labelFontSize: 16,
    //             },
    //             axisX: {
    //                 title: "Date time",
    //                 labelFontSize: 16,
    //                 valueFormatString: "DD MMM"
    //             },
    //             data: [              
    //                 {
    //                     type: "bar",
    //                     dataPoints: [                            
    //                         {x: new Date(2013,09, 26), y: 12},
    //                         {x: new Date(2013,09, 27), y: 13},                           
    //                         {x: new Date(2013,09, 28), y: 9},                            
    //                         {x: new Date(2013,09, 30), y: 50},                           
    //                         {x: new Date(2013,09, 31), y: 1},                            
    //                         {x: new Date(2013,10, 2), y: 17},                            
    //                         {x: new Date(2013,10, 4), y: 18},                            
    //                         {x: new Date(2013,10, 8), y: 19}                            
    //                     ]
    //                 }
    //             ]
    //             });

    //     $scope.chart2.render();

}])                 
.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {

        vertxEventBusService.on('com.deepstream.injestion.tweets', function(tweets) {
             $scope.$apply(function() {
                $scope.searchResult = tweets;
            });                    
        });

         $scope.search = [
            { text: 'carnival cruise' },
            { text: 'bahamas' },
            { text: 'las vegas' },
            { text: 'getaway' }
          ];

        DashboardFactory.countryMap().success(function(data){
                            $scope.datamap = data;
                        }).error();

        $scope.loadState = function(){
            $location.path('/app/dashboard/filter');
        }
  

        var margin = {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1
        },
        width = 960 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

        $scope.treeMapConfig = {
            'margin': margin,
            'width': width,
            'height': height,
            'dataJSON': '/data/flare.json'
        };


    /*
        $scope.chartType = 'pie'
         $scope.config = {
              title: '', // chart title
              tooltips: true,                      
              labels: false, // labels on data points                      
              // exposed events 
              mouseover: function() {}, 
              mouseout: function() {},
              click: function() {},
              // legend config
              legend: {
                display: true, // can be either 'left' or 'right'.
                position: 'left',
                // you can have html in series name
                htmlEnabled: false
              },
              // override this array if you're not happy with default colors
              colors: [],
              innerRadius: 0, // Only on pie Charts
              lineLegend: 'lineEnd', // Only on line Charts
              lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
              isAnimate: true, // run animations while rendering chart
              yAxisTickFormat: 's' //refer tickFormats in d3 to edit this value
            };


            $scope.acData = {                                
                    series: ['Sales', 'Income', '<i>Expense</i>', 'Laptops', 'Keyboards'],
                    data: 
                    [
                        {
                            x: "Sales",
                            y: [100, 500, 0],
                            tooltip: "this is tooltip"
                        }, 
                        {
                            x: "Not Sales",
                            y: [300, 100, 100]
                        }, 
                        {
                            x: "Tax",
                            y: [351]
                        }, 
                        {
                            x: "Not Tax",
                            y: [54, 0, 879]
                        }
                    ]              
                }





        $scope.chartSeries =  [{
                    levels: [{
                        level: 1,
                        layoutAlgorithm: 'squarified',
                        borderRadius: 50,
                        borderColor: 'black',
                        borderWidth: 1
                    }],
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: 'black',
                            fontWeight: 'light',
                            HcTextStroke: '1px rgba(255,255,255,0.5)'
                        }
                    },
                     allowPointSelect: true,
                        point: {
                            events: {
                                select: function () {
                                    //$report.html(this.category + ': ' + this.y + ' was last selected');
                                    //console.log("treemap node clicked");
                                    $location.path("app/dashboard/nodes");
                                }
                            }
                        },
                    type: "treemap",
                    data: [{
                        id: 'Carnival',
                        color: "#3E82C7"
                    }, {
                        id: 'Facebook',
                        color: "#6995C2"
                    }, {
                        id: 'Tesla',
                        color: '#C9DFF5'
                    }, {
                        id: 'IPO',
                        parent: 'Twitter',
                        value: 5
                    }, {
                        id: 'Obama',
                        parent: 'Twitter',
                        value: 3
                    }, {
                        id: 'Election',
                        parent: 'Twitter',
                        value: 4
                    }, {
                        id: 'IPO',
                        parent: 'Facebook',
                        value: 4
                    }, {
                        id: 'Obama',
                        parent: 'Facebook',
                        value: 10
                    }, {
                        id: 'Election',
                        parent: 'Facebook',
                        value: 1
                    }, {
                        id: 'Climate',
                        parent: 'Tesla',
                        value: 1
                    }, {
                        id: 'Obama',
                        parent: 'Tesla',
                        value: 3
                    }, {
                        id: 'Election',
                        parent: 'Tesla',
                        value: 3
                    }, {
                        id: 'debate',
                        parent: 'Climate',
                        value: 2,
                        color: '#264D75'
                    }]
                }];

        $scope.chartConfig = {                                     
            series: $scope.chartSeries,
            title: {
              text: ''
            },
            credits: {
              enabled: false
            },
            loading: false,
            size: {}
          }

          $scope.reflow = function () {                    
            $scope.$broadcast('highchartsng.reflow');
          }; 

          */                 
}]) 
.controller('DashboardNodeCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {
    
}])      
.controller('FilterDashboardCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {
   
   $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'solidguage'
                    },
                    pane: {
                        center: ['50%', '85%'],
                        size: '140%',
                        startAngle: -90,
                        endAngle: 90,
                        background: {
                            backgroundColor:'#EEE',
                            innerRadius: '60%',
                            outerRadius: '100%',
                            shape: 'arc'
                        }
                    },
                    solidgauge: {
                        dataLabels: {
                            y: -30,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },
                series: [{
                    data: [16],
                    dataLabels: {
                        format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                            '<span style="font-size:12px;color:silver">km/h</span></div>'
                    }
                }],
                title: {
                    text: 'Feeds Guage',
                    y: 50
                },
                yAxis: {
                    currentMin: 0,
                    currentMax: 20,
                    title: {
                        y: 140
                    },      
                    stops: [
                        [0.1, '#DF5353'], // red
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#55BF3B'] // green
                    ],
                    lineWidth: 0,
                    tickInterval: 20,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    labels: {
                        y: 15
                    }   
                },
                loading: false
            }

}])     
.controller('AnalyticsCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}])
.controller('RecentsCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}])        
.controller('LTV_StreamChartCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        $scope.chart = new CanvasJS.Chart("chart1", {
        theme: 'theme1',
        creditText: '',
        title:{
            text: "Nintendo Console Sales"              
        },
        axisY: {
            title: "million units",
            labelFontSize: 16
        },
        axisX: {
            labelFontSize: 16
        },
        data: [              
            {
                type: "column",
                dataPoints: [
                    { label: "Wii U", y: 6.17 },
                    { label: "Wii", y: 101.06 },
                    { label: "GameCube", y: 21.74 },
                    { label: "64", y: 32.93 },
                    { label: "SNES", y: 49.10 },
                    { label: "NES", y: 61.91 },
                    { label: "3DS", y: 43.33 },
                    { label: "DS", y: 153.99 },
                    { label: "Advance", y: 81.51 },
                    { label: "GameBoy", y: 118.69 }
                ]
            }
        ]
        });

        $scope.chart.render();

        $scope.chart2 = new CanvasJS.Chart("chart2", {
                theme: 'theme2',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16,
                },
                axisX: {
                    labelFontSize: 16,
                },
                data: [              
                    {
                        type: "bar",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart2.render();


        $scope.chart3 = new CanvasJS.Chart("chart3", {
                theme: 'theme3',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16
                },
                axisX: {
                    labelFontSize: 16
                },
                data: [              
                    {
                        type: "pie",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart3.render();

        $scope.chart4 = new CanvasJS.Chart("chart4", {
                theme: 'theme3',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16
                },
                axisX: {
                    labelFontSize: 16
                },
                data: [              
                    {
                        type: "pie",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart4.render();

}])                
.controller('PPI_StreamChartCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

         $scope.chart = new CanvasJS.Chart("chart1", {
        theme: 'theme1',
        creditText: '',
        title:{
            text: "Nintendo Console Sales"              
        },
        axisY: {
            title: "million units",
            labelFontSize: 16
        },
        axisX: {
            labelFontSize: 16
        },
        data: [              
            {
                type: "column",
                dataPoints: [
                    { label: "Wii U", y: 6.17 },
                    { label: "Wii", y: 101.06 },
                    { label: "GameCube", y: 21.74 },
                    { label: "64", y: 32.93 },
                    { label: "SNES", y: 49.10 },
                    { label: "NES", y: 61.91 },
                    { label: "3DS", y: 43.33 },
                    { label: "DS", y: 153.99 },
                    { label: "Advance", y: 81.51 },
                    { label: "GameBoy", y: 118.69 }
                ]
            }
        ]
        });

        $scope.chart.render();

        $scope.chart2 = new CanvasJS.Chart("chart2", {
                theme: 'theme2',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16
                },
                axisX: {
                    labelFontSize: 16
                },
                data: [              
                    {
                        type: "bar",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart2.render();


        $scope.chart3 = new CanvasJS.Chart("chart3", {
                theme: 'theme3',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16
                },
                axisX: {
                    labelFontSize: 16
                },
                data: [              
                    {
                        type: "pie",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart3.render();

        $scope.chart4 = new CanvasJS.Chart("chart4", {
                theme: 'theme3',
                creditText: '',
                title:{
                    text: "Nintendo Console Sales"              
                },
                axisY: {
                    title: "million units",
                    labelFontSize: 16
                },
                axisX: {
                    labelFontSize: 16
                },
                data: [              
                    {
                        type: "pie",
                        dataPoints: [
                            { label: "Wii U", y: 6.17 },
                            { label: "Wii", y: 101.06 },
                            { label: "GameCube", y: 21.74 },
                            { label: "64", y: 32.93 },
                            { label: "SNES", y: 49.10 },
                            { label: "NES", y: 61.91 },
                            { label: "3DS", y: 43.33 },
                            { label: "DS", y: 153.99 },
                            { label: "Advance", y: 81.51 },
                            { label: "GameBoy", y: 118.69 }
                        ]
                    }
                ]
                });

        $scope.chart4.render();

}])                        
.controller('HistoryCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}])
.controller('ReportCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}])
.controller('AboutCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}])                                
.controller('ProfileCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}]);                                
