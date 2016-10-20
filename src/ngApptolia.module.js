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
            '$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $stateProvider
                    .state({
                        name      : 'main',
                        url       : '',
                        abstract  : true,
                        template  : '<div data-apt-layout></div>',
                        controller: ['$timeout', '$window', function ($timeout, $window) {
                            $window.loading_screen.updateLoadingHtml('<p style="color: #fff;">Yükleme tamamlandı / Loading completed</p>', true);

                            $timeout(function () {
                                $window.loading_screen.finish();
                            }, 2000);
                        }]
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

                // $routeSegmentProvider
                //     .when('/', 'main', {
                //         label     : 'Home',
                //         redirectTo: '/dashboard',
                //         access    : {
                //             loginRequired: true
                //         }
                //     })
                //     .when('/401', 'main.page401', {label: '401'})
                //     .when('/403', 'main.page403', {label: '403'})
                //     .when('/404', 'main.page404', {label: '404'})
                //
                //     .segment('main', {
                //         template  : '<div data-apt-layout></div>',
                //         controller: ['$timeout', '$window', function ($timeout, $window) {
                //             $window.loading_screen.updateLoadingHtml('<p style="color: #fff;">Yükleme tamamlandı / Loading completed</p>', true);
                //
                //             $timeout(function () {
                //                 $window.loading_screen.finish();
                //             }, 2000);
                //         }]
                //     })
                //     .within()
                //     /**
                //      * 401: unauthorized: usually response to login request from server
                //      * 403: forbidden: app level, decide if the content is permitted to show.
                //      * 404: not found: page not found
                //      */
                //     .segment('page401', {template: '<div data-apt-special-page type="401"></div>'})
                //     .segment('page403', {template: '<div data-apt-special-page type="403"></div>'})
                //     .segment('page404', {template: '<div data-apt-special-page type="404"></div>'})
                // ;

                // $routeProvider.otherwise({redirectTo: '/404'});
                $urlRouterProvider.otherwise('/404');

            }
        ])
    ;

})(window.angular);