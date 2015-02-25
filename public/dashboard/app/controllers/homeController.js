'use strict';
app.controller('homeController', [
    '$scope', '$http', '$timeout', 'API_HOST', 'API_HOST_POLL_RATE', 'API_PLAYERS_ROUTE', function ($scope, $http, $timeout, API_HOST, API_HOST_POLL_RATE, API_PLAYERS_ROUTE) {

        $scope.players = [];

    var tick = function () {
        $http.get(API_HOST + API_PLAYERS_ROUTE).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                upsertPlayer(data[i]);
            };
            $timeout(tick, API_HOST_POLL_RATE);
        }).error(function (response, code, headers, config) {
            console.log('timedout');
            $timeout(tick, API_HOST_POLL_RATE);
        });
    };
        
    tick();

    function upsertPlayer(player) {
        var found = false;
        var breaky = false;
        var i = 0;

        var trimToLength = function (lestring, len) {
            if (lestring.length == len)
                return lestring;

            if (lestring.length > len) {
                var newstring = lestring.substring(0, len);
                return newstring;
            }
            return lestring;
        };

        player.name = trimToLength(player.name, 9);

        while (!breaky && $scope.players.length > 0) {
            if ($scope.players[i].id == player.id) {
                $scope.players[i].name = player.name;
                $scope.players[i].kills = player.kills;
                $scope.players[i].deaths = player.deaths;
                $scope.players[i].total_kills = player.total_kills;
                $scope.players[i].total_deaths = player.total_deaths;
                $scope.players[i].dead = player.dead;
                found = true;
                breaky = true;
            }
            i++;

            if (i == $scope.players.length)
                breaky = true;
        }

        if (!found) {
            $scope.players.push(player);
        }

    }

    $scope.orderfunc = function(player) {
        return player.total_kills / player.total_deaths;
    }

    $scope.filterfunc = function (player) {
        return !player.dead;
    }

}]);