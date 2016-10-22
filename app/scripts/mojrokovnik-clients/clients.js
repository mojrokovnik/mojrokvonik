'use strict';

clientsCtrl.$inject = ['$scope', 'clients', 'cases', 'calendar', 'modalDialog'];
function clientsCtrl($scope, clients, cases, calendar, modalDialog) {
    $scope.clients = {};
    $scope.clientType = 'individuals';

    function updateClients() {
        $scope.clients[$scope.clientType] = clients.getClients($scope.clientType);

        if (!$scope.selected) {
            $scope.selected = _.first($scope.clients[$scope.clientType]);
        }

        updateAssets();
    }

    function updateAssets() {
        $scope.agenda = $scope.selected ? $scope.getAgenda($scope.selected.id) : [];
        $scope.cases = $scope.selected ? $scope.getCases($scope.selected.id) : [];
    }

    $scope.switchType = function (type) {
        delete $scope.selected;
        $scope.clientType = type;

        updateClients();
    };

    $scope.pickClient = function (client) {
        if (client) {
            $scope.selected = client;
        }
    };

    $scope.getCases = function (client) {
        return client ? cases.getCasesByClient($scope.clientType, client) : false;
    };

    $scope.getAgenda = function (client) {
        return client ? calendar.getCalendarsByClient($scope.clientType, client) : false;
    };

    $scope.addClient = function () {
        var params = {
            scope: $scope,
            templateUrl: 'assets/templates/clients-dialog.html'
        };

        $scope.editMode = false;
        delete $scope.client;

        var modal = modalDialog.showModal(params);

        $scope.save = function (client) {
            clients.add(client, $scope.clientType).then(function () {
                modal.close();
            });
        };

        $scope.cancel = function () {
            delete $scope.client;
            modal.close();
        };
    };

    $scope.editClient = function (client) {
        var params = {
            scope: $scope,
            templateUrl: 'assets/templates/clients-dialog.html'
        };

        $scope.editMode = true;
        $scope.client = client;

        var modal = modalDialog.showModal(params);

        $scope.save = function (client) {
            clients.update(client, $scope.clientType).then(function () {
                modal.close();
            });
        };

        $scope.close = function () {
            delete $scope.client;
            modal.close();
        };
    };

    $scope.removeClient = function (client) {
        clients.remove(client, $scope.clientType).then(function () {
            $scope.selected = _.first($scope.clients[$scope.clientType]);
        });
    };

    // Initialize clients
    updateClients();

    $scope.$on('client:legals:updated', updateClients);
    $scope.$on('client:individuals:updated', updateClients);
    $scope.$on('calendars:updated', updateAssets);
    $scope.$on('cases:updated', updateAssets);
}

clientsService.$inject = ['$rootScope', 'api'];
function clientsService($rootScope, api) {
    console.warn('Clients Service initialized');

    var self = this;

    this.clients = {
        individuals: [], legals: []
    };

    this.getClients = function (type) {
        var filteredList = _.where(self.clients[type], {active: 1});

        return _.sortBy(filteredList, 'id');
    };

    this.getClientById = function (type, id) {
        var list = self.getClients(type);

        var filteredList = _.filter(list, function (obj) {
            return obj.id === id;
        });

        return _.sortBy(filteredList, 'id');
    };

    this.fetch = function (type) {
        return api('clients/' + type).fetch().then(function (clients) {
            if (!clients) {
                return false;
            }

            self.clients[type] = clients;

            $rootScope.loading = false;
            $rootScope.$broadcast('client:' + type + ':updated');
        });
    };

    this.add = function (client, type) {
        return api('clients/' + type).add(client).then(function (res) {
            if (res.status !== 200) {
                return false;
            }

            self.clients[type].push(res.client);
            $rootScope.$broadcast('client:' + type + ':updated');
        });
    };

    this.update = function (client, type) {
        return api('clients/' + type).update(client).then(function (res) {
            if (res.status !== 200) {
                return false;
            }

            self.clients[type] = _.reject(self.clients[type], {id: client.id});
            self.clients[type].push(client);

            $rootScope.$broadcast('client:' + type + ':updated');
        });
    };

    this.remove = function (client, type) {
        return api('clients/' + type).delete(client).then(function (res) {
            if (res.status !== 200) {
                return false;
            }

            self.clients[type] = _.reject(self.clients[type], {id: client.id});

            $rootScope.$broadcast('client:' + type + ':updated');
        });
    };

    // Fetch clients on service initialization
    this.fetch('individuals');
    this.fetch('legals');
}

clientsSidenav.$inject = [];
function clientsSidenav() {
    return {
        controller: clientsCtrl
    };
}

clientsTemplate.$inject = [];
function clientsTemplate() {
    return {};
}

angular.module('mojrokovnik.clients', ['ngMaterial'])
        .service('clients', clientsService)
        .controller('clientsCtrl', clientsCtrl)
        .directive('clientsSidenav', clientsSidenav)
        .directive('clientsTemplate', clientsTemplate);
