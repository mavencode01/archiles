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
            $location.path("/signin");                 
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

  

}])                 
.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {

        vertxEventBusService.on('com.deepstream.injestion.tweets', function(tweets) {
             $scope.$apply(function() {
                $scope.searchResult = tweets;
            });                    
        });

         $scope.search = [
            { text: 'twitter' },
            { text: 'Obama' },
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

        $scope.tree = {}

        $scope.formatName = function(name) {
                                return name;         
                            }

        $scope.onDetail = function(node){
            //console.log(node);   
        }

        DashboardFactory.matchingKeyword()
                        .success(
                            function(data){
                            $scope.tree = data
                        }).error();

        $scope.map = {
                      type: 'usa',
                       geographyConfig: {
                            highlightBorderColor: '#bada55',
                            popupTemplate: function(geography, data) {
                              return '<div class="hoverinfo">' + geography.properties.name + ' Electoral Votes:' +  data.electoralVotes + ' '
                            },
                            highlightBorderWidth: 3
                          },

                      data: [{
                        values: [
                          { "location": "USA", "value": 125 },
                          { "location": "CAN", "value": 50 },
                          { "location": "FRA", "value": 70 },
                          { "location": "RUS", "value": 312 }
                        ]
                      }],
                      colors: ['#666666', '#b9b9b9', '#fafafa'],
                      options: {
                        width: 780,
                        legendHeight: 60 // optionally set the padding for the legend
                      }
                    }

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
.controller('SettingsCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {
}])
.controller('ProfileCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location) {

        

}]);                                
