/**
 * Created by yasar on 05.04.2016.
 */

/*global window */

;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('proxy', ['$injector', function ($injector) {
            return {
                restrict: 'A',
                compile : function (element, attrs) {
                    var $templateCache = $injector.get('$templateCache');
                    var $compile       = $injector.get('$compile');
                    var templateString = $templateCache.get(attrs.proxy);

                    return link;

                    function link(scope, element) {
                        var replacement = $compile(templateString)(scope);
                        element.replaceWith(replacement);
                    }
                }
            };
        }]);
})(window.angular);