/**
 * Created by yasar on 05.04.2016.
 */

/*global window */

;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('includeReplace', function () {
            return {
                require: 'ngInclude',
                restrict: 'A',
                compile: function (tElement, tAttrs) {
                    tElement.replaceWith(tElement.children());
                    return {
                        post : angular.noop
                    };
                }
            };
        });
})(window.angular);