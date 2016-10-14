/*global window */
;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('datepickerLocaldate', ['$parse', function ($parse) {
            var directive = {
                restrict: 'A',
                require : ['ngModel'],
                link    : link
            };
            return directive;

            function link(scope, element, attr, ctrls) {
                var ngModelController = ctrls[0];

                // called with a JavaScript Date object when picked from the datepicker
                ngModelController.$parsers.push(function (viewValue) {
                    if (!viewValue) {
                        return undefined;
                    }
                    // undo the timezone adjustment we did during the formatting
                    viewValue.setMinutes(viewValue.getMinutes() - viewValue.getTimezoneOffset());
                    // we just want a local date in ISO format
                    return viewValue.toISOString().substring(0, 10);
                });

                // called with a 'yyyy-mm-dd' string to format
                ngModelController.$formatters.push(function (modelValue) {
                    if (!modelValue) {
                        return undefined;
                    }
                    var dt = null;
                    if (moment.isMoment(modelValue)) {
                        dt = modelValue.toDate();
                    } else {
                        // date constructor will apply timezone deviations from UTC (i.e. if locale is behind UTC 'dt' will be one day behind)
                        dt = new Date(modelValue);
                    }
                    // 'undo' the timezone offset again (so we end up on the original date again)
                    dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
                    return dt;
                });
            }
        }]);
})(window.angular);