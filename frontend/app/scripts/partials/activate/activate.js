'use strict';

/**
 * @ngdoc function
 * @name startApp.controller:SigninCtrl
 * @description
 * # SigninCtrl
 * Controller of the startApp
 */
angular.module('futbol5')
  .controller('ActivateCtrl', ['$scope', '$location', 'ApiService', 'AlertManager', '$state', '$stateParams', function ($scope, $location, ApiService, AlertManager, $state, $stateParams) {



    var activate = function() {
        $scope.status = "Activando usuario...";
        ApiService.activateUser($stateParams.code).then(function(response) {
            $scope.status = "Usuario activado. Redirigiendo...";
            var result = response.data.result;
            if (result === "new") {
                AlertManager.show("Usuario activado!", AlertManager.INFO);    
                $state.go('/player');
            }
            if (result === "exists") {
                $state.go('/player');
            }
            if (result === "not-exists") {
                AlertManager.show("El usuario no existe! No se pudo activar.", AlertManager.INFO);
            }
        }, function(reason) {
            AlertManager.show("Falló la activación del usuario");
            $scope.status = "Falló la activación del usuario. Vuelva a registrarse.";
        });
    };

    activate();

  }]);
