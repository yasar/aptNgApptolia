/**
 * Created by yasar on 12.08.2016.
 */

;(function (angular) {
    'use strict';
    angular
        .module('ngApptolia')
        .filter('capitalize', function () {
            return function (input) {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            }
        });
})(window.angular);