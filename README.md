# futbol5


## API

### Create match:
  POST 'api/partidos'  
  ```
  payload: {
    "liga":"hola",
    "nombre":"Nombre test",
    "cancha":"Cancha test",
    "fecha":"10/07/2015",
    "hora":"19",
    "precio":"70",
    "cantidadJugadores":"10"
  }
  ```
  Response: 200 Ok. Content: true

### Get Players Of a Match
	GET'api/partidos/<matchId>/jugadores'
	

### Set I am in a match
  POST '/partidos/<matchId>/jugadores'
payload: 
```
  {as: 'titular'}
```

### Set I maybe in a match
  POST '/partidos/<matchId>/jugadores'
payload: 
```
  {as: 'suplente'}
```
### Set I am not in a match
  POST '/partidos/<matchId>/jugadores'
payload: 
```
  {as: 'nojuega'}
```  
### Remove me from a match

	DELETE 'api/partidos/<matchId>/jugadores'
payload: 
```
  {user: 'nojuega'}
```  
	
### Get match
	
	GET 'api/partidos/<matchId>
  Response: 200 Ok. Content: 

```
  {
   "nombre":"Nombre test",
   "cancha":"Cancha test",
   "fecha":"10/07/2015",
   "hora":"19",
   "precio":"70",
   "liga":"hola",
   "jugadores":[],
   "suplentes":[],
   "nojuegan":[],
   "cantidadJugadores":"10",
   "code":"jqTHHQAWaRsXnoM0Jl1o"
  }
```

### Get Match Status For Player
	  GET api/partidos/<matchId>/voy
	  response: 200 Ok. Content: { as: <status>}
	  
	  where status can be: null, 'suplente', 'titular', 'nojuega'
	
### Login
  POST '/login'

payload:
```
  {
   "userId":"10154345018365203",
   "username":"Facundo Crego",
   "token":"CAAFd4GpZAugkBergtAcTmTAULFcB7MVB62pP7tCESQIGzoJSFX2mmZBA2ie0K4y7V",
   "loginType":"facebook"
  }
```

Response:
```
{"token":"CAAFd4GpZAugkBAMpM2GgfymCZBYUZBa7NdorNaMyXmZC94AV0crj2"}
```

### Logout
  POST '/logout'
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
