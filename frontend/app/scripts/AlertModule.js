(function(window, angular, undefined) {'use strict';
/*

Example: 

  In the html use the directive 
    <alert></alert>
  where you want to display the alert message.


  In the controllers you should call AlertMessage.show("Message", AlertManager.INFO, 5)

  The arguments are:
    1) String: The message to display
    2) Type: Type of message. Possible values:
          AlertManager.INFO
          AlertManager.ERROR
          AlertManager.WARNING
    3) Seconds: The time that the alert will be displayed

  When the user moves the mouse over the alert, it will stop de fade and will be visible until the user close it manually

*/
angular.module('AlertModule',[])
  .directive('alertnotification', [ 'AlertManager' , function (AlertManager) {
    return {
      restrict: 'E',
      scope: {},
      template: 
        '<div ng-show="opacity != 0" class="alert alert-dismissable {{alertClass}}" ng-mouseover="stopFade()" ng-class="{\'alert-danger\': alertError, \'alert-warning\': alertWarning, \'alert-success\': alertInfo}" style="opacity: {{opacity}}">'+
        '  <button type="button" ng-show="opacity != 0" class="close" ng-click="close()" aria-hidden="true">&times;</button>'+
         ' <strong>{{title}}</strong> {{message}}'+
        '</div>',
      controller: ['$scope', 'AlertManager', function($scope, AlertManager) {
        
        $scope.opacity = 0;

        var updateAlert = function() {
          $scope.type = AlertManager.getType();
          $scope.message = AlertManager.getMessage();
          $scope.opacity = AlertManager.getOpacity();
          $scope.alertError = $scope.type == AlertManager.ERROR ? "alert-danger" : null;
          $scope.alertWarning = $scope.type == AlertManager.WARNING ? "alert-warning" : null;
          $scope.alertInfo = $scope.type == AlertManager.INFO ? "alert-success" : null;

          $scope.title = ($scope.type == AlertManager.ERROR) ? "Error:" : null;
          if (!$scope.title) {
            $scope.title = ($scope.type == AlertManager.WARNING) ? "Warning:" : null;
          }
          if (!$scope.title) {
            $scope.title = ($scope.type == AlertManager.INFO) ? "" : "";
          }
            
        };
        
        AlertManager.registerObserverCallback(updateAlert);

        $scope.stopFade = function() {
          AlertManager.stopFade();
        };

        $scope.close = function() {
          AlertManager.hide();
        };

      }],
      compile: function compile(tElement, tAttrs, transclude) {
        $(tElement).css({
          position : 'fixed',
          top: '10px',
          width:'50%',
          left: '25%',
          'z-index': 5000
        });
        return function postLink(scope, iElement, iAttrs, controller) {
          
        }
      }
    };
  }])
  .service('AlertManager', [ '$timeout', '$interval', function ($timeout, $interval) {

  this.ERROR = 'e';
  this.WARNING = 'w';
  this.INFO = 'i';

  var message = null;
  var type = null;
  var beingDisplayed = false;
  var fadeStopped = false;
  var opacity = 0;
  var fadecount = 0;
  var fading;

  var observerCallbacks = [];

  //register an observer
  this.registerObserverCallback = function(callback){
    observerCallbacks.push(callback);
  };

  //call this when you know 'foo' has been changed
  var notifyObservers = function(){
    angular.forEach(observerCallbacks, function observersIteration(callback){
      callback();
    });
  };

  this.show = function (msg, newType, seconds) {
    //this.stopFade();
    if (!angular.isString(msg)) {
      throw "AlertModule: Message expected to be String";
    }
    /*if (beingDisplayed) {
      message+=" - "+msg;
    }
    else {
      message = msg;  
    }*/
    message = msg;  
    beingDisplayed = true;
    if (!(newType == this.ERROR || newType== this.WARNING || newType == this.INFO)){
      throw "AlertModule: Type error should be 'e', 'w' or 'i'";
    }
    type = newType;
    if (seconds && (!angular.isNumber(seconds) || seconds < 0 ))  {
      throw "AlertModule: The seconds must be a positive number"
    }
    seconds = seconds || 5;
    var _this = this;
    $timeout(function(){
      if (!fadeStopped) {
        _this.hide();
      }
    },seconds*1000+101);
    $timeout(function(){//Starts fading
      if (!fadeStopped) {
        fading = $interval(function fadingInterval(){
          fadeStopped = false;
          var total = seconds*1000/2;
          fadecount+=100;
          opacity =  1 -  ( fadecount / total);
          if (opacity < 0) {
            opacity = 0;  
          }
          notifyObservers();
        }, 100, (seconds*500)/100);
      }
    },(seconds*1000)/2);

    if (angular.isDefined(fading) && beingDisplayed) {
      $interval.cancel(fading);
      fading = undefined;
    }
    fadecount=0;
    opacity = 1;
    notifyObservers();
  };

  this.stopFade = function() {
    if (angular.isDefined(fading) && beingDisplayed) {
        $interval.cancel(fading);
        fading = undefined;
      }
    fadeStopped = true;
    fadecount=0;
    opacity = 1;
    notifyObservers();
  };

  this.hide = function () {
    message = null;
    type = null;
    opacity = 0;
    beingDisplayed = false;
    notifyObservers();
  };

  this.getMessage = function() {
    return message;
  };

  this.getType = function() {
    return type;
  };

  this.getOpacity = function() {
    return opacity;
  };

  return this;
}]);

})(window, window.angular);