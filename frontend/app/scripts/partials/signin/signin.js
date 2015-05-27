'use strict';

/**
 * @ngdoc function
 * @name startApp.controller:SigninCtrl
 * @description
 * # SigninCtrl
 * Controller of the startApp
 */
angular.module('futbol5')
  .controller('SigninCtrl', ['$scope', '$location', 'ApiService', 'AlertManager', function ($scope, $location, ApiService, AlertManager) {

    $scope.acceptClicked = function() {

    	var onSuccess = function(response) {
    		if (!response.error) {
	            console.log('User registered!');
	            AlertManager.show('Usuario registrado.',AlertManager.INFO);
    			$location.url('/');
	        }
	        else {
	            if (response.error === 'EXISTS') {
	              AlertManager.show('Ya existe un usuario con ese mail.', AlertManager.ERROR);
	            }
	            if (response.error === 'EMAIL') {
	              AlertManager.show('El mail es inválido.', AlertManager.ERROR);
	            }
	        }
    	};

    	var onError = function(reason) {
    		AlertManager.show('Fallo la registracion del usuario.',AlertManager.ERROR);
    	};

    	ApiService.registerUser($scope.user).then(onSuccess, onError);
    };

    $scope.cancelClicked = function() {
    	$scope.user = {
    		nombre: '',
    		email: '',
    		liga: ''
    	};
    	$location.url('/');
    };


  }]);
