'use strict';

mrLogin.$inject = [];
function mrLogin() {
    return {
        controller: mrLoginCtrl,
        link: function (scope, elem, attr, ctrl) {
            elem.find('.toggle').on('click', function () {
                elem.find('.container').stop().addClass('active');
            });

            elem.find('.close').on('click', function () {
                elem.find('.container').stop().removeClass('active');
            });
        }
    };
}

mrLoginCtrl.$inject = ['$location', '$scope', '$cookies', 'api', 'authentification'];
function mrLoginCtrl($location, $scope, $cookies, api, authentification) {
    $scope.login = function () {
        $scope.isLoading = true;
        delete $scope.errorMsg;

        api().login($scope.username, $scope.password).then(function (response) {
            if (response && response.status >= 400 && response.status < 500) {
                $scope.isLoading = false;

                if (response.status === 400) {
                    $scope.errorMsg = 'Wrong credentials!';
                }

                if (response.status === 408) {
                    $scope.errorMsg = 'Request Timeout!';
                }

                return false;
            }

            $scope.isLoading = false;
            $location.url('/clients');
            authentification.getActiveUser().then(function (user) {
                $cookies.putObject('user', user);
            });
        });
    };
}

angular.module('mojrokovnik.login', [])
        .directive('mrLogin', mrLogin)
        .controller('mrLoginCtrl', mrLoginCtrl);