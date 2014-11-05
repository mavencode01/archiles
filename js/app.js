'use strict';


var ds = angular
        .module('ds', ["ngCookies", "ngAnimate", "ngSanitize", "ds.controllers", "ds.directives", "ds.services", "ds.filters", "ui.router", "ncy-angular-breadcrumb", "http-auth-interceptor", "knalli.angular-vertxbus", "ngTagsInput", "angularCharts", "datamaps"])
        .config(['$urlRouterProvider', '$httpProvider', '$stateProvider', function($urlRouterProvider, $httpProvider, $stateProvider) {

                delete $httpProvider.defaults.headers.common['X-Requested-With'];

                $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

                $urlRouterProvider.otherwise("/app/dashboard");

                // Now set up the states
                $stateProvider
                        .state('signin', {
                            url: "/signin",
                            templateUrl: "partials/registration/login.html",
                            controller: 'AuthCtrl'
                        })
                        .state('registration', {
                            url: "/register",
                            templateUrl: "partials/registration/register.html",
                            controller: 'RegistrationCtrl',
                        })
                        .state('reset', {
                            url: "/reset",
                            templateUrl: "partials/registration/reset_password.html",
                            controller: 'PasswordResetCtrl',
                        })
                        .state('app', {
                            abstract: true,
                            url: "/app",
                            templateUrl: "partials/container.html",
                            controller: 'ContainerCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Home'                                
                            }
                        })
                        .state('app.search', {                            
                            url: "/search?query",
                            templateUrl: "partials/search/search.html",
                            controller: 'SearchCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Search'
                            }
                        })
                        .state('app.search.display', {                            
                            url: "/display?id",
                            templateUrl: "partials/search/search_details.html",
                            controller: 'SearchDisplayCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'display'
                            }
                        })                                                 
                        .state('app.dashboard', {
                            url: "/dashboard",
                            templateUrl: "partials/dashboard/dashboard.html",
                            controller: 'DashboardCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Dashboard',
                                ncyBreadcrumbParent: 'app'
                            }
                        })
                        .state('app.dashboard.filter', {
                            url: "/filter/:id",
                            templateUrl: "partials/dashboard/filter_dashboard.html",
                            controller: 'FilterDashboardCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Filter Dashboard',
                                ncyBreadcrumbParent: 'dashboard'
                            }
                        }) 
                        .state('app.dashboard.nodes', {
                            url: "/nodes",
                            templateUrl: "partials/dashboard/nodes_dashboard.html",
                            controller: 'DashboardNodeCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Nodes',
                                ncyBreadcrumbParent: 'dashboard'
                            }
                        })                                                                        
                        .state('app.analytics', {
                            url: "/analytics",
                            templateUrl: "partials/analytics/analytics.html",
                            controller: 'AnalyticsCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Analytics'
                            }
                        })
                        .state('app.recents', {
                            url: "/recents",
                            abstract: true,
                            templateUrl: "partials/recents/base_recents.html",
                            controller: 'RecentsCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Recents',
                                ncyBreadcrumbParent: 'app'
                            }
                        })
                        .state('app.recents.ltv-stream-chart', {
                            url: "/ltv-stream-chart",
                            templateUrl: "partials/recents/ltv_stream_chart.html",
                            controller: 'LTV_StreamChartCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'LTV Stream',
                                 ncyBreadcrumbParent: 'recents'
                            }
                        })
                        .state('app.recents.ppi-stream-chart', {
                            url: "/ppi-stream-chart",
                            templateUrl: "partials/recents/ppi_stream_chart.html",
                            controller: 'PPI_StreamChartCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'PPI Stream'
                            }
                        })                        
                        .state('app.history', {
                            url: "/history",
                            templateUrl: "partials/history/history.html",
                            controller: 'HistoryCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'History'
                            }
                        })
                        .state('app.reports', {
                            url: "/reports",
                            templateUrl: "partials/reports/report.html",
                            controller: 'ReportCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Reports'
                            }
                        })
                        .state('app.about', {
                            url: "/about",
                            templateUrl: "partials/faq/about.html",
                            controller: 'AboutCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'About'
                            }
                        })  
                        .state('app.settings', {
                            url: "/settings",
                            templateUrl: "partials/profile/settings.html",
                            controller: 'SettingsCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Settings'
                            }
                        })                                                
                        .state('app.profile', {
                            url: "/profile",
                            templateUrl: "partials/profile/profile.html",
                            controller: 'ProfileCtrl',
                            data: {
                                ncyBreadcrumbLabel: 'Profile'
                            }

                        });                    
            }])
            .run(['$rootScope', '$location', function($rootScope, $location) {
                $rootScope.$on('event:auth-loginRequired', function() {                                        
                    $location.path('/signin');
                });                
            }])
            .config(function(vertxEventBusProvider) {
              vertxEventBusProvider
              .enable()
              .useReconnect()
              .useUrlServer('http://localhost:8082');
            });