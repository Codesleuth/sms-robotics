var app = angular.module('sms-robotics', ['restangular', 'ngRoute']);

app.config(function ($routeProvider, RestangularProvider) {
  $routeProvider
    .when('/', { controller: ListCtrl, templateUrl: 'players.html' })
    .when('/new', { controller: CreateCtrl, templateUrl: 'new.html' })
    .otherwise({ redirectTo:'/' });

    RestangularProvider.setBaseUrl('/api');
});


function ListCtrl($scope, Restangular) {
   $scope.players = Restangular.all("players").getList().$object;
}

function CreateCtrl($scope, $location, Restangular) {
  $scope.save = function() {
    Restangular
      .all('players')
      .post($scope.player)
      .then(function (player) {
        $location.path('/list');
      });
  }
}