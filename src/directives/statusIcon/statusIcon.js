/**
 * Created by yasar on 02.07.2016.
 */

/*global window */
;(function (angular) {
    'use strict';
    var path = 'directives/statusIcon';
    angular.module('ngApptolia')
        .directive('aptStatusIcon', [function () {
            var directiveObject = {
                scope      : {
                    status: '<'
                },
                templateUrl: path + '/statusIcon.tpl.html'
            };
            return directiveObject;
        }]);
})(window.angular);