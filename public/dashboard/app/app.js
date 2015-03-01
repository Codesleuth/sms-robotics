var app = angular.module('SmsRoboticsDash', ['ngRoute', 'ngAnimate', 'configuration']);

app.config(function ($routeProvider) {

    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "app/views/home.html"
    });

    $routeProvider.otherwise({ redirectTo: "/home" });

});