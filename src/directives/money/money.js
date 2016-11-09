/**
 * Created by yasar on 15.07.2016.
 */
(function (app) {

    app.directive('aptMoney', [function () {
        var directiveObject = {
            scope           : {
                amount          : '=ngModel',
                currency_id     : '=currencyId',
                selectedCurrency: '=?'
            },
            replace         : true,
            bindToController: true,
            templateUrl     : 'directives/money/money.tpl.html',
            link            : linkFn,
            controller      : controllerFn,
            controllerAs    : 'vmMoney'
        };

        return directiveObject;


        function linkFn(scope, elem, attrs) {

        }

    }]);

    controllerFn.$inject = ['$injector', '$scope'];
    function controllerFn($injector, $scope) {
        var vm              = this;
        var currencyService = $injector.get(currencyBuilder.getServiceName('service'));
        vm.currencies       = [];
        currencyService.getEnabledCurrencies().then(function (data) {
            vm.currencies = data;
        });

        vm.selectedCurrency = null;
        vm.selectedCurrencyItem   = function (value) {
            if (arguments.length) {
                vm.selectedCurrency = value;
                vm.currency_id      = vm.selectedCurrency.currency_id;
            } else {
                vm.selectedCurrency = _.find(vm.currencies, {currency_id: vm.currency_id});
                return vm.selectedCurrency;
            }
        };
    }
})(angular.module('ngApptolia'));