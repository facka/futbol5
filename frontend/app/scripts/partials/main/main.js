'use strict';

angular.module('futbol5')
  .controller('MainCtrl', [ '$scope', '$state', 'AuthService', 'AlertManager', 'Facebook', function ($scope, $state, AuthService, AlertManager, Facebook) {

    $scope.user = AuthService.user;

 	$scope.signInClicked = function() {
 		$state.go('signin');
 	};

 	$scope.newMatchClicked = function() {
 		$state.go('newmatch');
 	};

    $scope.login = function(authType) {
      /*if (!$scope.user.liga || !$scope.user.email) {
        AlertManager.show('Complete ambos datos.', AlertManager.ERROR);
        return;
      }*/

      AuthService.getLoginStatus(authType, function isLogged(user) {
        $scope.loading = false;
        AlertManager.show('Bienvenido '+ user.name, AlertManager.INFO);
        $state.go('home');
      }, function isNotLogged() {
        AuthService.login(authType, function(user) {
            $scope.loading = false;
            AlertManager.show('Bienvenido '+ user.name, AlertManager.INFO);
            $state.go('home');
        }, function() {
            AlertManager.show('Error al intentar logearse', AlertManager.ERROR);
        });
      });
    };

    console.log("Creating MainCtrl");
    $scope.loading = true;

    $scope.$watch('facebookReady', function(ready) {
        if (ready) {
            console.log('Checking login status');
            AuthService.getLoginStatus(null, function(user) {
                $scope.loading = false;
                AlertManager.show('Bienvenido nuevamente '+ user.name, AlertManager.INFO);
                $state.go('home');
            }, function() {
                $scope.loading = false;
            });
        }
    });

    $scope.$watch(function() {
      // This is for convenience, to notify if Facebook is loaded and ready to go.
      return Facebook.isReady();
    }, function() {
      // You might want to use this to disable/show/hide buttons and else
      $scope.facebookReady = true;
    });

  }]);



/*
            var doRegistration = function() {
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
                    AlertManager.show('Fallo la registracion del usuario.', AlertManager.ERROR);
                };

                ApiService.registerUser(user).then(onSuccess, onError);
            };
*/
