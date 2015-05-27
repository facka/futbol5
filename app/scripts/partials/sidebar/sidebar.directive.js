'use strict';

angular.module('futbol5').directive('sidebar', function () {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: 'scripts/partials/sidebar/sidebar.html',
        controller: 'SideBarCtrl'
    };

}).controller('SideBarCtrl', ['$scope', 'AuthService', 'AlertManager', 'ApiService',
    function SideBarCtrl($scope, AuthService, AlertManager, ApiService) {
      $scope.user = AuthService.user;

      $scope.$watch('user.id', function(newVal){
        if (newVal) {
            ApiService.getPlayer(newVal).then(
                function(response) {
                    $scope.player = response.data;
                },
                function(reason) {
                    AlertManager.show('Error al mostrar jugador', AlertManager.ERROR);
                }
            );
        }
      });

      $scope.joinLeague = function() {
        var league = prompt('Ingrese nombre de la liga', '');
          if (league) {
            ApiService.joinLeague(league).then(function(response) {
               if (response.error) {
                  AlertManager.show('Error al unirse a una liga', AlertManager.ERROR);
               }
               else {
                  if (response.info === 'NEW') {
                    AlertManager.show('Se unio a una liga nueva', AlertManager.INFO);
                  }
                  else {
                    AlertManager.show('Se unio a una liga existente', AlertManager.INFO);
                  }

                  $scope.player.ligas.push(league);
               }
            });
          }
      };
    }
]);
