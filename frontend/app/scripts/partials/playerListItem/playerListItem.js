'use strict';

angular.module('futbol5').directive('playerListItem', function () {
    return {
        restrict: 'E',
        scope: {
          player: '='
        },
        templateUrl: 'scripts/partials/playerListItem/playerListItem.html',
        controller: 'PlayerListItemCtrl'
    };

}).controller('PlayerListItemCtrl', [function PlayerListItemCtrl() {


}]);




