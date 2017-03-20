;(function (angular) {
    'use strict';
    
    angular.module('aptAuth', [])
    
           .run([
               '$rootScope',
               '$location',
               'aptAuthorizationService', 'aptAuthEnumService',
               '$timeout',
               'aptUtils',
               '$injector',
               function ($rootScope, $location, authorization, enums, $timeout, aptUtils, $injector) {
                   var UserService                   = $injector.get('UserService');
                   var User                          = UserService.getAuthUser();
                   var routeChangeRequiredAfterLogin = false,
                       loginRedirectUrl              = null;
            
                   $rootScope.$on('event:auth-loginRequired', function () {
                       if (User.is_authenticated) {
                           UserService.showLoginPopup();
                       }
                       else {
                           aptUtils.goto({segment: 'main.login'});
                       }
                   });
            
                   // $rootScope.$on('$routeChangeStart', function (event, next) {
                   $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
                       var authorised;
                       if (routeChangeRequiredAfterLogin && toState.url !== '/login') {
                           routeChangeRequiredAfterLogin = false;
                       }
                       else {
                           if (!_.has(toState, 'access')) {
                               return;
                           }
                    
                    
                           toState.access = _.defaults(toState.access, {
                               loginRequired      : true,
                               permissions        : [],
                               permissionCheckType: enums.permissionCheckType.combinationRequired
                           });
                    
                           authorised = authorization.authorize(toState.access.loginRequired,
                               toState.access.permissions,
                               toState.access.permissionCheckType);
                    
                           if (authorised === enums.authorised.loginRequired) {
                               routeChangeRequiredAfterLogin = true;
                               loginRedirectUrl              = fromState.url;
                               event.preventDefault();
                               aptUtils.goto({url: loginRedirectUrl});
                           }
                    
                           else if (authorised === enums.authorised.notAuthorised) {
                               console.log('Could not authorize against: ' + toState.access.permissions);
                               event.preventDefault();
                               aptUtils.goto({segment: 'main.page403'});
                           }
                       }
                   });
               }
           ]);
    
    
}(angular));