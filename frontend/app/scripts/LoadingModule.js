(function(window, angular, undefined) {'use strict';
/*

Example: 

  In the html use the directive 
    <loader></loader>
  where you want to display the alert message.


  In the controllers you should call LoaderManager.show() and LoaderManager.hide();


*/
angular.module('LoadingModule',[])
  .directive('loader', [ 'LoaderManager' , function (LoaderManager) {
    return {
      restrict: 'E',
      scope: {},
      template: 
        '<div id="loading" ng-show="loaders" style="height:100%; width:100%; position:absolute; top: 0px; left: 0px;'+
        'background-color: rgba(100,100,100,0.5); z-index: 10000;"> '+
        '<div style="text-align: center; margin-top: 25%; color: white; font-size: 22px; text-shadow: 4px 4px 7px rgba(150, 150, 150, 1);"><span><img src="images/loading.gif"></span> Loading...</div>'+
        '</div>',
      controller: ['$scope', 'LoaderManager', function($scope, LoaderManager) {
        
        $scope.loaders = 0;

        var update = function() {
            $scope.loaders = LoaderManager.loaders;
        };
        
        LoaderManager.registerObserverCallback(update);

      }],
      compile: function compile(tElement, tAttrs, transclude) {
        
        return function postLink(scope, iElement, iAttrs, controller) {
          
        }
      }
    };
  }])
  .service('LoaderManager', function () {

  this.loaders = 0;

  var observerCallbacks = [];

  var hasNotified = false;

  //register an observer
  this.registerObserverCallback = function(callback){
    observerCallbacks.push(callback);
    if (hasNotified) {
      callback();
    }
  };

  //call this when you know 'foo' has been changed
  var notifyObservers = function(){
    hasNotified = true;
    angular.forEach(observerCallbacks, function observersIteration(callback){
      callback();
    });
  };

  this.show = function () {
    this.loaders = this.loaders+1;
    notifyObservers();
  };

  this.hide = function () {
    if (this.loaders > 0) {
      this.loaders = this.loaders-1;
      notifyObservers();
    }
  };

  return this;
});

})(window, window.angular);