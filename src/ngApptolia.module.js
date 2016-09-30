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
        'bootstrapLightbox',

        /**
         * routing
         */
        'ngRoute', 'route-segment', 'view-segment',

        'angularScreenfull'
    ])
        .config([
            '$routeSegmentProvider',
            '$routeProvider',
            function ($routeSegmentProvider, $routeProvider) {


                $routeSegmentProvider
                    .when('/', 'main', {
                        label     : 'Home',
                        redirectTo: '/dashboard',
                        access    : {
                            loginRequired: true
                        }
                    })
                    .when('/401', 'main.page401', {label: '401'})
                    .when('/403', 'main.page403', {label: '403'})
                    .when('/404', 'main.page404', {label: '404'})

                    .segment('main', {
                        template  : '<div data-apt-layout></div>',
                        controller: ['$timeout', '$window', function ($timeout, $window) {
                            $window.loading_screen.updateLoadingHtml('<p style="color: #fff;">Yükleme tamamlandı / Loading completed</p>', true);

                            $timeout(function () {
                                $window.loading_screen.finish();
                            }, 2000);
                        }]
                    })
                    .within()
                    /**
                     * 401: unauthorized: usually response to login request from server
                     * 403: forbidden: app level, decide if the content is permitted to show.
                     * 404: not found: page not found
                     */
                    .segment('page401', {template: '<div data-apt-special-page type="401"></div>'})
                    .segment('page403', {template: '<div data-apt-special-page type="403"></div>'})
                    .segment('page404', {template: '<div data-apt-special-page type="404"></div>'})
                ;

                $routeProvider.otherwise({redirectTo: '/404'});

            }
        ])
    ;

})(window.angular);