/**
 * Created by yasar on 17.12.2015.
 */

/*global window */

/**
 * Check sidebar and template relation for a good case of use.
 * here is the code sample
 *
 *
 * <sample>
 * // note the last parameter ($scope.$id)
 * Templ.addSlot('sidebarLeft', 'Categories', '<table apt-menu-builder menu-type="pages-table" ng-model="insideMenu" class="table table-sm" btn-size="xs" config="insideMenuConfig"> </table>', $scope.$id);
 *
 * // $scope.$id from above statement is injected below as slot._scopeId
 * <apt-sidebar-slot data-ng-repeat="slot in vm.slots">
 * <apt-sidebar-slot-title bind-html-compile="slot.title">title</apt-sidebar-slot-title>
 * <apt-sidebar-slot-body bind-html-compile="slot.body" bind-html-compile-scope-id="slot._scopeId">body</apt-sidebar-slot-body>
 * </apt-sidebar-slot>
 * </sample>
 */
;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('bindHtmlCompile', ['$compile', 'aptUtils',
            function ($compile, aptUtils) {
                return {
                    restrict: 'A',
                    link    : function (scope, element, attrs) {
                        scope.$watch(function () {
                            return scope.$eval(attrs.bindHtmlCompile);
                            // return scope.$eval(attrs.bindHtmlCompile);
                        }, function (value) {
                            var targetScope;

                            if (attrs.bindHtmlCompileScope) {
                                targetScope = scope.$eval(attrs.bindHtmlCompileScope);
                            }

                            else if (attrs.bindHtmlCompileScopeId) {
                                targetScope = aptUtils.getScopeById(scope.$eval(attrs.bindHtmlCompileScopeId));
                            }

                            if (!targetScope) {
                                targetScope = scope;
                            }

                            element.html(value && value.toString());

                            $compile(element.contents())(targetScope);
                        });
                    }
                };
            }]);
})(window.angular);