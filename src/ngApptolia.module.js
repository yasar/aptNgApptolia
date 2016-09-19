/*global window */
(function (angular) {
    'use strict';
    angular.module('ngApptolia', [
        'ui.gravatar',
        'nvd3',
        /**
         * needed for `datepickerPopup.js`
         */
        'ui.bootstrap',
        /**
         * for image manager, to show images in lightbox
         */
        'bootstrapLightbox'
    ]);

})(window.angular);