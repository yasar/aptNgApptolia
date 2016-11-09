/**
 * Created by unal on 05.09.2016.
 */


;(function () {

    var path = 'apt/dsColumnsTotal';

    angular.module('ngApptolia').directive('aptDsColumnsTotal', Directive);

    function Directive() {
        return {
            restrict        : 'EA',
            controller      : Controller,
            bindToController: {
                dsData : '=dsData',
                columns: '<'
            },
            controllerAs    : 'vmDsColumnsTotal',
            //templateUrl     : path + '/dsColumnsTotal.tpl.html'
        }
    }

    Controller.$inject = ['$scope'];

    function Controller($scope) {

        var vm = this;
        $scope.$watch('vmDsColumnsTotal.dsData', function (newVal, oldVal) {

            if (angular.isUndefined(newVal) || newVal === oldVal) {
                return;
            }
            calculateColumns();
        }, true);

        function calculateColumns() {
            vm.columnsTotal = {};

            setColumns();
            angular.forEach(vm.dsData, function (row) {

                angular.forEach(vm.columns.columns, function (column) {
                    if (!_.has(row, column)) {
                        return;
                    }
                    vm.columnsTotal[column]+=row[column]*1;
                });

            })
        }

        function setColumns(){
            angular.forEach(vm.columns.columns, function (column) {

                vm.columnsTotal[column]=0;
            });
        }


    }
})();