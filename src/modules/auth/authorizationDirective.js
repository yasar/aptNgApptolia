(function (angular) {
    'use strict';

    angular.module('aptAuth')
        .directive('access', [
            'aptAuthorizationService', 'aptAuthEnumService',
            function (authorization, enums) {
                return {
                    restrict: 'A',
                    link    : function (scope, element, attrs) {
                        // console.warn('the directive `access` is called');
                        // return;
                        var makeVisible  = function () {
                            element.removeClass('hidden');
                        };
                        var makeHidden   = function () {
                            element.addClass('hidden');
                        };
                        var makeDisabled = function () {

                        };
                        var process      = function (resetFirst) {
                            var result;
                            // result = authorization.authorize(true, roles, attrs.accessPermissionType);
                            result = authorization.isAuthorized(roles, attrs.accessPermissionType);

                            // if (resetFirst) {
                            //     makeVisible();
                            // }
                            // if (result === enums.authorised.authorised) {
                            //     makeVisible();
                            // } else {
                            //     makeHidden();
                            // }

                            // if (result !== enums.authorised.authorised) {
                            if (!result) {
                                element.prop({disabled: true});
                                element.attr({disabled: true});
                                // element.css('pointer-events', 'none');
                                element.css({
                                    'pointer-events': 'none',
                                    'outline'       : '1px dotted #f00',
                                    'outline-offset': '2px',
                                    'display'       : 'block'
                                });
                                element.off();
                                var title = attrs.title ? ' (' + attrs.title + ')' : '';
                                element.attr('title', 'You do not have enough privileges to access to this element.' + title);
                            }
                        };
                        var roles        = attrs.access.split(',');


                        if (roles.length > 0) {
                            process(true);
                        }
                    }
                };
            }]);
}(angular));