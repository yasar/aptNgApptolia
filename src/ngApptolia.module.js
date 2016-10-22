/*global window */
;(function (angular) {
    'use strict';
    var dependencies = [];

    dependencies.push('ui.gravatar');
    dependencies.push('nvd3');

    /**
     * needed for `datepickerPopup.js`
     */
    dependencies.push('ui.bootstrap');

    /**
     * for image manager, to show images in lightbox
     */
    dependencies.push('bootstrapLightbox');

    /**
     * routing
     */
    dependencies.push('ngRoute');
    // dependencies.push('route-segment');
    // dependencies.push('view-segment');
    dependencies.push('ui.router');
    ///

    dependencies.push('angularScreenfull');
    dependencies.push('ae-datetimepicker');

    /**
     * angular-dialog-service
     */
    dependencies.push('dialogs.main');
    dependencies.push('ngSanitize');
    ///

    dependencies.push('NgSwitchery');

    /**
     * angular-marked
     */
    dependencies.push('hc.marked');


    dependencies.push('cfp.hotkeys');
    dependencies.push('isoCurrency');
    dependencies.push('sotos.crop-image');

    /**
     * uiCalendar and fullCalendar
     */
    dependencies.push('ui.calendar');


    dependencies.push('summernote');
    dependencies.push('gettext');

    /**
     * aptBuilder uses this for table overlay when loading
     */
    dependencies.push('bsLoadingOverlay');

    /**
     * the service to show the youtube-loader-alike bar on top of the page
     */
    dependencies.push('angular-loading-bar');

    dependencies.push('colorpicker.module');
    dependencies.push('smart-table');
    dependencies.push('restangular');
    dependencies.push('ngStorage');
    dependencies.push('angularMoment');
    dependencies.push('ng-mfb');
    dependencies.push('ui.select');

    ///

    dependencies.push('http-auth-interceptor');
    dependencies.push('ngAnimate');
    dependencies.push('chrisharrington.miniCalendar');


    ////////////////////////////////////////////////

    angular.module('ngApptolia', dependencies)
        .config([
            '$stateProvider', '$urlRouterProvider', 'aptTemplProvider',
            function ($stateProvider, $urlRouterProvider, aptTemplProvider) {

                $stateProvider
                    .state({
                        name         : 'main',
                        url          : '',
                        abstract     : true,
                        template     : '<!--aptLayout--><apt-layout />',
                        controller   : ['$timeout', '$window', function ($timeout, $window) {
                            $window.loading_screen.updateLoadingHtml('<p style="color: #fff;">Yükleme tamamlandı / Loading completed</p>', true);

                            $timeout(function () {
                                $window.loading_screen.finish();
                            }, 100);
                        }],
                        ncyBreadcrumb: {
                            label: aptTemplProvider.appConfig.name || 'Apptolia'
                        },
                        defaultChild : 'dashboard'
                    })
                    .state({
                        name    : 'main.page401',
                        url     : '/401',
                        template: '<div data-apt-special-page type="401"></div>'
                    })
                    .state({
                        name    : 'main.page403',
                        url     : '/403',
                        template: '<div data-apt-special-page type="403"></div>'
                    })
                    .state({
                        name    : 'main.page404',
                        url     : '/404',
                        template: '<div data-apt-special-page type="404"></div>'
                    })
                ;

                $urlRouterProvider.when('', '/dashboard');
                $urlRouterProvider.otherwise('/404');

            }
        ])
    ;

})(window.angular);