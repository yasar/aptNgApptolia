/**
 * Created by unal on 03.12.2015.
 */


(function (angular) {
    'use strict';
    angular
        .module('ngApptolia')
        .filter('isEmptyObject', function () {
            var bar;
            return function (obj) {
                for (bar in obj) {
                    if (obj.hasOwnProperty(bar)) {
                        return false;
                    }
                }
                return true;
            };
        });
})(window.angular);