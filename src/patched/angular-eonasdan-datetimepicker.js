(function () {
    'use strict';

    var module = angular.module('ae-datetimepicker', []);

    module.directive('datetimepicker', [
        '$timeout',
        function ($timeout) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    options: '=?',
                    onChange: '&?',
                    onClick: '&?'
                },
                link: function ($scope, $element, $attrs, ngModel) {
                    var dpElement = $element.parent().hasClass('input-group') ? $element.parent() : $element;

                    $scope.$watch('options', function (newValue) {
                        var dtp = dpElement.data('DateTimePicker');
                        $.map(newValue, function (value, key) {
                            dtp[key](value);
                        });
                    });

                    dpElement.on('dp.change', function (e) {
                        $timeout(function () {
                            if (e.date !== 'undefined') {
                                $scope.$apply(function () {
                                    ngModel.$setViewValue(e.date);
                                });
                                if (typeof $scope.onChange === 'function') {
                                    $scope.onChange();
                                }
                            }
                        });
                    });

                    dpElement.on('click', function () {
                        $timeout(function () {
                            if (typeof $scope.onClick === 'function') {
                                $scope.onClick();
                            }
                        });
                    });

                    dpElement.datetimepicker($scope.options);

                    $timeout(function () {
                        ngModel.$render = function () {
                            if (!!ngModel.$viewValue) {
                                // dpElement.data('DateTimePicker').date(ngModel.$viewValue);
                                dpElement.data('DateTimePicker').date(ngModel.$modelValue);
                            } else {
                                dpElement.data('DateTimePicker').date(null);
                            }
                        };

                        if (!!ngModel.$viewValue) {
                            if (!moment.isMoment(ngModel.$viewValue)) {
                                ngModel.$setViewValue(moment(ngModel.$modelValue));
                            }
                            dpElement.data('DateTimePicker').date(ngModel.$viewValue);
                        }
                    });
                }
            };
        }
    ]);
})();