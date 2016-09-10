/*global window */
(function (angular) {
    'use strict';
    angular
    .module('ngApptolia')
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i < total; ++i) {
                input.push(i);
            }
            return input;
        };
    });
})(window.angular);