'use strict';

mojrokovnikAuth.$inject = ['$cookies', 'api'];
function mojrokovnikAuth($cookies, api) {
    this.getActiveUser = function () {
        return api('user').fetch();
    };

    this.isLoggedIn = function () {
        return !!$cookies.getObject('token');
    };
}

angular.module('mojrokovnik', [
    'ngRoute',
    'ngCookies',
    'pascalprecht.translate',
    'mojrokovnik.api',
    'mojrokovnik.login',
    'mojrokovnik.navigation',
    'mojrokovnik.notify',
    'mojrokovnik.translate',
    'mojrokovnik.ui',
    'mojrokovnik.clients',
    'mojrokovnik.calendar',
    'mojrokovnik.cases'
])

.service('authentification', mojrokovnikAuth)

.config(['$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('');

        $routeProvider.otherwise({redirectTo: '/client'});

        $routeProvider.when('/login', {
            templateUrl: 'assets/templates/login.html'
        });
        $routeProvider.when('/clients', {
            templateUrl: 'assets/templates/clients.html'
        });
        $routeProvider.when('/cases', {
            templateUrl: 'assets/templates/cases.html'
        });
        $routeProvider.when('/calendar', {
            templateUrl: 'assets/templates/calendar.html'
        });
    }
])

.run(function ($rootScope, $location, authentification) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
        if (!authentification.isLoggedIn()) {
            $location.url('/login');
        }
    });
});