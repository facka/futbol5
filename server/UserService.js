'use strict';

var DB = require('./DB');
var LigaService = require('./LigaService');
var EmailService = require('./EmailService');

// Constructor
function UserService() {
	// always initialize all instance properties
	this.db = new DB('jugadores', 'code');
	this.pendingUsers = [];
}

// class methods
UserService.prototype.construct = function(name, email, estrellas, ligas, code) {
	return {
			name: name,
			email: email,
			estrellas: estrellas,
			ligas: ligas,
			code: code
		};
};

UserService.prototype.exists = function(email, resolve, reject) {
	var that = this;
	var onSuccess = function(data) {
		if (data) {
			resolve(data);
		}
		else {
			var found = false;
			for (var item in that.pendingUsers) {
				var user = that.pendingUsers[item];
				if (user.email === email) {
					found = true;
					resolve(user);
				}
			}
			if (!found) {
				resolve(null);
			}
		}
	};

	var onError = function(reason) {
		reject(reason);
	};

	that.db.getBy('email', email, onSuccess, onError);
};

UserService.prototype.get = function(id, resolve, reject) {
	this.db.get(id, resolve, reject);
};

UserService.prototype.getBy = function(property, id, resolve, reject) {
	this.db.getBy(property, id, resolve, reject);
};

UserService.prototype.save = function(entity, resolve, reject) {
	this.db.save(entity, resolve, reject);
};

UserService.prototype.update = function(entity, resolve, reject) {
	this.db.update(entity, resolve, reject);
};

UserService.prototype.remove = function(id) {

};

UserService.prototype.activateUser = function(code,success, error) {
	var i = 0;
	var userFound = false;
	var userFoundAt;
	var that = this;

	for (var item in that.pendingUsers) {
		var user = that.pendingUsers[item];
		if (user.code === code) {
			userFound = true;
			userFoundAt = i;
			var onSuccess = function(data) {
				that.pendingUsers.splice(userFoundAt,1);
				//Show pending matches
				success(data);
			};
			var onError = function(errorMessage) {
				error(errorMessage);
			};
			that.save(user,onSuccess,onError);
		}
		i++;
	}
	if (!userFound) {
		error('Codigo invalido, no se puede activar.');
	}
};

//Se notifica un nuevo partido a todos los usuarios de esa liga
UserService.prototype.notificarNuevoPartido = function(partido, language) {
	var that = this;
	var onSuccessGettingLiga = function (liga) {
		for (var index in liga.jugadores){
			var jugadorEmail = liga.jugadores[index];

			var onSuccessGettingJugador = function(jugador) {
				if (jugador) {
					EmailService.sendEmail(EmailService.getPartidoInvitationEmailOptions(jugador,partido,language));
				}
				else {
					console.log('No se encontro el usuario en la liga para enviarle el mail.');
				}
			};
			var onErrorGettingJugador = function (error) {
				console.log(error);
			};

			that.db.getBy('email', jugadorEmail, onSuccessGettingJugador, onErrorGettingJugador);
		}
	};

	var onErrorGettingLiga = function (error) {
		//No se hace nada, ver la forma de notificar
		console.log(error);
	};

	LigaService.get(partido.liga, onSuccessGettingLiga, onErrorGettingLiga);

	//TODO get Liga del partido , iterar sobre los jugadores de la liga y enviar el mail
};
UserService.prototype.toLightUser = function(user) {
	return {
		name : user.name,
  		email : user.email,
  		estrellas : user.estrellas
	};
};

// export the class
module.exports = new UserService();