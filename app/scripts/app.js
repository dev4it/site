(function(angular) {
  'use strict';

  /* App Module */

  var dev4itApp = angular.module('dev4itApp', [
    'ngRoute',

    'dev4itCtrls'
  ]);

  dev4itApp.config(['$routeProvider',
    function($routeProvider) {
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
    }
  ]);

})(window.angular);