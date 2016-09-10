/*global window */
(function (angular) {
    'use strict';
    angular.module('ngApptolia', [
        'ui.gravatar',
        'nvd3',
        /**
         * needed for `datepickerPopup.js`
         */
        'ui.bootstrap'
    ]);

})(window.angular);