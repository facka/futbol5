'use strict';

var _ = {
  remove: function remove(item){
    return {
      from: function(list) {
        return {
          where : function(condition) {
            for (var i in list) {
              if (condition(list[i])) {
                list.splice(i,1);
              }
            }
          }
        };
      }
    };
},
add: function add(item){
  return {
    to: function(list) {
      list.push(item);
    }
  };
}
};



angular.module('futbol5', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'AlertModule',
  'LoadingModule',
  'ui.router',
  'facebook',
  'ui.bootstrap'
])
.factory('authHttpResponseInterceptor',['$q','$injector',function($q,$injector){
    return {
        response: function(response){
            if (response.status === 401) {
                console.log('Response 401');
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            if (rejection.status === 401) {
                var $state = $injector.get('$state');
                console.log('Response Error 401',rejection);
                $state.go('main');
            }
            return $q.reject(rejection);
        }
    };
}])
.config(function($stateProvider, $urlRouterProvider, FacebookProvider, $httpProvider) {

  FacebookProvider.init('384693415033353');

  $httpProvider.interceptors.push('authHttpResponseInterceptor');

  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise('/');
  //
  // Now set up the states
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'scripts/partials/main/main.html',
      controller: 'MainCtrl',
      publicState: true
    })
    .state('home', {
      url: '/home',
      templateUrl: 'scripts/partials/home/home.html',
      controller: 'HomeCtrl'
    })
    .state('signin', {
      url: '/signIn',
      templateUrl: 'scripts/partials/signin/signin.html',
      controller: 'SigninCtrl'
    })
    .state('newmatch', {
      url: '/newMatch',
      templateUrl: 'scripts/partials/newmatch/newmatch.html',
      controller: 'NewMatchCtrl'
    })
    .state('leagues', {
      url: '/leagues',
      templateUrl: 'scripts/partials/leagues/leagues.html',
      controller: 'LeaguesCtrl',
      resolve: {
        leagues: function(AuthService, ApiService){
          return ApiService.getPlayer(AuthService.user.id).then( function(response) {
                return response.data.ligas;
              }
          );
        }
      }
    })
    .state('league', {
      url: '/league/:id',
      templateUrl: 'scripts/partials/league/league.html',
      controller: 'LeagueCtrl',
      resolve: {
        ApiService: 'ApiService',
        league: function(ApiService, $stateParams){
              var leagueId = $stateParams.id;
              return ApiService.getLeague(leagueId);
        }
      }
    })
    .state('match', {
      url: '/matches/:id',
      templateUrl: 'scripts/partials/match/match.html',
      controller: 'MatchCtrl',
      resolve: {
        ApiService: 'ApiService',
        match: function(ApiService, $stateParams){
              var code = $stateParams.id;
              return ApiService.getMatch(code);
        }
      }
    })
    .state('activate', {
      url: '/activate',
      templateUrl: 'scripts/partials/activate/activate.html',
      controller: 'ActivateCtrl'
    })
    .state('player', {
      url: '/player',
      templateUrl: 'scripts/partials/player/player.html',
      controller: 'PlayerCtrl'
    });
})
.run(['$rootScope', '$state', '$stateParams', 'AuthService', 'AlertManager',
  function($rootScope, $state, $stateParams, AuthService, AlertManager) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {

      $rootScope.toState = toState;
      $rootScope.toStateParams = toStateParams;
      $rootScope.user = AuthService.user;

      if (!toState.publicState) {
        var killLoginWatcher = $rootScope.$watch('user.loggedIn', function(newVal) {
          if (newVal) {
            if (!AuthService.user.loggedIn) {
              AlertManager.show('Debes logearte para ingresar a la pagina', AlertManager.ERROR);
              event.preventDefault();
              $state.go('main');
            }
            killLoginWatcher();
          }
        });
      }

    });
  }
]);