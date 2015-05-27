'use strict';

var DB = require('./DB');
var Services = {};
// Constructor
function LigaService() {
	// always initialize all instance properties
	this.db = new DB('ligas', 'name');
	this.pendingUsers = [];
}

// class methods
LigaService.prototype.construct = function (name, partidos, jugadores, ciudad, admins) {
	return {
		name : name, //name de la liga, funciona como Id
		partidos: partidos, //partidos activos, no se guarda el historial (borrar partidos viejos periodicamente)
		jugadores : jugadores, //jugadores inscriptos en la liga {name, email}
		ciudad: ciudad,  // ciudad a la que pertenece la liga
		admins : admins   // administradores de la liga
	};
};
LigaService.prototype.inject = function (moduleName, module) {
	Services[moduleName] = module;
};
LigaService.prototype.saveLiga = function(liga,success,error) {
	this.db.save(liga, success, error);
};
LigaService.prototype.get = function(name,success,error) {
	this.db.get(name,function(liga) {
		liga.players = [];

		var response = responseManager(liga.jugadores.length, success, error, liga);

		function addPlayer(player) {
			console.log('player: '+ player);
			liga.players.push(player);
			response.addSuccess();
		}

		for (var jugadorId in liga.jugadores) {
			Services.UserService.get(liga.jugadores[jugadorId],addPlayer, function(reason) {
				response.addError(reason);
			});
		}

	},error);
};
LigaService.prototype.updateLiga  = function(liga,success,error) {
	this.db.update(liga, success, error);
};
LigaService.prototype.exists = function(name,success,error){
	var onSuccess = function(data) {
		if (data) {
			success(data);
		}
		else {
			success(false);
		}
	};
	this.db.get(name,onSuccess,error);
};

function responseManager(requiredSuccess, successCallback, errorCallback, response) {
	var successCount = 0;
	var error;

	return {
		addSuccess: function() {
			if (!error) {
				successCount ++;
				if (successCount === requiredSuccess) {
					successCallback(response);
				}
			}
		},
		addError: function(message) {
			error = true;
			errorCallback(message);
		}
	};
}

LigaService.prototype.addJugador = function(liga, jugadorId, success, error) {
	var found = false;
	for (var index in liga.jugadores) {
		var id = liga.jugadores[index];
		if (id === jugadorId) {
			found = true;
			break;
		}
	}

	if (!found) {

		var response = responseManager(3, success, error);

		liga.jugadores.push(jugadorId);
		Services.UserService.get(jugadorId, function successGet(jugador) {
			response.addSuccess();
			jugador.ligas.push(liga.name);
			console.log("UPdating player");
			Services.UserService.update(jugador, function successUpdate() {
				console.log("Player updated!");
				response.addSuccess();
			}, function errorUpdate(message) {
				response.addError(message);
			});
		}, function errorGet(message) {
			response.addError(message);
		});
		this.db.update(liga, function() {
			console.log("League updated!");
			response.addSuccess();
		}, function(message) {
			response.addError(message);
		});
	}
	else {
		success(liga);
	}
};
LigaService.prototype.getPartidos = function(name, success, error) {
	var onSuccess = function(liga) {
		console.log('liga JSON: '+ JSON.stringify(liga));
		liga.matches = [];
		var response = responseManager(liga.partidos.length, success, error, liga.matches);

		function addMatch(match) {
			liga.matches.push(match);
			response.addSuccess();
		}

		if (liga && liga.partidos.length) {

			for (var partidoId in liga.partidos) {
				Services.PartidoService.get(liga.partidos[partidoId], addMatch, function(reason) {
					response.addError(reason);
				});
			}
		}
		else {
			success([]);
		}
	};
	console.log("GEtting liga by name "+ name);
	this.db.get(name,onSuccess,error);
};

// export the class
module.exports = new LigaService();