function setConfiguration(angular, api, apiPollRate, playersRoute) {
    angular.module('configuration', [])
        .constant('API_HOST', api)
        .constant('API_HOST_POLL_RATE', apiPollRate)
        .constant('API_PLAYERS_ROUTE', playersRoute);
}
