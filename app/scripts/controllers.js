(function(angular) {
  'use strict';

  /* Controllers */

  var dev4itCtrls = angular.module('dev4itCtrls', []);

  dev4itCtrls.controller('mainCtrl', ['$scope', '$location',
    function($scope, $location) {
      $scope.$location = $location;
    }
  ]);

})(window.angular);