'use strict';

var pendingUsers = [];

var UserService = require('./UserService');
var PartidoService = require('./PartidoService');
var LigaService = require('./LigaService');
var EmailService = require('./EmailService');
var Authentication = require('./Authentication');

LigaService.inject('UserService', UserService);
LigaService.inject('PartidoService', PartidoService);

var serverURL = 'http://localhost:8081';
var frontendURL = 'http://localhost:9091';
//var serverURL = 'http://futbol5-2.jit.su';

EmailService.setServerURL(frontendURL);

var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , bodyParser = require('body-parser')
  , fs = require('fs')
  , locale = require('locale')
  , path = require('path')
  , jwt = require('jsonwebtoken')
  , supported = new locale.Locales(['es', 'en_US']);

var chance = require('chance').Chance();

var router = express.Router(); 				// get an instance of the express Router

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  next();
});

//app.use(express.json());
//app.use(express.bodyParser());

var port = Number(process.env.PORT || 8083);

server.listen(port);
console.log('Listening on ' + port);

app.use(bodyParser.json());
app.use(locale(supported));
app.use(express.static(path.resolve(__dirname + '/../dist')));

console.log('__dirname: '+ __dirname);

var response404 = function(res) {
	res.sendfile(path.resolve(__dirname + '/../404.html'));
};

var sendResponse = function(res, file){
	fs.exists(file,function(exists){
		if (exists) {
			res.sendfile(file);
		}
		else {
			response404(res);
		}
	});
};

app.get('/', function (req, res) {
  res.sendfile(path.resolve(__dirname + '/../welcome.html'));
});

app.get('/js/:which', function(req, res) {
	var file = path.resolve(__dirname + '/../js/'+req.params.which);
    sendResponse(res,file);
});

app.get('/images/:which', function(req, res) {
	var file = path.resolve(__dirname + '/../images/'+req.params.which);
    sendResponse(res,file);
});

app.get('/css/:which', function(req, res) {
	var file = path.resolve(__dirname + '/../css/'+req.params.which);
    sendResponse(res,file);
});

app.get('/jugador', function(req, res) {
	res.sendfile(path.resolve(__dirname + '/../jugador.html'));
});

app.get('/partidos', function(req, res) {
	res.sendfile(path.resolve(__dirname + '/../partido.html'));
});

app.get('/liga', function(req, res) {
	res.sendfile(path.resolve(__dirname + '/../liga.html'));
});

var response500 = function(res) {
	res.writeHead(500, { 'Content-Type': 'text/plain' });
	res.end('Error 500: Internal Server Error!');
};


/////////////////////////////////////////////////////////////////////



////////////////////////////START bootstrap////////////////////////////////////

/*var partidoTest = partidoService.construct("Partido Test","Cancha Test","28/03/2014","19:00","$60","test",[],[],[],10,"test");
partidoService.save(partidoTest,function(){
	console.log("Success");
},function(){
	console.log("Error");
});*/
//var usuarioTest = UserService.construct("Facundo Crego1","facundo.crego@gmail.com",3,"test","1");
//var usuarioTest2 = UserService.construct("Lionel Messi","facundo.crego@gmail.com",5,"test","2");
/*
var usuarioTest1 = UserService.construct("Test1","facundo.crego@gmail.com",5,"test","test1");
var usuarioTest2 = UserService.construct("Test2","facundo.crego@gmail.com",5,"test","test2");
var usuarioTest3 = UserService.construct("Test3","facundo.crego@gmail.com",5,"test","test3");
var usuarioTest4 = UserService.construct("Test4","facundo.crego@gmail.com",5,"test","test4");
var usuarioTest5 = UserService.construct("Test5","facundo.crego@gmail.com",5,"test","test5");
var usuarioTest6 = UserService.construct("Test6","facundo.crego@gmail.com",5,"test","test6");
var usuarioTest7 = UserService.construct("Test7","facundo.crego@gmail.com",5,"test","test7");
var usuarioTest8 = UserService.construct("Test8","facundo.crego@gmail.com",5,"test","test8");
var usuarioTest9 = UserService.construct("Test9","facundo.crego@gmail.com",5,"test","test9");
var usuarioTest10 = UserService.construct("Test10","facundo.crego@gmail.com",5,"test","test10");

var usuariosTest = [usuarioTest1,usuarioTest2,usuarioTest3,usuarioTest4,usuarioTest5,usuarioTest6,usuarioTest7,usuarioTest8,usuarioTest9,usuarioTest10]
for (var i in usuariosTest) {
	UserService.save(usuariosTest[i],function(){
		console.log("Success");
	},function(){
		console.log("Error");
});
}*/
//partidoTest.jugadores.push(usuarioTest);
//partidoTest.jugadores.push(usuarioTest2);

//partidoService.save(partidoTest);

/*UserService.save(usuarioTest,function(){
	console.log("Success");
},function(){
	console.log("Error");
});*/
//UserService.save(usuarioTest2);
////////////////////////////END bootstrap////////////////////////////////////


///////////////////////////API UTILS//////////////////////////////////////////
var bodyHasRequiredProperties = function(body, properties){
	for (var i in properties) {
		var prop = properties[i];
		if(!body.hasOwnProperty(prop)) {
		    return false;
		} else {
			if (!body[prop]) {
				return false;
			}
		}
	}
	return true;
};
///////////////////////////API UTILS END//////////////////////////////////////////

/////////////////////////UTILS///////////

var Utils = {
	createCode : function() {
		return chance.string({length: 20, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
	}
};


/////////////////////////UTILS END///////////

function login(req, res) {
    if (req.body.loginType === 'facebook') {
        Authentication.getFacebookToken(req.body.token, req.body.userId, function(token) {
            res.json({token:token});
        }, function(){
            res.status(401).end();
        });
    }
    else {
        res.status(400).end();
    }
}

function authenticate (req, res, next) {
    if (Authentication.authenticate(req)) {
        console.log('Authenticated!');
        next();
    }
    else {
        console.log('Unauthorized!!');
        res.status(401).end();
    }
}

function addUser(req, res) {
    //name, email, estrellas, ligas, code
    var user = UserService.construct(req.body.username, '', 3, [], req.body.userId);
    UserService.save(user, function() {
        console.log('user saved');
        login(req, res);
    }, function() {
        res.status(400).end();
    });
}

app.post('/api/login', function(req, res) {
    console.log('API: POST /login');

    var requiredProperties = ['userId','username','loginType', 'token'];
    if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
        res.statusCode = 400;
        return res.json('Invalid request body');
    }

    UserService.get(req.body.userId, function(user){
        if (user) {
            console.log('User found');
            login(req, res);
        }
        else {
            console.log('user not found, adding user');
            addUser(req, res);
        }
    }, function() {
        addUser(req, res);
    });
});

app.post('/api/checktoken', function(req, res) {
    console.log('API: POST /login');

    var requiredProperties = ['token'];
    if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
        res.statusCode = 400;
        return res.json('Invalid request body');
    }

    var expired = Authentication.checkToken(req.body.token);
    res.json({
      expired: expired
    });
});

app.post('/api/logout', function(req, res) {
    console.log('API: POST /logout');
    Authentication.removeToken(req);
    res.send(200);
});


app.post('/api/registrarse', function(req, res) {
    console.log('API: POST /registrarse');
    var requiredProperties = ['id','nombre','email','liga'];
    if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
        res.statusCode = 400;
        return res.json('Invalid request body');
    }

    var ligas = [req.body.liga];
    var user = UserService.construct(req.body.nombre,req.body.email,3,ligas,req.body.id);

    var onSuccessSendEmail = function() {
        var onSuccessLigaExists = function(data) {
            if (data) {
                pendingUsers.push(user);
                res.json({});
            }
            else {
                var liga = LigaService.construct(user.ligas[0], [], [], null, []);
                var onSuccessSaveLiga = function() {
                    pendingUsers.push(user);
                    res.json({});
                };
                LigaService.saveLiga(liga, onSuccessSaveLiga, function() {
                    res.json({error: 'ERROR'});
                });
            }
        };
        LigaService.exists(user.ligas[0], onSuccessLigaExists, function() {
            res.json({error: 'ERROR'});
        });
    };

    var onSuccessExists = function(data) {
        if (data) {
            res.json({error: 'EXISTS'});
        }
        else {
            EmailService.sendEmail(EmailService.getWelcomeEmailOptions(user,req.body.language), onSuccessSendEmail, function() {
                res.json({error: 'EMAIL'});
            });
        }
    };

    var onErrorExists = function() {
        res.json(false);
    };

    UserService.exists(req.body.email, onSuccessExists, onErrorExists);

});

app.post('/api/join/league', authenticate, function(req, res) {
    console.log('API: POST /joinLeague');
    var requiredProperties = ['leagueId'];
    if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
        res.statusCode = 400;
        return res.json('Invalid request body');
    }

    var leagueId = req.body.leagueId;

    var userId = Authentication.authenticate(req, res);

    var onSuccessLigaExists = function(data) {
        if (data) {
            LigaService.addJugador(data, userId, function success() {
                res.json({info: 'JOIN'});
            }, function error() {
                res.json({error: 'Error agregando jugador'});
            });
        }
        else {
            var liga = LigaService.construct(leagueId, [], [], null, [userId]);
            LigaService.saveLiga(liga, function success() {
                LigaService.addJugador(liga, userId, function success() {
                    res.json({info: 'NEW'});
                }, function error(message) {
                    res.json({error: 'Error agregando jugador: '+message});
                });
            }, function error() {
                res.json({error: 'ERROR'});
            });
        }
    };

    LigaService.exists(leagueId, onSuccessLigaExists, function() {
        res.json({error: 'ERROR'});
    });

});

app.put('/api/activate/:code', function(req, res) {
    var onSuccess = function(data) {
    	res.json({result: 'new'});
    };
    var onError = function(error) {
    	var onSuccessGettingUser = function(user) {
    		res.json({result: 'exists'});
    	};
    	var onErrorGettingUser = function() {
    		res.json({result: 'notExists'});
    	};
    	UserService.get(req.params.code,onSuccessGettingUser,onErrorGettingUser);
    };
	UserService.activateUser(req.params.code, onSuccess, onError);
});

app.post('/api/partidos', authenticate, function(req, res) {
	console.log('API: POST /partidos');
	var requiredProperties = ['nombre','cancha','fecha','hora','precio','liga','cantidadJugadores'];
	if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
	    res.statusCode = 400;
	    return res.json('Invalid request body');
	}

	var code = Utils.createCode();
	var partido = PartidoService.construct(req.body.nombre,req.body.cancha,req.body.fecha,req.body.hora,req.body.precio,req.body.liga,[],[], [],req.body.cantidadJugadores,code);

	var onSuccess = function() {
		UserService.notificarNuevoPartido(partido, req.body.language);
	  	return res.json(true);
	};
	var onError = function () {
		res.statusCode = 500;
		return res.json(false);
	};
	PartidoService.save(partido,onSuccess,onError);
});

app.post('/api/partidos/:id/jugadores', authenticate, function(req, res) {
	console.log('API: POST /partidos/{id}/jugadores');
	var requiredProperties = ['as'];
	if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
	    res.statusCode = 400;
	    return res.json('Invalid request body');
	}
  var userId = Authentication.authenticate(req, res);
	var onSuccessGettingPartido = function(partido) {
		if (partido) {
			var onSuccess = function(usuario) {
				if (usuario) {
					var onSuccessAddingJugador = function(updatedData) {
						res.json(PartidoService.toLightPartido(updatedData));
					};

					var onErrorAddingJugador = function() {
						res.json(PartidoService.toLightPartido(partido));
					};

					PartidoService.addJugador(partido, usuario, req.body.as, onSuccessAddingJugador, onErrorAddingJugador);
				}
				else {
					res.json(null);
				}
			};
			var onError = function(error) {
				res.statusCode = 404;
				res.json(error);
			};
			UserService.get(userId,onSuccess,onError);
		}
		else {
			res.json(null);
		}
	};

	var onErrorGettingPartido = function(error){
		res.statusCode = 404;
		res.json(error);
	};
	PartidoService.get(req.params.id,onSuccessGettingPartido,onErrorGettingPartido);
});

app.delete('/api/partidos/:id/jugadores', function(req, res) {
	console.log('API: DELETE /partidos/{id}/jugadores');
	var requiredProperties = ['user'];
	if(!bodyHasRequiredProperties(req.body, requiredProperties)) {
	    res.statusCode = 400;
	    return res.json('Invalid request body');
	}
	var onSuccessGettingPartido = function(partido) {
		var onSuccess = function(usuario) {
			var onSuccessRemoving = function() {
				res.json(PartidoService.toLightPartido(partido));
			};
			var onErrorRemoving = function() {
				res.json(false);
			};
			PartidoService.removeJugador(partido, usuario.code, onSuccessRemoving,onErrorRemoving);

		};
		var onError = function(error) {
			res.statusCode = 404;
			res.json(error);
		};
		UserService.get(req.body.user,onSuccess,onError);
	};
	var onErrorGettingPartido = function(error) {
		res.statusCode = 404;
		res.json(error);
	};
	PartidoService.get(req.params.id,onSuccessGettingPartido,onErrorGettingPartido);
});

app.get('/api/partidos/:id', function (req, res) {
  var code = req.params.id;
  console.log('getting partido '+code);
  var onSuccessGettingPartido = function(partido) {
  	res.json(PartidoService.toLightPartido(partido));
  };
  var onErrorGettingPartido = function(error) {
  	return res.json(error);
  };
  PartidoService.get(code,onSuccessGettingPartido,onErrorGettingPartido);
});

//Retorna el estado de un jugador para un partido.
app.get('/api/partidos/:id/voy', authenticate, function (req, res) {
  console.log('Getting voy al partido '+code);
  var code = req.params.id;


  var onSuccessGettingPartido = function(partido) {
  	//buscar en que lista esta anotado el jugador en el partido

  	var onSuccess = function(jugador) {
  		if (!jugador) {
  			res.statusCode = 404;
	 		  return res.json({error : 'Jugador no encontrado'});
  		}

  		for (var i in partido.jugadores) {
  			var titular = partido.jugadores[i];
  			if (titular.email === jugador.email) {
  				return res.json( { as: 'titular'});
  			}
  		}

  		for (var i in partido.suplentes) {
  			var suplente = partido.suplentes[i];
  			if (suplente.email === jugador.email) {
  				return res.json( { as: 'suplente'});
  			}
  		}

  		for (var i in partido.nojuegan) {
  			var nojuega = partido.nojuegan[i];
  			if (nojuega.email === jugador.email) {
  				return res.json( { as: 'nojuega'});
  			}
  		}

  		return res.json( { as: null });
  };

  var onError = function() {
  	res.statusCode = 404;
   	return res.json('Jugador no encontrado');
  };
  var userId = Authentication.authenticate(req, res);
  console.log('Getting voy al partido: userId  '+userId);
	UserService.get(userId,onSuccess,onError);
  };

  var onErrorGettingPartido = function(error) {
  	res.statusCode = 404;
	  return res.json(error);
  };

  PartidoService.get(code,onSuccessGettingPartido,onErrorGettingPartido);

});

app.get('/titular', function(req, res) {
	var partidoCode = req.query.code;
	var userCode = req.query.user;
	var onSuccessGettingPartido = function(partido) {
		if (partido) {
			var onSuccess = function(usuario) {
				if (usuario) {
					var onSuccessAddingJugador = function(updatedData) {
						res.sendfile(__dirname + '/partido.html');
					};

					var onErrorAddingJugador = function() {
						response404(res);
					};

					PartidoService.addJugador(partido, usuario, 'titular', onSuccessAddingJugador, onErrorAddingJugador);
				}
				else {
					response404(res);
				}
			};
			var onError = function(error) {
				response404(res);
			};
			UserService.get(userCode,onSuccess,onError);
		}
		else {
			response404(res);
		}
	};

	var onErrorGettingPartido = function(error){
		response404(res);
	};
	PartidoService.get(partidoCode,onSuccessGettingPartido,onErrorGettingPartido);
});

app.get('/suplente', function(req, res) {
	var partidoCode = req.query.code;
	var userCode = req.query.user;
	var onSuccessGettingPartido = function(partido) {
		if (partido) {
			var onSuccess = function(usuario) {
				if (usuario) {
					var onSuccessAddingJugador = function(updatedData) {
						res.sendfile(__dirname + '/partido.html');
					};

					var onErrorAddingJugador = function() {
						response404(res);
					};

					PartidoService.addJugador(partido, usuario, 'suplente', onSuccessAddingJugador, onErrorAddingJugador);
				}
				else {
					response404(res);
				}
			};
			var onError = function(error) {
				response404(res);
			};
			UserService.get(userCode,onSuccess,onError);
		}
		else {
			response404(res);
		}
	};

	var onErrorGettingPartido = function(error){
		response404(res);
	};
	PartidoService.get(partidoCode,onSuccessGettingPartido,onErrorGettingPartido);
});

app.get('/nojuega', function(req, res) {
	var partidoCode = req.query.code;
	var userCode = req.query.user;
	var onSuccessGettingPartido = function(partido) {
		if (partido) {
			var onSuccess = function(usuario) {
				if (usuario) {
					var onSuccessAddingJugador = function(updatedData) {
						res.sendfile(__dirname + '/partido.html');
					};

					var onErrorAddingJugador = function() {
						response404(res);
					};

					PartidoService.addJugador(partido, usuario, 'nojuega', onSuccessAddingJugador, onErrorAddingJugador);
				}
				else {
					response404(res);
				}
			};
			var onError = function(error) {
				response404(res);
			};
			UserService.get(userCode,onSuccess,onError);
		}
		else {
			response404(res);
		}
	};

	var onErrorGettingPartido = function(error){
		response404(res);
	};
	PartidoService.get(partidoCode,onSuccessGettingPartido,onErrorGettingPartido);
});


app.get('/api/jugadores/:id', authenticate, function (req, res) {
  var code = req.params.id;
  var onSuccess = function(jugador) {
  	if (jugador) {
  		console.log('jugador encontrado '+jugador.name);
  		res.json(jugador);
  	}
  	else {
  		res.statusCode = 404;
		return res.json('Jugador no encontrado');
  	}
  };
  var onError = function(error) {
  	res.statusCode = 404;
	return res.json(error);
  };
  console.log('SEarching user '+ code);
  UserService.get(code,onSuccess,onError);
});

//TODO chequear que solo pueda ver la liga quien es parte de la liga
app.get('/api/ligas/:name', authenticate, function (req, res) {
  var name = req.params.name;
  var onSuccess = function(liga) {
  	if (liga) {
  		console.log('Liga encontrada '+liga.name);
  		res.json(liga);
  	}
  	else {
  		res.statusCode = 404;
		return res.json('Liga no encontrada');
  	}
  };
  var onError = function(error) {
  	res.statusCode = 404;
	return res.json(error);
  };
  LigaService.get(name,onSuccess,onError);
});

app.get('/api/ligas/:name/partidos', function (req, res) {
  var name = req.params.name;
  console.log('GET /api/ligas/'+name+'/partidos');
  var onSuccess = function(partidos) {
  	if (partidos) {
  		res.json(partidos);
  	}
  	else {
  		res.statusCode = 404;
		return res.json('Liga no encontrada');
  	}
  };
  var onError = function(error) {
  	res.statusCode = 404;
	return res.json(error);
  };
  LigaService.getPartidos(name,onSuccess,onError);
});



/*
var schedule = require('node-schedule');

var isMatchCloseToStart = function(date) {
	var today = new Date();
	if (today.getFullYear() == date.getFullYear()){
		if (today.getMonth() == date.getMonth()) {
			date.setDate(date.getDate()-2)
			if (date < today) {
				console.log('Notificar a los miembros de la liga del nuevo partido');
			}
		}
	}
}

var job = schedule.scheduleJob({hour: '00', minute: '50', dayOfWeek: new schedule.Range('0', '6')}, function(){
    console.log('Time to check matches close to start.');
    var onGetAllPartidos = function(partidos) {
    	var today = new Date();
    	for (var i in partidos) {
    		var partido = partidos[i];
    		var partidoDate = new Date(partido.fecha);
    		if (partidoDate != 'Invalid Date') {
    			if ( partidoDate < new Date()) {

    			}
    		}
    	}
    };
    var onError = function(error) {
    	console.log('No se ejecuta el job. Error obteniendo partidos.');
    };
    PartidoService.getAll(onGetAllPartidos, onError);
});

*/