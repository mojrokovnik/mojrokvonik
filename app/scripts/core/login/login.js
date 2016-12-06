'use strict';

mrLogin.$inject = [];
function mrLogin() {
    return {
        controller: mrLoginRegisterCtrl,
        templateUrl: 'assets/templates/login.html',
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

mrLoginRegisterCtrl.$inject = ['$location', '$scope', '$rootScope', '$cookies', 'api', 'authentification'];
function mrLoginRegisterCtrl($location, $scope, $rootScope, $cookies, api, authentification) {
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

            authentification.getActiveUser().then(function (user) {
                $scope.isLoading = false;

                if (!user)
                    return $scope.errorMsg = 'User is not activated!';

                $cookies.putObject('user', user);

                delete $rootScope.loginPage;

                return $location.url('/clients');
            });
        });
    };

    $scope.register = function () {
        $scope.isLoading = true;
        delete $scope.errorMsg;

        var params = {
            username: $scope.register.username,
            email: $scope.register.email,
            password: $scope.register.password
        };

        api().register(params).then(function () {
            $scope.isLoading = false;
            $scope.confirmationLink = true;
        });
    };
}

angular.module('mojrokovnik.login', [])
        .directive('mrLogin', mrLogin)
        .controller('mrLoginRegisterCtrl', mrLoginRegisterCtrl);