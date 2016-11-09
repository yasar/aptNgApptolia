/**
 * Created by yasar on 12.08.2016.
 */

;(function (angular) {
    'use strict';
    angular
        .module('ngApptolia')
        .filter('startCase', function () {
            return function (input) {
                return (!!input) ? _.startCase(input) : '';
            }
        });
})(window.angular);