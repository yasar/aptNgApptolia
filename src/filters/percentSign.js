/**
 * Created by yasar on 12.08.2016.
 */

(function (angular) {
    'use strict';
    angular
        .module('ngApptolia')
        .filter('percentSign', function () {
            return function (number) {
                if (!number) {
                    return number;
                }
                return (number / 100).toLocaleString('tr-TR', {
                    style                   : 'percent',
                    maximumFractionDigits   : 1,
                    minimumIntegerDigits    : 1,
                    useGrouping             : false,
                    maximumSignificantDigits: 4
                })
            };
        });
})(window.angular);