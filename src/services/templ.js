/*global window */
(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .provider('aptTempl', aptTemplProvider);

    function aptTemplProvider() {

        var self = this;

        this.$get = [
            '$window',
            '$injector',
            function ($window, $injector) {
                self.$injector = $injector;
                self.reset();
                self.init();

                return {
                    appConfig          : self.appConfig,
                    menu               : self.menu,
                    name               : self.name,
                    copyright          : self.copyright,
                    version            : $window.version ? $window.version : self.version,
                    theme              : self.theme,
                    page               : self.page,
                    isLoginMode        : self.isLoginMode,
                    defaults           : self.defaults,
                    config             : self.config,
                    //breadcrumbs        : self.breadcrumbs,
                    data               : self.data,
                    setSlotItem        : self.setSlotItem,
                    getSlot            : self.getSlot,
                    loadSlotsInto      : self.loadSlotsInto,
                    reset              : self.reset,
                    setSlotRouteSegment: self.setSlotRouteSegment,
                    blurPage           : self.blurPage,
                    resetWithBuilder   : self.resetWithBuilder
                };
            }];

        /**
         * Menu.js içerisinde oluşturulmuş apt-menu nesne atanmaktadır.
         * @type {null}
         */
        this.menu = null;

        this.$injector = null;


        this.copyright = 'BYRWEB';
        this.version   = '0.0.1';
        this.theme     = 'light';
        this.name      = 'Apptolia';
        this.page      = {
            title      : '',
            subTitle   : '',
            description: '',
            icon       : ''
        };

        this.appConfig = {
            name          : '',
            package       : '',
            theme         : 'limitless',
            logo          : '',
            logoLight     : '',
            logoIcon      : '',
            bgImage       : '',
            isStrict      : false,
            showInlineHelp: true,
            defaults      : {
                formats: {
                    screenDateTime   : 'DD.MM.YYYY HH:mm',
                    screenDateTimeUib: 'dd.MM.yyyy HH:mm',
                    screenDate       : 'DD.MM.YYYY',
                    screenDateUib    : 'dd.MM.yyyy',
                    screenTime       : 'HH:mm'
                },
                dialogs: {
                    edit         : {
                        size     : 'lg',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    large        : {
                        size     : 'lg',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    medium       : {
                        size     : 'md',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    small        : {
                        size     : 'md',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    login        : {
                        size     : 'md',
                        keyboard : false,
                        backdrop : true,
                        animation: true
                    },
                    confirm      : {
                        size     : 'sm',
                        keyboard : false,
                        backdrop : true,
                        animation: true
                    },
                    deleteConfirm: {
                        size       : 'sm',
                        keyboard   : false,
                        backdrop   : 'static',
                        animation  : true,
                        windowClass: 'bg-warning text-default bg-opacity-50'
                    },
                    error        : {
                        size       : 'sm',
                        keyboard   : true,
                        backdrop   : true,
                        animation  : true,
                        windowClass: 'bg-error text-default bg-opacity-50'
                    },
                    wait         : {
                        size     : 'sm',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    warning      : {
                        size     : 'sm',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    },
                    info         : {
                        size     : 'sm',
                        keyboard : true,
                        backdrop : true,
                        animation: true
                    }
                },
                icons  : {
                    icomoon: {
                        add                : 'thumbs-up2',
                        'add-new'          : 'plus3',
                        'add-to-list'      : 'folder-plus4',
                        calendar           : 'calendar52',
                        cancel             : 'x',
                        check              : 'checkmark2',
                        close              : 'times',
                        completed          : 'check',
                        configuration      : 'equalizer3',
                        create             : 'cogs',
                        desc               : 'file-text-o',
                        delete             : 'trash',
                        edit               : 'pencil',
                        entity             : 'office',
                        fullscreen         : 'screen-full',
                        'fullscreen-cancel': 'screen-normal',
                        images             : 'camera',
                        'item-menu'        : 'more',
                        notes              : 'notebook',
                        null               : 'circle',
                        option             : 'circle-o',
                        preview            : 'eye',
                        remove             : 'minus2',
                        refresh            : 'database-refresh',
                        reload             : 'database-refresh',
                        reset              : 'x',
                        save               : 'floppy-disk',
                        'select-item'      : 'eye8',
                        unlocked           : 'unlocked',
                        upload             : 'cloud-upload',
                        update             : 'floppy-disk',
                        view               : 'desktop',
                    }
                }
            }
        };

        this.defaults = {
            pageSize: 10
        };

        /**
         * we need to handle the login screen in a special way
         *
         * @type {boolean}
         */
        this.isLoginMode = false;

        this.init = function () {
            var $rootScope     = self.$injector.get('$rootScope');
            var $routeSegment  = self.$injector.get('$routeSegment');
            var hotkeys        = self.$injector.get('hotkeys');
            var gettextCatalog = self.$injector.get('gettextCatalog');

            $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
                if ($routeSegment.chain.length) {
                    var segmentParams = $routeSegment.chain[$routeSegment.chain.length - 1].params;
                    if (_.has(segmentParams, 'icon')) {
                        self.page.icon = segmentParams.icon;
                    }
                    self.loadSlot(next.segment);
                }
            });

            self.initSlots();

            hotkeys.bindTo($rootScope)
                .add({
                    combo      : 'ctrl+i',
                    description: gettextCatalog.getString('Toggle Inline Helps'),
                    callback   : function () {
                        self.appConfig.showInlineHelp = !self.appConfig.showInlineHelp;
                    }
                });
        };

        this.resetWithBuilder = function (builder) {
            var gettextCatalog    = self.$injector.get('gettextCatalog');
            self.page.title       = builder.title ? gettextCatalog.getString(builder.title) : gettextCatalog.getString(builder.domain);
            self.page.subTitle    = builder.subTitle ? gettextCatalog.getString(builder.subTitle) : '';
            self.page.description = builder.description ? gettextCatalog.getString(builder.description) : '';
            self.page.icon        = builder.icon || '';
        };

        this.blurPage = (function () {
            /**
             * dialogs, modal should be listened to open and close event.
             */

            var ctr      = 0;
            var isBlured = false;

            return function () {
                if (arguments.length == 0) {
                    return isBlured;
                }

                if (arguments[0] == true) {
                    ctr++;
                    isBlured = true;
                } else {
                    ctr--;
                    /**
                     * ctr might get to a negative number
                     * so, we have to check against <=
                     */
                    if (ctr <= 0) {
                        isBlured = false;
                        ctr      = 0;
                    }
                }
            }
        })();

        {
            var configDefault = {
                miniSidebar        : true,
                darkSidebar        : true,
                sidebarNicescroll  : true,
                showSidebarLeft    : false,
                showSidebarRight   : false,
                showBreadcrumb     : true,
                showSecondaryNavbar: false,
                showHeader         : true,
                showFooter         : true,
                fixedHeader        : true,
                hideableHeader     : true,
                transparentHeader  : false,
                fillContent        : false
            };
            this.config       = {};

            this.data = {
                _route            : {
                    lastModifiedAt: null,
                },
                slots             : {},
                isSlotsInitialized: false,
                slotRouteSegment  : null
            };

            this.reset = function (isSegmentAware) {
                var aptUtils      = self.$injector.get('aptUtils');
                var aptMenu       = self.$injector.get('aptMenu');
                var $routeSegment = self.$injector.get('$routeSegment');

                if (isSegmentAware) {
                    if ($routeSegment.name.indexOf(self.data.slotRouteSegment) != -1) {
                        return;
                    }

                    if (self.data.slotRouteSegment && self.data.slotRouteSegment.indexOf($routeSegment.name) != -1) {
                        return;
                    }
                }

                self.config = angular.merge({}, configDefault, self.config);
                self.resetDataRoute();
                aptMenu.get('moduleMenu').clear();
            };

            this.resetDataRoute = function () {
                var aptUtils = self.$injector.get('aptUtils');
                _.forIn(self.data.slots, function (value) {
                    aptUtils.removeObjectProperties(value);
                });
            };
        }


        this.setSlotItem = function (slot, name, item, _segment) {
            var $routeSegment = self.$injector.get('$routeSegment'),
                segment       = _segment || $routeSegment.name;
            _.set(self.data
                , '_route.' + segment + '._slots.' + slot + '.' + name
                , _.merge({
                    isCollapsed  : false,
                    isCollapsable: true,
                    showTitle    : true,
                    title        : '[TITLE]',
                    body         : '[BODY]',
                    _scopeId     : null
                }, item)
                , Object);
//console.log('slot:' + slot + ', name:' + name + ', item:' + item + ', segment:' + segment)
//console.log(self.data._route);
            self.data._route.lastModifiedAt = new Date().getTime();
        };

        this.getSlot = function (slot) {

            if (self.data.slots.hasOwnProperty(slot)) {
                return self.data.slots[slot];
            }

            self.data.slots[slot] = {};
            return self.getSlot(slot);
        };

        this.loadSlot = function (segment) {
            var $rootScope    = self.$injector.get('$rootScope'),
                aptUtils      = self.$injector.get('aptUtils'),
                $routeSegment = self.$injector.get('$routeSegment');

            if (self.data._route.lastModifiedAt == null) {
                return;
            }

            segment      = segment || $routeSegment.name;
            var segments = segment.split('.');

            var dataRoute    = self.data._route;
            var segmentChain = [];
            var slotRepo     = self.data.slots;
            var __slots      = null;
            _.forIn(segments, function (s) {
                segmentChain.push(s);
                if (_.has(dataRoute, segmentChain)) {

                    __slots = _.clone(segmentChain);
                    __slots.push('_slots');

                    var __slotsClone = _.clone(__slots);
                    var slotNames    = _.get(dataRoute, __slotsClone);
                    _.forIn(slotNames, function (slotObj, slotName) {
                        var oneSlot = _.clone(__slots);
                        oneSlot.push(slotName);

                        if (_.has(dataRoute, oneSlot)) {

                            if (!_.has(slotRepo, slotName)) {
                                slotRepo[slotName] = {};
                            }

                            aptUtils.removeObjectProperties(slotRepo[slotName]);
                            angular.merge(slotRepo[slotName], slotObj);
                        }
                    });

                }
            });

        }

        this.initSlots = function () {
            var $rootScope    = self.$injector.get('$rootScope'),
                aptUtils      = self.$injector.get('aptUtils'),
                $routeSegment = self.$injector.get('$routeSegment');

            if (self.data.isSlotsInitialized) {
                return;
            }

            self.data.isSlotsInitialized = true;
            watch();

            function watch() {

                $rootScope.$watch(
                    function () {
                        return self.data._route;
                    },

                    function (newVal, oldVal) {
                        if (angular.isUndefined(newVal) || newVal == oldVal) {
                            return;
                        }

                        self.loadSlot();
                    },

                    true);
            }

        };

        this.setSlotRouteSegment = function (route) {
            if (!route) {
                route = self.$injector.get('$routeSegment').name;
            }
            self.data.slotRouteSegment = route;
        };

    }
})(window.angular);