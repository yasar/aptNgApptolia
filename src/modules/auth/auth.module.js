(function (angular) {
    'use strict';

    angular.module('aptAuth', [
            'ngRoute'
        ])

        .run([
            '$rootScope',
            '$location',
            '$routeSegment',
            'aptAuthorizationService', 'aptAuthEnumService',
            '$timeout',
            'aptUtils',
            'UserService',
            function ($rootScope, $location, $routeSegment, authorization, enums, $timeout, aptUtils, UserService) {
                var User                          = UserService.getAuthUser();
                var routeChangeRequiredAfterLogin = false,
                    loginRedirectUrl              = null;

                $rootScope.$on('event:auth-loginRequired', function () {
                    if (User.is_authenticated) {
                        UserService.showLoginPopup();
                    } else {
                        aptUtils.goto({segment: 'main.login'});
                    }
                });

                $rootScope.$on('$routeChangeStart', function (event, next) {
                    var authorised;
                    if (routeChangeRequiredAfterLogin && next.originalPath !== '/login') {
                        routeChangeRequiredAfterLogin = false;
                        /**
                         * todo
                         * commenting out the following line fixes the issue in which
                         * after logging in, dashboard will route back to login page.
                         * so keep it commented-out until we ensure it is safe to remove.
                         */
                        //aptUtils.goto({url: loginRedirectUrl});
                    }
                    else {
                        if (next.$$route.hasOwnProperty('access')) {
                            next.access = next.$$route.access;
                        }

                        if (!next.hasOwnProperty('access')) {
                            next.access = {
                                loginRequired: true
                            };
                        } else if (!next.access.hasOwnProperty('loginRequired')) {
                            next.access.loginRequired = true;
                        }

                        authorised = authorization.authorize(next.access.loginRequired,
                            next.access.permissions,
                            next.access.permissionCheckType);

                        if (authorised === enums.authorised.loginRequired) {
                            routeChangeRequiredAfterLogin = true;
                            loginRedirectUrl              = next.originalPath;
                            //aptUtils.goto({segment: 'login'});
                            aptUtils.goto({url: loginRedirectUrl});
                        }

                        else if (authorised === enums.authorised.notAuthorised) {
                            console.log('Could not authorize against: ' + next.access.permissions);
                            aptUtils.goto({segment: 'not_authorised'});
                        }
                    }
                });
            }]);


}(angular));