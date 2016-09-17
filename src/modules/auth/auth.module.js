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
                        /**
                         * if no access property is defined in the route
                         * then we dont need to perform any check.
                         * just cease the routine here.
                         */
                        else {
                            return;
                        }

                        next.access = _.defaults(next.access, {
                            loginRequired      : true,
                            permissions        : [],
                            permissionCheckType: enums.permissionCheckType.combinationRequired
                        });

                        authorised = authorization.authorize(next.access.loginRequired,
                            next.access.permissions,
                            next.access.permissionCheckType);

                        if (authorised === enums.authorised.loginRequired) {
                            routeChangeRequiredAfterLogin = true;
                            loginRedirectUrl              = next.originalPath;
                            event.preventDefault();
                            aptUtils.goto({url: loginRedirectUrl});
                        }

                        else if (authorised === enums.authorised.notAuthorised) {
                            console.log('Could not authorize against: ' + next.access.permissions);
                            // aptUtils.goto({segment: 'not_authorised'});
                            event.preventDefault();
                            aptUtils.goto({segment: 'main.page403'});
                        }
                    }
                });
            }]);


}(angular));