(function(angular) {
  'use strict';

  /* App Module */

  var dev4itApp = angular.module('dev4itApp', [
    'ngRoute',

    'dev4itCtrls'
  ]);

  dev4itApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider.
      when('/', {
        templateUrl: 'pages/home.html'
      }).
      when('/dev4why', {
        templateUrl: 'pages/dev4why.html'
      }).
      when('/dev4what', {
        templateUrl: 'pages/dev4what.html'
      }).
      when('/dev4who', {
        templateUrl: 'pages/dev4who.html'
      }).
      when('/dev4you', {
        templateUrl: 'pages/dev4you.html'
      }).
      when('/about', {
        templateUrl: 'pages/about.html'
      }).
      when('/contact', {
        templateUrl: 'pages/contact.html'
      }).
      otherwise({
        redirectTo: '/'
      });

      // use the HTML5 History API
      $locationProvider.html5Mode(false);
      //$locationProvider.hashPrefix('!');
    }
  ]);

  dev4itApp.run(['$rootScope', '$location', '$anchorScroll', '$window',
    function($rootScope, $location, $anchorScroll, $window) {

      $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {

        // @if ENV='PRD'
        console.log($location.url());
        if ($window.ga) {
          $window.ga('send', 'pageview', {
            page: $location.url()
          });
        }
        // @endif

        $anchorScroll.yOffset = angular.element(document.querySelector('header'))[0].offsetHeight;
        $anchorScroll();
      });

    }
  ]);

})(window.angular);