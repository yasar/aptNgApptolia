(function (angular) {
    'use strict';

    angular.module('aptAuth')
        .directive('access', [
            'aptAuthorizationService', 'aptAuthEnumService',
            function (authorization, enums) {
                return {
                    restrict: 'A',
                    link    : function (scope, element, attrs) {
                        console.warn('the directive `access` is called');
                        return;
                        var makeVisible         = function () {
                            element.removeClass('hidden');
                        };
                        var makeHidden          = function () {
                            element.addClass('hidden');
                        };
                        var determineVisibility = function (resetFirst) {
                            var result;
                            if (resetFirst) {
                                makeVisible();
                            }

                            result = authorization.authorize(true, roles, attrs.accessPermissionType);
                            if (result === enums.authorised.authorised) {
                                makeVisible();
                            } else {
                                makeHidden();
                            }
                        };
                        var roles               = attrs.access.split(',');


                        if (roles.length > 0) {
                            determineVisibility(true);
                        }
                    }
                };
            }]);
}(angular));