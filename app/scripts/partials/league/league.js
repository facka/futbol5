'use strict';

angular.module('futbol5').controller('LeagueCtrl', ['$scope', '$location', '$window', 'ApiService', 'AuthService', 'AlertManager', 'league',
    function LeagueCtrl($scope, $location, $window, ApiService, AuthService, AlertManager, league) {
          $scope.user = AuthService.user;
          $scope.match = {
              name: '',
              date: '',
              time: '',
              place: '',
              price: '',
              numberOfPlayers: ''
          };
          $scope.league = league.data;

          ApiService.getMatchesFromLeague($scope.league.name).then(function(response) {
            console.log("Matches by league!!");
            $scope.matches = response.data;
          });

          $scope.creatingMatch = false;

          $scope.createMatch = function() {
            var data = {
              liga: $scope.league.name,
              nombre: $scope.match.name,
              cancha: $scope.match.place,
              fecha: $scope.match.date,
              hora: $scope.match.time,
              precio: $scope.match.price,
              cantidadJugadores: $scope.match.numberOfPlayers
            };
            ApiService.createMatch(data).then(function() {
              console.log('success');
            }, function() {
              console.log('error');
            });
          };


  }]);




