'use strict';

var q = require('q');
var nodemailer = require('nodemailer');

// Constructor
function EmailService() {

	this.smtpTransport = nodemailer.createTransport('SMTP',{
	    service: 'Gmail',
	    auth: {
	        user: 'futbol5server@gmail.com',
	        pass: '321Azxc2'
	    }
	});

	this.serverURL = '';
}

// class methods

EmailService.prototype.setServerURL = function(serverURL) {
	this.serverURL = serverURL;
};

EmailService.prototype.getWelcomeEmailOptions = function(user, language) {
	console.log("Enviando welcome email en"+ language);
    var Labels = {
		labels : {
			message : {
				es: 'Hola '+user.name+', hace click en el link para activar la cuenta ',
				'en-US': 'Hi '+user.name+', click the link to activate the account. '
			},
			link : {
				es: 'Activar',
				'en-US': 'Activate'
			},
			subject: {
				es: 'Bienvenido a Futbol5!',
				'en-US': 'Welcome to Soccer5!'
			}
		},
        getLabel : function(labelId) {
          return Labels.labels[labelId][language] || Labels.labels[labelId].es;
        }
	};


	return {
	    from: 'futbol5server@gmail.com', // sender address
	    to: user.email, // list of receivers
	    subject: Labels.getLabel('subject'), // Subject line
	    text: 'Hola '+ user.name, // plaintext body
	    html: '<p>'+Labels.getLabel('message')+'</p> <br> <a href="'+this.serverURL+'/#/activate/'+user.code+'">'+Labels.getLabel('link')+'</a>'
	};
};

var getPartidoUpdateEmailOptions = function(user, as, partido, to) {

	var Labels = {
		labels : {
			titulares : {
				es: "Titulares",
				"en-US": "Confirmed players"
			},
			suplentes : {
				es: "Suplentes",
				"en-US": "Secondary players"
			},
			nojuegan : {
				es: "No juegan",
				"en-US": "Not going players"
			},
			titularButton : {
				es: "Voy",
				"en-US": "I'm in"
			},
			suplenteButton : {
				es: "Suplente",
				"en-US": "Maybe"
			},
			nojuegaButton : {
				es: "No juego",
				"en-US": "I'm not In"
			},
			link : {
				es: "Ver partido",
				"en-US": "See match"
			},
			subject: {
				es: "Novedades del partido "+partido.nombre,
				"en-US": "News of the match "+partido.nombre
			},
			partidoInfo: {
				es: "Lugar "+partido.cancha+ ", fecha "+partido.fecha+" a las "+partido.hora,
				"en-US": "Place "+partido.cancha+ ", on "+partido.fecha+" at "+partido.hora,
			},
			userMessageAsTitular: {
				es: user.name + " ha sido anotado como titular.",
				"en-US": user.name + " has been added to the match."
			},
			userMessageAsSuplente: {
				es: user.name + " ha sido anotado como suplente.",
				"en-US": user.name + " has been added as secondary player to the match."
			},
			userMessageAsNoJuega: {
				es: user.name + " se bajo para el partido.",
				"en-US": user.name + " is not going to the match."
			}
		},
        getLabel : function(labelId) {
          return Labels.labels[labelId][to.language] || Labels.labels[labelId].es;
        }
	};

	//CSS taken from http://www.bestcssbuttongenerator.com/#/rsgIVQrKh2
	var buildButton = function() {
		var body ="";
		body+='<br> <a id="link" href="'+this.serverURL+'/titular?code='+partido.code+'&user='+to.code+'" style="-webkit-box-shadow: rgb(217, 251, 190) 0px 1px 0px 0px inset; box-shadow: rgb(217, 251, 190) 0px 1px 0px 0px inset; background-image: linear-gradient(rgb(165, 204, 82) 5%, rgb(184, 227, 86) 100%); background-color: rgb(165, 204, 82); border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; border: 1px solid rgb(131, 196, 26); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: arial; font-size: 15px; font-weight: bold; padding: 6px 24px; text-decoration: none; text-shadow: rgb(134, 174, 71) 0px 1px 0px; background-position: initial initial; background-repeat: initial initial; margin: 2px;">'+Labels.getLabel("titularButton")+' </a>';
		body+='<a id="link" href="'+this.serverURL+'/suplente?code='+partido.code+'&user='+to.code+'" style="-webkit-box-shadow: rgb(252, 226, 193) 0px 1px 0px 0px inset; box-shadow: rgb(252, 226, 193) 0px 1px 0px 0px inset; background-image: linear-gradient(rgb(251, 158, 37) 5%, rgb(255, 196, 119) 100%); background-color: rgb(251, 158, 37); border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; border: 1px solid rgb(238, 180, 79); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: arial; font-size: 15px; font-weight: bold; padding: 6px 24px; text-decoration: none; text-shadow: rgb(204, 159, 82) 0px 1px 0px; background-position: initial initial; background-repeat: initial initial; margin: 2px;">'+Labels.getLabel("suplenteButton")+' </a>';
		body+='<a id="link" href="'+this.serverURL+'/nojuega?code='+partido.code+'&user='+to.code+'" style="-webkit-box-shadow: rgb(245, 151, 142) 0px 1px 0px 0px inset; box-shadow: rgb(245, 151, 142) 0px 1px 0px 0px inset; background-image: linear-gradient(rgb(198, 45, 31) 5%, rgb(242, 69, 55) 100%); background-color: rgb(198, 45, 31); border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; border: 1px solid rgb(208, 39, 24); display: inline-block; cursor: pointer; color: rgb(255, 255, 255); font-family: arial; font-size: 15px; font-weight: bold; padding: 6px 24px; text-decoration: none; text-shadow: rgb(129, 14, 5) 0px 1px 0px; background-position: initial initial; background-repeat: initial initial; margin: 2px;">'+Labels.getLabel("nojuegaButton")+'</a>';
		return body;
	};

	var buildMailBodyHTML = function() {
		var i = 1;
		var body = "";
		body+="<div>"+Labels.getLabel("partidoInfo")+ "</div><br>";
		body+=buildButton();
		if (as == "titular") {
		   body += "<div>"+Labels.getLabel("userMessageAsTitular")+ "</div>";
		}
		if (as == "suplente") {
		   body += "<div>"+Labels.getLabel("userMessageAsSuplente")+ "</div>";
		}
		if (as == "nojuega") {
		   body += "<div>"+Labels.getLabel("userMessageAsNoJuega")+ "</div>";
		}
		body += "<br><div><strong>" + Labels.getLabel("titulares") + "</strong>";
		for (var index in partido.jugadores){
			var jugador = partido.jugadores[index];
			body += "<div>"+i+": "+jugador.name+"</div>";
			i++;
		}
        while (i <= partido.cantidadJugadores) {
            body+="<div>  "+i+": ? </div>";
            i++;
        }
		body += "<br></div><strong>"+Labels.getLabel("suplentes") + "</strong>";
		body += "<div>";

		for (var index in partido.suplentes){
			var jugador = partido.suplentes[index];
			body += "<div>  "+jugador.name+"</div>";
		}
		body += "</div>";
		body += "<br><div><strong>"+Labels.getLabel("nojuegan") + "</strong>";
		for (var index in partido.nojuegan){
			var jugador = partido.nojuegan[index];
			body += "<div>  "+jugador.name+"</div>";
		}
		body += "</div>";
		return body;
	};


	return {
	    from: "futbol5server@gmail.com", // sender address
	    to: to.email, // list of receivers
	    subject: Labels.getLabel("subject"), // Subject line
	    text: "Hola "+ user.name, // plaintext body
	    html: buildMailBodyHTML()+'<br> <a id="link" href="'+this.serverURL+'/partidos?code='+partido.code+'&user='+to.code+'">'+Labels.getLabel("link")+'</a>'
	}
};

EmailService.prototype.getPartidoInvitationEmailOptions = function(user, partido, language) {

	var Labels = {
		labels : {
			message : {
				es: "Hola "+user.name+", accede al partido en el siguiente link. ",
				"en-US": "Hi "+user.name+", see the match following this link. "
			},
			link : {
				es: "Ver partido",
				"en-US": "See match"
			},
			subject: {
				es: "Invitacion al partido "+partido.nombre,
				"en-US": "Invite to the match "+partido.nombre
			}
		},
        getLabel : function(labelId) {
          return Labels.labels[labelId][language] || Labels.labels[labelId].es;
        }
	};


	return {
	    from: "futbol5server@gmail.com", // sender address
	    to: user.email, // list of receivers
	    subject: Labels.getLabel("subject"), // Subject line
	    text: "Hola "+ user.name, // plaintext body
	    html: '<p>'+Labels.getLabel("message")+'</p> <br> <a id="link" href="'+this.serverURL+'/#/matches/'+partido.code+'">'+Labels.getLabel("link")+'</a>'
	}
};

// send mail with defined transport object
EmailService.prototype.sendEmail = function (email, onSuccess, onError) {
	console.log("Sending email to "+ email.to);
	this.smtpTransport.sendMail(email, function(error, response) {
	    if(error) {
	        console.log(error);
	        if (onError)
	        	onError();
	    }else{
	        if (onSuccess)
	        	onSuccess();
	    }

	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
};


// export the class
module.exports = new EmailService();