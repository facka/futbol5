'use strict';

angular.module('futbol5').controller('MatchCtrl', ['$scope', '$location', '$window', 'ApiService', 'AuthService', 'AlertManager', 'match',
    function MatchCtrl($scope, $location, $window, ApiService, AuthService, AlertManager, match) {
          $scope.user = AuthService.user;

          $scope.match = match.data;
          $scope.match.status = '';

          $scope.infoPartido = 'El partido es en la cancha '+$scope.match.cancha+', el dia '+$scope.match.fecha+' a las '+$scope.match.hora+' hs. Precio: '+$scope.match.precio+'.';

          console.log('Match: '+JSON.stringify(match.data));

          $scope.iAmIn = function() {
            ApiService.iAmIn($scope.match.code).then(function() {
              $scope.match.status = 'titular';
              _.remove($scope.user).from($scope.match.nojuegan).where(function(item){
                return item.code === $scope.user.id;
              });
              _.remove($scope.user).from($scope.match.suplentes).where(function(item){
                return item.code === $scope.user.id;
              });
              _.add($scope.user).to($scope.match.jugadores);
            }, function() {

            });
          };

          $scope.maybeIn = function() {
            ApiService.maybeIn($scope.match.code).then(function() {
              $scope.match.status = 'suplente';
              _.remove($scope.user).from($scope.match.nojuegan).where(function(item){
                return item.code === $scope.user.id;
              });
              _.remove($scope.user).from($scope.match.jugadores).where(function(item){
                return item.code === $scope.user.id;
              });
              _.add($scope.user).to($scope.match.suplentes);
            }, function() {

            });
          };

          $scope.decline = function() {
            ApiService.decline($scope.match.code).then(function() {
              $scope.match.status = 'nojuega';
              _.remove($scope.user).from($scope.match.suplentes).where(function(item){
                return item.code === $scope.user.id;
              });
              _.remove($scope.user).from($scope.match.jugadores).where(function(item){
                return item.code === $scope.user.id;
              });
              _.add($scope.user).to($scope.match.nojuegan);
            }, function() {

            });
          };

          $scope.$watch('user.loggedIn', function(loggedIn) {
            if (loggedIn) {
              ApiService.getMatchStatusForPlayer($scope.match.code).then(function(response) {
                $scope.match.status = response.data.as;
                $scope.loading = false;
              }, function() {

              });
            }
          });

          $scope.loading = true;

  }]);




