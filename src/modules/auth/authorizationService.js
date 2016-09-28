(function (angular) {
    'use strict';

    angular.module('aptAuth')
        .factory('aptAuthorizationService', [
            'aptAuthEnumService', 'UserService',
            function (enums, UserService) {
                var User      = UserService.getAuthUser();
                var authorize = function (loginRequired, requiredPermissions, permissionCheckType) {
                    var result             = enums.authorised.authorised,
                        loweredPermissions = [],
                        hasPermission      = true,
                        permission, i;

                    permissionCheckType = permissionCheckType || enums.permissionCheckType.atLeastOne;
                    if (loginRequired === true && User.is_authenticated === false) {
                        result = enums.authorised.loginRequired;
                    } else if ((loginRequired === true && User.is_authenticated === true) &&
                               (requiredPermissions === undefined || requiredPermissions.length === 0)) {
                        // Login is required but no specific permissions are specified.
                        result = enums.authorised.authorised;
                    } else if (loginRequired === true && User.is_authenticated === true && User.user.login === 'superuser') {
                        // superuser should not have any restriction
                        result = enums.authorised.authorised;
                    } else if (requiredPermissions) {
                        loweredPermissions = [];
                        angular.forEach(User.permissions, function (permission) {
                            loweredPermissions.push(permission.toLowerCase());
                        });

                        for (i = 0; i < requiredPermissions.length; i += 1) {
                            permission = requiredPermissions[i].toLowerCase();

                            if (permissionCheckType === enums.permissionCheckType.combinationRequired) {
                                hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                                // if all the permissions are required and hasPermission is false there is no point carrying on
                                if (hasPermission === false) {
                                    break;
                                }
                            } else if (permissionCheckType === enums.permissionCheckType.atLeastOne) {
                                hasPermission = loweredPermissions.indexOf(permission) > -1;
                                // if we only need one of the permissions and we have it there is no point carrying on
                                if (hasPermission) {
                                    break;
                                }
                            }
                        }

                        result = hasPermission ? enums.authorised.authorised : enums.authorised.notAuthorised;
                    }

                    return result;
                };
                // var isAuthorized = function (loginRequired, requiredPermissions, permissionCheckType) {
                //     return authorize(loginRequired, requiredPermissions, permissionCheckType) == enums.authorised.authorised;
                // };
                var isAuthorized = function (requiredPermissions, permissionCheckType) {
                    permissionCheckType = permissionCheckType || enums.permissionCheckType.combinationRequired;
                    var result          = authorize(true, requiredPermissions, permissionCheckType) == enums.authorised.authorised;

                    if (!result) {
                        console.warn('Authorization is failed for: ' + requiredPermissions.toString());
                    }
                    return result;
                };


                return {
                    authorize   : authorize,
                    isAuthorized: isAuthorized
                };
            }]);
}(angular));