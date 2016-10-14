/**
 * Created by yasar on 08.05.2015.
 */
;(function (angular) {
    'use strict';

    angular.module('aptAuth')
        .provider('aptAuthEnumService', [function () {

            this.authorised = {
                authorised   : 0,
                loginRequired: 1,
                notAuthorised: 2
            };

            this.permissionCheckType = {
                atLeastOne         : 0,
                combinationRequired: 1
            };

            this.right = {
                access: 'access',
                create: 'write',
                read  : 'read',
                update: 'update',
                delete: 'delete'
            };

            this.$get = function () {
                return {
                    authorised         : this.authorised,
                    permissionCheckType: this.permissionCheckType,
                    right              : this.right
                };
            };
        }])
    ;
}(angular));