'use strict';

var DB = require('./DB');
var LigaService = require('./LigaService');
var UserService = require('./UserService');
var EmailService = require('./EmailService');

// Constructor
function PartidoService() {
	// always initialize all instance properties
	this.db = new DB('partidos', 'code');
}

// class methods
PartidoService.prototype.construct = function(name, cancha, fecha, hora, precio, liga, jugadores, suplentes, nojuegan, cantidadJugadores, code) {
		return {
			nombre : name,
		    cancha : cancha,
		    fecha : fecha,
		    hora : hora,
		    precio : precio,
		    liga : liga,
		    jugadores : jugadores,
		    suplentes : suplentes,
		    nojuegan : nojuegan,
		    cantidadJugadores: cantidadJugadores,
		    code : code
		};
	};

PartidoService.prototype.exists  = function(partidoId,success,error){
	var onSuccess = function(data) {
		if (data) {
			success(true);
		}
		else {
			success(false);
		}
	};
	this.db.get(partidoId,onSuccess,error);
};

PartidoService.prototype.save = function(partido,success,error) {
	var onSuccessCreatingPartido = function(newPartido) {
		var onSuccessGettingLiga = function(liga) {
			if (liga) {
				liga.partidos.push(partido.code);
				LigaService.updateLiga(liga, success, error);
			}
			else {
				liga = LigaService.construct(partido.liga, [partido.code], [], null, []);
				LigaService.saveLiga(liga,success,error);
			}

		};
		LigaService.get(partido.liga, onSuccessGettingLiga, error);
	};
	this.db.save(partido,onSuccessCreatingPartido,error);
};

PartidoService.prototype.get = function(partidoId,success, error) {
	this.db.get(partidoId,success,error);
};
PartidoService.prototype.getAll = function(success, error) {
	this.db.getAll(success,error);
};
PartidoService.prototype.getJugador = function(partido, jugadorId,success,error) {
	var onSuccess = function(data) {
		var found;
		for (var i in partido.jugadores) {
			var jugador = partido.jugadores[i];
			if (jugador.code === jugadorId) {
				found = true;
				success(jugador);
			}
		}
		if (!found) {
			error('Jugador no encontrado');
		}
	};
	this.get(partido.code, onSuccess, error);
};
PartidoService.prototype.addJugador = function(partido, jugador, as, success, error) {

	var that = this;

	var quitarJugador = function(lista, email) {
		var i = 0;
		for (var item in lista) {
			var jugador = lista[item];
			if (jugador.email === email) {
				lista.splice(i,1);
			}
			i++;
		}
	};

	var existeEnLista = function(lista, email) {
		for (var item in lista) {
			var jugador = lista[item];
			if (jugador.email === email) {
				return true;
			}
		}
		return false;
	};

	if (as === 'titular') {
		if (partido.cantidadJugadores === partido.jugadores.length) {
			console.log('No hay vacantes para este partido.');
			quitarJugador(partido.suplentes, jugador.email);
			quitarJugador(partido.nojuegan, jugador.email);
			if (!existeEnLista(partido.suplentes, jugador.email)){
				partido.suplentes.push(jugador);
			}

			var onSuccessUpdatePartido = function(data) {
		        //TODO get jugadores de una liga y notificar a todos que se lleno el cupo
		        that.notifyPartidoUpdate(partido, {jugador: jugador, as: 'suplente'});
				success(data);
			};

			that.db.update(partido,onSuccessUpdatePartido,error);
		}
		else {
			if (!existeEnLista(partido.jugadores, jugador.email)){
				partido.jugadores.push(jugador);
			}
			quitarJugador(partido.suplentes, jugador.email);
			quitarJugador(partido.nojuegan, jugador.email);
			var onSuccessUpdatePartido = function(data) {
				that.notifyPartidoUpdate(partido, {jugador: jugador, as: as});
				success(data);
			};
			that.db.update(partido,onSuccessUpdatePartido,error);
		}
	}
	if (as === 'suplente') {
		if (!existeEnLista(partido.suplentes, jugador.email)){
			partido.suplentes.push(jugador);
		}
		quitarJugador(partido.jugadores, jugador.email);
		quitarJugador(partido.nojuegan, jugador.email);
		var onSuccessUpdatePartido = function(data) {
				that.notifyPartidoUpdate(partido, {jugador: jugador, as: as});
				success(data);
			};
		that.db.update(partido,onSuccessUpdatePartido,error);
	}
	if (as === 'nojuega') {
		if (!existeEnLista(partido.nojuegan, jugador.email)){
			partido.nojuegan.push(jugador);
		}
		quitarJugador(partido.jugadores, jugador.email);
		quitarJugador(partido.suplentes, jugador.email);
		var onSuccessUpdatePartido = function(data) {
			that.notifyPartidoUpdate(partido, {jugador: jugador, as: as});
			success(data);
		};
		that.db.update(partido,onSuccessUpdatePartido,error);
	}
};

PartidoService.prototype.notifyPartidoUpdate = function(partido, change) {
	var that = this;
	var onSuccess = function(jugadoresActivos) {
		for (var i in jugadoresActivos) {
			var destinatarioEmail = jugadoresActivos[i];
			var onSuccessGetUserByEmail = function (destinatario)  {
    			if (destinatario) {
	     			EmailService.sendEmail(EmailService.getPartidoUpdateEmailOptions(change.jugador, change.as, partido, destinatario));
    			}
	     		else {
	     			console.log("Mail no enviado dado que no se encontro el jugador");
	     		}
	     	};
	     	var onErrorGetUserByEmail = function() {
	     		console.log("Warning: player not added to the list of active players");
	     	};
	     	UserService.getBy(destinatarioEmail, 'email', onSuccessGetUserByEmail, onErrorGetUserByEmail);
		}
	};
	var onError = function() {
		console.log("Error al obtener los jugadores activos de un partido!");
	};
	this.getJugadoresActivos(partido, onSuccess, onError);
};

PartidoService.prototype.removeJugador = function(partido, jugadorId, success, error) {
	var i = 0;
	var foundAt;
	for (var item in partido.jugadores) {
		var jugador = partido.jugadores[item];
		if (jugador.code === jugadorId) {
			partido.jugadores.splice(i,1);
			foundAt = i;
			this.updatePartido(partido,success,error);
		}
		i++;
	}
	if (!foundAt) {
		error('Jugador no encontrado');
	}
};
PartidoService.prototype.getJugadoresActivos = function(partido, success, error){
	var onSuccessGettingLiga = function(liga) {
		var jugadoresActivos = [];

		var existeEnLista = function(lista, email) {
			for (var item in lista) {
				var jugador = lista[item];
				if (jugador.email === email) {
					return true;
				}
			}
			return false;
		};

		for(var index in liga.jugadores) {
		     var jugadorLiga = liga.jugadores[index];
		     if (!existeEnLista(partido.nojuegan, jugadorLiga)) {
		     	jugadoresActivos.push(jugadorLiga);
		     	/*var onSuccess = function (jugador)  {
		     		console.log("Agregado "+jugador.name);
		     		jugadoresActivos.push(jugadorLiga);
		     	};
		     	var onError = function() {
		     		console.log("Warning: player not added to the list of active players");
		     	};
		     	DB.getUserByEmail(jugadorLiga, success, error);
		    	*/
		     }
		}
		success(jugadoresActivos);
	};
	LigaService.get(partido.liga, onSuccessGettingLiga, error);
};
PartidoService.prototype.toLightPartido = function(partido){
	if (!partido) {
		return null;
	}
	var lightJugadores = [];
  	for (var i in partido.jugadores) {
  		lightJugadores.push(partido.jugadores[i]);
  	}
  	var lightSuplentes = [];
  	for (var i in partido.suplentes) {
  		lightSuplentes.push(partido.suplentes[i]);
  	}
  	var lightNoJuegan = [];
  	for (var i in partido.nojuegan) {
  		lightNoJuegan.push(partido.nojuegan[i]);
  	}
  	var response = this.construct(partido.nombre, partido.cancha, partido.fecha, partido.hora, partido.precio, partido.liga, lightJugadores, lightSuplentes, lightNoJuegan, partido.cantidadJugadores, partido.code);
		return response;
};

// export the class
module.exports = new PartidoService();