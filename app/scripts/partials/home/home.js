'use strict';

angular.module('futbol5')
  .controller('HomeCtrl', [ '$scope', '$state', 'AuthService', 'AlertManager', function ($scope, $state, AuthService, AlertManager) {

    $scope.user = AuthService.user;

 	$scope.newMatchClicked = function() {
 		$state.go('newmatch');
 	};

}]);

