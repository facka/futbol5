'use strict';

angular.module('futbol5')
  .service('AuthService', ['ApiService', 'Facebook', '$cookieStore', '$rootScope', function(ApiService, Facebook, $cookieStore, $rootScope) {

    var that = this;

    this.user = {
        id: '',
        name: '',
        picture: '',
        token: '',
        loggedIn: null
    };

    this.loginWithAPI = function loginWithAPI(authType, token, success, error) {
        var self = this;
        this.getUserInfo(authType, function(user) {
            ApiService.login({
                userId : user.id,
                username: user.name,
                token: token,
                loginType: authType
            }).then(function(response){
                $cookieStore.put('userType', authType);
                self.user.id = user.id;
                self.user.name = user.name;
                self.user.token = response.data.token;
                self.user.picture = user.picture;
                self.user.loggedIn = true;
                ApiService.setToken(response.data.token);
                success(self.user);
            }, error);
        });
    };

    this.login = function login(authType, success, error) {
        var self = this;
        if (authType === 'facebook') {
            Facebook.login(function(response) {
                if(response.status === 'connected') {
                    self.loginWithAPI(authType, response.authResponse.accessToken, success, error);
                }
            });
        }
        else {
            error();
        }
    };

    this.getUserInfo = function getUserInfo(authType, success, error) {
        if (authType === 'facebook') {
            Facebook.api('/me', function(fbUser) {
                var user = {
                    id: fbUser.id,
                    name: fbUser.name
                };
                Facebook.api('/me/picture', function(picture) {
                    user.picture = picture.data.url;
                    success(user);
                });
            }, error);
        }
    };

    this.getLoginStatus = function getLoginStatus(authType, isLogged, notLogged) {
        var self = this;
        authType = authType || $cookieStore.get('userType');
        if (authType === 'facebook') {
            Facebook.getLoginStatus(function(response) {
                if(response.status === 'connected') {
                    self.loginWithAPI(authType, response.authResponse.accessToken, function(user) {
                        self.user.loggedIn = true;
                        self.getUserInfo('facebook', function() {
                          isLogged(user);
                        });
                    }, function() {
                        self.user.loggedIn = false;
                        notLogged();
                    });
                } else {
                  self.user.loggedIn = false;
                  notLogged();
                }
            }, function() {
                self.user.loggedIn = false;
                notLogged();
            });
        }
        else {
            self.user.loggedIn = false;
            notLogged();
        }
    };

    this.logout = function logout(success) {
        var self = this;
         ApiService.logout().then(function() {
            $cookieStore.remove('userType');
            self.user.loggedIn = false;
            if (success) {
                success();
            }
        });
    };


  }]);
