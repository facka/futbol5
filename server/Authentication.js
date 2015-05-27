'use strict';

 var jwt = require('jsonwebtoken'),
 	https = require('https');

// Constructor
function Authentication() {
	this.sessions = {};
}

// class methods
function getToken(headers) {
	if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');

        if (part.length === 2) {
            var token = part[1];
            return token;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}

Authentication.prototype.authenticate = function(req) {
	var token = getToken(req.headers);
    console.log("Authenticating user with token = "+ token + " in: "+ JSON.stringify(this.sessions));
    return this.sessions[token];
};

Authentication.prototype.checkToken = function(token) {
    console.log("Checking user token = "+ token);
    if (this.sessions[token]) {
        console.log("Not expired! ");
        return false;
    }
    console.log("Expired! ");
    return true;
};

Authentication.prototype.newToken = function(id) {
    console.log('New token '+ id);
	var token = jwt.sign({id: id}, 'secretNumber', { expiresInMinutes: 60 });
    this.sessions[token] = id;
    setTimeout(function() {
    	if (this.session[token]) {
            console.log('Token '+token+ ' of '+ this.session[token] + ' users expired!');
    		delete this.session[token];
    	}
    }, 60*(60*1000));
    return token;
};

Authentication.prototype.registerToken = function(token, userId) {
    console.log('Register token '+ userId);
    this.sessions[token] = userId;
    return token;
};

Authentication.prototype.removeToken = function(req) {
	var token = getToken(req.headers);
    if (this.sessions[token]) {
        console.log('Token of '+this.sessions[token] + ' removed.');
        delete this.sessions[token];
    }
};

Authentication.prototype.getFacebookToken = function(token, userId, success, error) {
    console.log('Get facebook token '+ userId);
    var self = this;
	var shortLivedToken = token;
	var appId = '384693415033353';
	var appSecret = '5a154a771dad4ade0fd7d00dc3df25a3';

    var path = 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id='+appId+'&client_secret='+appSecret+'&fb_exchange_token='+shortLivedToken;

	https.get(path, function(res) {
      res.on('data', function( response ) {
        var accessToken = (''+response).split('&')[0].split('=')[1];
        if (accessToken) {
            self.sessions[accessToken] = userId;
            success(accessToken);
        }
        else {
            error('Invalid token');
        }
      });
	}).on('error', function(e) {
	  console.log('Got error: ' + e.message);
	  error(e.message);
	});

};

// export the class
module.exports = new Authentication();