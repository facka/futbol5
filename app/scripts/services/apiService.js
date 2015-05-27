'use strict';

angular.module('futbol5')
  .service('ApiService', ['$http', function($http) {

  	//var serverURL = 'http://stage.businessreach.com/similan-portal-stage/api';
  	var serverURL = 'http://localhost:8083/api';
    var token = '';

  	var GET = function(url) {
        console.log('Calling get with tokeb '+ token);
  		return $http.get(serverURL+url, {headers: {'Authorization': 'Bearer '+token}});
	      /*.then(function (response) {
	      	if (success) {
	        	success(response);
	      	}
	      },
	      function(reason){
	      	if (error) {
	        	error(reason);
	        }
	    });*/
  	};

  	var POST = function(url, data) {
  		return $http.post(serverURL+url, data, {headers: {'Authorization': 'Bearer '+token}});
  	};

  	var PUT = function(url, data) {
  		if (!data) {
  			return $http.put(serverURL+url, {headers: {'Authorization': 'Bearer '+token}});
  		}
  		else {
  			return $http.put(serverURL+url, data, {headers: {'Authorization': 'Bearer '+token}});
  		}
  	};

  this.setToken = function(t) {
    console.log('Setting token '+ t);
    token = t;
  };

  this.createMatch = function(data) {
		return POST('/partidos', data);
	};

	this.getPlayersOfMatch = function(matchId) {
		return GET('/partidos/'+matchId+'/jugadores');
	};

  this.iAmIn = function(matchId) {
    return POST('/partidos/'+matchId+'/jugadores', {as: 'titular'});
  };

  this.maybeIn = function(matchId) {
    return POST('/partidos/'+matchId+'/jugadores', {as: 'suplente'});
  };

  this.decline = function(matchId) {
    return POST('/partidos/'+matchId+'/jugadores', {as: 'nojuega'});
  };

	this.removePlayerFromMatch = function(matchId, data) {
		return $http.delete(serverURL+'/partidos/'+matchId+'/jugadores', data);
	};

	this.getMatch = function(matchId) {
		return GET('/partidos/'+matchId);
	};

	this.getMatchStatusForPlayer = function(matchId) {
		return GET('/partidos/'+matchId+'/voy');
	};

  this.login = function(data) {
    return POST('/login', data);
  };

  this.logout = function() {
    return POST('/logout');
  };

	this.registerUser = function(data) {
		return POST('/registrarse', data);
	};

  this.checkToken = function(token) {
    return POST('/checktoken', {token: token});
  };

	this.activateUser = function(playerId) {
		return PUT('/activate/'+playerId);
	};

	this.getPlayer = function(playerId) {
		return GET('/jugadores/'+playerId);
	};

	this.getLeague = function(leagueId) {
		return GET('/ligas/'+leagueId);
	};

	this.getMatchesFromLeague = function(leagueId) {
		return GET('/ligas/'+leagueId+'/partidos');
	};

  this.joinLeague = function(leagueId) {
    return POST('/join/league', {leagueId: leagueId});
  };

}]);
