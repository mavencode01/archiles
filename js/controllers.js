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
.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory','$state', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory,$state) {

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

        $scope.tweetsRealTime = {}
        DashboardFactory.realtimeTweets()
                        .success(function(tweets){
                            $scope.tweetsRealTime =
                            {
                                'data': tweets,
                                'visible': 20,
                                'interval': 2000                                
                            };
                        }).error();    

        DashboardFactory.countryMap().success(function(data){
                            $scope.datamap = data;
                        }).error();

        $scope.loadState = function(){
            $location.path('/app/dashboard/filter');
        }
  


        var margin = {top: 20, right: 0, bottom: 0, left: 0}
          

        $scope.treeMapConfig ={
          'margin':margin,
          'data':'data/treemap1.json'
        };

        $scope.tree = {}

        $scope.formatName = function(name) {
                                return name;         
                            }

       $scope.onDetail = function(node) {
            console.log(node);
        }

        DashboardFactory.matchingKeyword()
                        .success(
                            function(data){
                            $scope.tree = data
                        }).error();

        $scope.map = {
                      type: 'usa',                       
                      
                      data: [{
                        values: [
                          { "location": "USA", "value": 125 }                          
                        ]
                      }],
                      colors: ['#666666', '#b9b9b9', '#fafafa'],
                      options: {                        
                        width: 780,
                        legendHeight: 60, // optionally set the padding for the legend
                        geographyConfig: {
                            highlightBorderColor: '#bada55',
                            popupTemplate: function(geography, data) {                                
                              return '<div class="hoverinfo"> <a href>' + geography.properties.name + '</a>'
                            },
                            highlightBorderWidth: 3
                          }
                      }
                    }

        $scope.showState = function(geography){
            var state = geography.properties.name;
            $state.go('app.dashboard.filter',{'id': state});

        }
       

}]) 
.controller('DashboardNodeCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {
    
}])      
.controller('FilterDashboardCtrl', ['$rootScope', '$scope', '$location', '$interval', 'vertxEventBusService', 'FeedsFactory', 'SearchFactory', 'DashboardFactory', function($rootScope, $scope, $location, $interval, vertxEventBusService, FeedsFactory, SearchFactory, DashboardFactory) {

    $scope.value = 0.42;
    $scope.guageValue = 0.99;
    $scope.force = {
        'data': 'data/readme.json'
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
