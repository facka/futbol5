'use strict';

angular.module('futbol5').directive('navbar', function () {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: 'scripts/partials/navbar/navbar.html',
        controller: 'NavBarCtrl',
        link: function (scope, element) {

        }
    };

}).controller('NavBarCtrl', ['$scope', '$state', 'AuthService', 'AlertManager',
    function NavBarCtrl($scope, $state, AuthService, AlertManager) {
        $scope.user = AuthService.user;

        $scope.logout = function() {
            AuthService.logout(function() {
                $state.go('main');
            });
        };
    }
]);
