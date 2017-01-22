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
    // dependencies.push('ngRoute');
    // dependencies.push('route-segment');
    // dependencies.push('view-segment');
    dependencies.push('ui.router');
    ///
    
    dependencies.push('angularScreenfull');
    
    ///
    
//    dependencies.push('ae-datetimepicker'); // this will be removed
    dependencies.push('moment-picker');
    
    /**
     * angular-dialog-service
     */
    dependencies.push('dialogs.main');
    dependencies.push('ngSanitize');
    ///
    
    dependencies.push('NgSwitchery');
    
    /**
     * angular-marked
     * used in panel/help section, where mark-down files are loaded and parsed by this plugin.
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
    
    /**
     * for tri-state toggle/switch
     */
    dependencies.push('nzToggle');
    
    
    ////////////////////////////////////////////////
    
    angular.module('ngApptolia', dependencies)
           .config([
               '$stateProvider', '$urlRouterProvider',
               function ($stateProvider, $urlRouterProvider) {
                   $stateProvider
                       .state({
                           name         : 'main',
                           url          : '',
                           abstract     : true,
                           template     : '<apt-layout></apt-layout>',
                           controller   : [
                               '$timeout', '$window', '$scope', 'aptTempl',
                               function ($timeout, $window, $scope, aptTempl) {
                                   $window.loading_screen.updateLoadingHtml('<p style="color: #fff;">Yükleme tamamlandı / Loading completed</p>', true);
                            
                                   $timeout(function () {
                                       $window.loading_screen.finish();
                                   }, 100);
                            
                               }
                           ],
                           ncyBreadcrumb: {
                               label: '{{$root.apt.Templ.appConfig.name}}'
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
            
                   ///
            
                   /**
                    * this is required for form.$dirty controls
                    * check utils.form.js and look for `toState.resolve.pauseStateChange`
                    */
                   var $delegate        = $stateProvider.state;
                   $stateProvider.state = function (name, definition) {
                       if (_.isUndefined(definition)) {
                           definition = name;
                       }
                       if (!definition.resolve) {
                           definition.resolve = {};
                       }
                
                       return $delegate.apply(this, arguments);
                   };
               }
           ])
           .run([
               '$injector', function ($injector) {
            
                   var $window          = $injector.get('$window');
                   var $rootScope       = $injector.get('$rootScope');
                   var $state           = $injector.get('$state');
                   var NotifyingService = $injector.get('NotifyingService');
                   var gettextCatalog   = $injector.get('gettextCatalog');
            
                   $rootScope.$on('$stateChangeStart', function (evt, to, params) {
                       if (to.redirectTo) {
                           evt.preventDefault();
                           $state.go(to.redirectTo, params, {location: 'replace'})
                       }
                   });
            
                   ///
            
                   /**
                    * set initial locale
                    */
                   setLocale();
            
                   /**
                    * we may have changed the language on login screen, so make sure we re-set the locale.
                    */
                   NotifyingService.subscribe($rootScope, userBuilder.getEventName('login', 'successful'), setLocale);
            
                   function setLocale() {
                       $window.moment.locale(gettextCatalog.getCurrentLanguage().split('_')[0]);
                   }
            
                   ///
               }
           ])
    ;
    
})(window.angular);