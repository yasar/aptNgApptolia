/**
 * Created by yasar on 20.02.2016.
 */

(function () {
    /**
     * this is used within datatable to show the record counts in the header section.
     */
    angular.module('ngApptolia').directive('stSummary', function () {
        return {
            restrict: 'AE',
            require : '^stTable',
            template: '{{size}}',
            scope   : {},
            link    : function (scope, element, attr, ctrl) {
                scope.$watch(ctrl.getFilteredCollection, function (val) {
                    scope.size = (val || []).length;
                })
            }
        }
    });

})();