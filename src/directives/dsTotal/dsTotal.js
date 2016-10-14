/**
 * Created by unal on 05.09.2016.
 */


;(function () {

    var path = 'apt/dsTotal';

    angular.module('ngApptolia').directive('aptDsTotal', Directive);

    function Directive() {
        return {
            restrict        : 'EA',
            controller      : Controller,
            bindToController: {
                dsData     : '=dsData',
                dsTotalConf: '<'
            },
            controllerAs    : 'vmDsTotal',
            templateUrl     : path + '/dsTotal.tpl.html'
        }
    }

    Controller.$inject = ['$scope'];

    function Controller($scope) {

        var vm = this;
        $scope.$watch('vmDsTotal.dsData', function (newVal, oldVal) {

            if (angular.isUndefined(newVal) || newVal === oldVal) {
                return;
            }
            calculate();
        }, true);

        function calculate() {
            vm.total = 0;
            angular.forEach(vm.dsData, function (row) {

                angular.forEach(vm.dsTotalConf.plus_columns, function (column) {
                    if (!_.has(row, column)) {
                        return;
                    }
                    vm.total += row[column] * 1;
                });

                angular.forEach(vm.dsTotalConf.minus_columns, function (column) {
                    if (!_.has(row, column)) {
                        return;
                    }
                    vm.total -= row[column] * 1;
                })

            })
        }

    }
})();