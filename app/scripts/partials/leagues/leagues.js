'use strict';

angular.module('futbol5').controller('LeaguesCtrl', ['$scope', '$location', '$window', 'ApiService', 'AuthService', 'AlertManager', 'leagues',
    function LeaguesCtrl($scope, $location, $window, ApiService, AuthService, AlertManager, leagues) {

          $scope.leagues = leagues;


  }]);




