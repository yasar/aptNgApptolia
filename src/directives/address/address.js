/**
 * Created by yasar on 25.12.2015.
 */

(function () {
    angular.module('ngApptolia').directive('aptAddress', fn);
    function fn() {
        return {
            restrict   : 'E',
            replace    : true,
            scope      : {
                modelBase: '='
            },
            templateUrl: 'directives/address/address.tpl.html'
        };
    }
})();