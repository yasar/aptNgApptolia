/**
 * Created by unal on 29.06.2015.
 */


angular.module('ngApptolia')
    .directive('pageSelect', function() {
        return {
            restrict: 'E',
            template: '<input type="number" min="1" max="{{numPages}}" class="select-page" ng-model="inputPage" ng-change="selectPage(inputPage)">',
            link: function(scope, element, attrs) {
                scope.$watch('currentPage', function(c) {
                    scope.inputPage = c;
                });
            }
        };
    });
