(function(angular) {
  'use strict';

  /* Controllers */

  var dev4itCtrls = angular.module('dev4itCtrls', []);

  dev4itCtrls.controller('mainCtrl', ['$scope', '$location', '$anchorScroll',
    function($scope, $location, $anchorScroll) {
      $scope.$location = $location;

      $scope.gotoTarget = function(target) {

        $anchorScroll.yOffset = angular.element(document.querySelector('header'))[0].offsetHeight - 24; // 48 the dimension of the md-fab arrow

        $location.hash(target);

        $anchorScroll();
      };

      $scope.toggled = false;
      $scope.isToggled = function() {
        return $scope.toggled;
      };

      $scope.toggle = function() {
        $scope.toggled = !$scope.toggled;
      };

      $scope.isSelected = function(href) {
        return $location.path() === href;
      };
    }
  ]);

})(window.angular);