'use strict';

describe('Controller: NewmatchCtrl', function () {

  // load the controller's module
  beforeEach(module('startApp'));

  var NewmatchCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewmatchCtrl = $controller('NewmatchCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
