/**
 * Created by yasar on 02.07.2016.
 */

/*global window */
;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('aptLoadingIndicator', [function(){
            var directiveObject = {
                template: '<div class="well-sm p-10 text-muted"><i class="spinner icon-spinner"></i> <span translate>please wait while loading</span>..</div>'
            };
            return directiveObject;
        }]);
})(window.angular);