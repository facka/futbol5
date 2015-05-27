'use strict';

var Cache = require('./Cache');
var Usergrid = require('usergrid');

var client = new Usergrid.client({
    orgName:'facka',
    appName:'futbol5',
    authType: Usergrid.AUTH_CLIENT_ID,
    clientId:'b3U6vqDXqih6EeOyMN0HGsQPKQ',
    clientSecret:'b3U64Lj1JMpU1-eAymvZoEXrZos8038',
    logging: false, //optional - turn on logging, off by default
    buildCurl: false //optional - turn on curl commands, off by default
});

var utils = {
	removePlusSymbol : function(str) {
		var plusCode = '{{plus}}';
		while (str.indexOf('+') !== -1) {
			str = str.replace('+',plusCode);
		}
		return str;
	},
	addPlusSymbol : function (str) {
		var plusCode = '{{plus}}';
		while (str.indexOf(plusCode) !== -1) {
			str = str.replace(plusCode, '+');
		}
		return str;
	}
};

// Constructor
function DB(name, idProperty) {
	// always initialize all instance properties
	this.name = name;
	this.cache = new Cache();
	this.idProperty = idProperty || 'id';
}

DB.prototype.get = function(id, resolve, reject) {
	var cachedEntity = this.cache.get(id);
	var that = this;
	if (cachedEntity) {
		console.log('Returning entity from cache.');
		resolve(cachedEntity);
	}
	else {
		console.log('Finding entity in database '+ that.name);
		var options = {
		  	method:'GET',
    		endpoint: that.name,
    		qs: {ql:"select * where "+that.idProperty+"='"+id+"'"}
		};
		console.log('Query: ' + options.qs.ql);
		client.request(options, function(err, data) {
		    if (err){
		        reject('Error finding entity.');
		    } else {
		    	console.log(that.name + ' DB response: '+ JSON.stringify(data.entities[0]));
 				var entity = data.entities[0];
 				if (entity) {
 					if (entity.email) {
 						entity.email = utils.addPlusSymbol(entity.email);
 					}
 					that.cache.update(entity[that.idProperty],entity);
 				}
		        resolve(entity);
		    }
		});
	}
};

DB.prototype.getBy = function(property, id, resolve, reject) {
	var that = this;
	console.log('Finding entity in database by property "' + property +'"...');
	var options = {
	  	method:'GET',
		endpoint: that.name,
		qs: {ql:"select * where "+property+"='"+id+"'"}
	};
	console.log('Query: ' + options.qs.ql);
	client.request(options, function(err, data) {
	    if (err){
	        reject('Error finding entity.');
	    } else {
			var entity = data.entities[0];
			if (entity) {
				if (entity.email) {
					entity.email = utils.addPlusSymbol(entity.email);
				}
				that.cache.update(entity[that.idProperty],entity);
			}
	        resolve(entity);
	    }
	});
};

DB.prototype.getAll = function(success, error) {
	console.log('getting all from database '+this.name);
	var options = {
		method:'GET',
		endpoint: this.name
	};
	client.request(options, function (err, data) {
	    if (err) {
	        error('Error al obtener todos');
	    } else {
	    	var entities = data.entities;
	        success(entities);
	    }
	});
};

DB.prototype.save = function(entity, resolve, reject) {
	var that = this;
	console.log('Saving entity in the database.');
	entity.type = this.name;
	if (entity.email) {
		entity.email = utils.removePlusSymbol(entity.email);
	}
	client.createEntity(entity, function (err, data) {
	    if (err) {
	    	reject('Error saving entity.');
	    }
	    else {
	    	var newEntity = data._data;
	    	if (newEntity.email) {
	    		newEntity.email = utils.addPlusSymbol(newEntity.email);
	    	}
	    	that.cache.update(newEntity[that.id],newEntity);
	    	resolve(newEntity);
	    }
	});
};

DB.prototype.update = function(entity, resolve, reject) {
	var that = this;
	console.log("Updating entity in database...");
	var onExists = function(entityFound) {
		var options = {
			type: that.name,
			uuid: entityFound.uuid,
			getOnExist:true
		};
		client.createEntity(options, function (errorCreatingEntity, data) {
		    if (errorCreatingEntity) {
		        reject('Error al actualizar entidad.');
		    } else {
		    	data.set(entity);
		        data.save(function(err){
		        	if (err) {
		        		reject('Error al actualizar entidad.');
		        	}
		        	else {
		        		that.cache.update(entity[that.id], entity);
		        		resolve(entity);
		        	}
		        });
			}
		});
	};
	var onNotFound = function() {
		reject('Entity not found!');
	};
	this.get(entity[this.idProperty], onExists,onNotFound);
};

DB.prototype.remove = function(id) {

};

DB.prototype.doQuery = function(query,success,error) {
	var options = {
	  	method:'GET',
		endpoint: this.name,
		qs: {ql:query}
	};

	client.request(options, function(err, data) {
	    if (err){
	        error('Error ejecutnado consulta '+ query);
	    } else {
	        success(data.entities);
	    }
	});
};

// export the class
module.exports = DB;