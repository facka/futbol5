'use strict';

             /*   $('#star').raty({ readOnly: true, score: data.estrellas,
                  size: 10,
                  path : '/images',
                  width: 'auto'
                });

*/



angular.module('futbol5').directive('player', function () {
    return {
        restrict: 'E',
        scope: {
          id: '='
        },
        templateUrl: 'scripts/partials/player/player.html',
        controller: 'PlayerCtrl',
        link: function (scope, element) {

        }
    };

}).controller('PlayerCtrl', ['$scope', '$location', '$window', 'ApiService', 'AuthService', 'AlertManager', 'player',
    function PlayerCtrl($scope, $location, $window, ApiService, AuthService, AlertManager, player) {
          $scope.user = AuthService.user;

          if (player) {
            $scope.player = player.data;
          }
          else {
            ApiService.getPlayer($scope.id).then(
                function(response) {
                    $scope.player = response.data;
                },
                function(reason) {
                    AlertManager.show('Error al mostrar jugador', AlertManager.ERROR);
                }
            );
          }

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

  }]);




