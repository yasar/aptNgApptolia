/*global window */
;(function (angular) {
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
                    getIcon            : self.getIcon,
                    setSlotItem        : self.setSlotItem,
                    getSlot            : self.getSlot,
                    loadSlotsInto      : self.loadSlotsInto,
                    reset              : self.reset,
                    setSlotRouteSegment: self.setSlotRouteSegment,
                    blurPage           : self.blurPage,
                    resetWithBuilder   : self.resetWithBuilder,
                    layoutWrappers     : self.layoutWrappers,
                    getAppName         : self.getAppName
                };
            }];

        /**
         * Menu.js içerisinde oluşturulmuş apt-menu nesne atanmaktadır.
         * @type {null}
         */
        this.menu = null;

        this.$injector = null;


        this.copyright  = 'BYRWEB';
        this.version    = '0.0.1';
        this.theme      = 'light';
        this.name       = 'Apptolia';
        this.page       = {
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
            html5Mode     : true,
            hashPrefix    : '!',
            defaults      : {
                mapObject: {
                    center  : {
                        lat     : 38.95940879245423,
                        lng     : 36.6943359375,
                        zoom    : 6,
                        dragging: false
                    },
                    defaults: {
                        zoomControl    : true,
                        scrollWheelZoom: false,
                        doubleClickZoom: true,
                        layerControl   : true,
                        tileLayer      : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    },
                    markers : {},
                    events  : {
                        markers: {
                            enable: ['click']
                        }
                    },
                    layers  : {
                        baselayers: {
                            osm: {
                                name: 'OpenStreetMap',
                                url : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                type: 'xyz'
                            }
                        }
                    }
                },
                formats  : {
                    screenDateTime   : 'DD.MM.YYYY HH:mm',
                    screenDateTimeUib: 'dd.MM.yyyy HH:mm',
                    screenDate       : 'DD.MM.YYYY',
                    screenDateUib    : 'dd.MM.yyyy',
                    screenTime       : 'HH:mm'
                },
                dialogs  : {
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
                        size     : 'sm',
                        keyboard : false,
                        backdrop : false,
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
                icons    : {
                    icomoon: {
                        add                : 'plus22',
                        'add-new'          : 'plus3',
                        'add-to-list'      : 'folder-plus4',
                        apply              : 'check',
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
                        featured           : 'star-full2',
                        fullscreen         : 'screen-full',
                        'fullscreen-cancel': 'screen-normal',
                        images             : 'camera',
                        'item-menu'        : 'more2',
                        location           : 'map-marker',
                        'not-featured'     : 'star-empty3',
                        notes              : 'notebook',
                        null               : 'circle',
                        option             : 'circle-o',
                        pay                : 'wallet',
                        preview            : 'eye',
                        remove             : 'minus2',
                        refresh            : 'database-refresh',
                        reload             : 'database-refresh',
                        reset              : 'x',
                        save               : 'floppy-disk',
                        select             : 'select2',
                        'select-item'      : 'select2',
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

        this.layoutWrappers = [
            /**
             * place in html code that will wrap the layout (div)
             * this is an array, it will be processed in array index order,
             * last one in the array will be most outer wrapper
             *
             * ex: '<div card-read="vm.parseCard($card, $tracks, $readError)"></div>'
             */
        ];

        /**
         * we need to handle the login screen in a special way
         *
         * @type {boolean}
         */
        this.isLoginMode = false;

        this.init = function () {
            var $rootScope     = self.$injector.get('$rootScope');
            // var $routeSegment  = self.$injector.get('$routeSegment');
            var hotkeys        = self.$injector.get('hotkeys');
            var gettextCatalog = self.$injector.get('gettextCatalog');

            // todo: ui-router correction required
            /*$rootScope.$on('$routeChangeSuccess', function (event, next, current) {
             if ($routeSegment.chain.length) {
             var segmentParams = $routeSegment.chain[$routeSegment.chain.length - 1].params;
             if (_.has(segmentParams, 'icon')) {
             self.page.icon = segmentParams.icon;
             }
             self.loadSlot(next.segment);
             }
             });*/

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

        this.getIcon = function (icon) {
            var aptIcon = self.$injector.get('aptIcon');
            return aptIcon.get(icon);
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

            this.reset = function (isSegmentAware, builder) {
                var aptUtils = self.$injector.get('aptUtils');
                var aptMenu  = self.$injector.get('aptMenu');
                // var $routeSegment = self.$injector.get('$routeSegment');
                var $state   = self.$injector.get('$state');

                if (isSegmentAware) {
                    if ($state.current.name.indexOf(self.data.slotRouteSegment) != -1) {
                        return;
                    }

                    if (self.data.slotRouteSegment && self.data.slotRouteSegment.indexOf($state.current.name) != -1) {
                        return;
                    }

                    if (builder && builder.segmentMatchLevel > 0 && self.data.slotRouteSegment) {
                        var s1 = self.data.slotRouteSegment.split('.');
                        var s2 = $state.current.name.split('.');

                        var isMatch = true;
                        for (var i = 0; i < builder.segmentMatchLevel; i++) {
                            isMatch = isMatch && s1[i] && s2[i] && s1[i] == s2[i];
                        }

                        if (isMatch) {
                            return;
                        }
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
            // var $routeSegment = self.$injector.get('$routeSegment');
            var $state  = self.$injector.get('$state');
            var segment = _segment || self.data.slotRouteSegment || $state.current.name;
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
            var $rootScope = self.$injector.get('$rootScope');
            var aptUtils   = self.$injector.get('aptUtils');
            // var $routeSegment = self.$injector.get('$routeSegment');
            var $state     = self.$injector.get('$state');

            if (self.data._route.lastModifiedAt == null) {
                return;
            }

            segment      = segment || $state.current.name;
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
            var $rootScope = self.$injector.get('$rootScope');
            var aptUtils   = self.$injector.get('aptUtils');
            // var $routeSegment = self.$injector.get('$routeSegment');
            var $state     = self.$injector.get('$state');

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
                // route = self.$injector.get('$routeSegment').name;
                route = self.$injector.get('$state').current.name;
            }
            self.data.slotRouteSegment = route;
        };

    }
})(window.angular);