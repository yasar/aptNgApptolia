/*global window */
;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .provider('aptMenu', [function () {
            var menuHolder = {};

            var MenuItemConstructor = function (params, optionalParams) {
                if (!angular.isObject(params)) {
                    if (_.isObject(optionalParams)) {
                        params = getMenuConf(params, optionalParams);
                    } else {
                        params = {
                            name: params
                        };
                    }

                }

                var defaultParams = {
                    name   : null,
                    text   : '',
                    href   : null,
                    segment: null,
                    icon   : '',
                    click  : '',
                    order  : 999999,
                    class  : '',
                    auth   : null,
                    show   : true,
                    enabled: true
                };

                params = angular.extend({}, defaultParams, params);

                var obj = {
                    __constructor: 'MenuItemConstructor',
                    children     : [],
                    addChild     : function (params) {
                        params = angular.extend({}, defaultParams, params);

                        if (params.hasOwnProperty('__constructor') && params.__constructor == 'MenuItemConstructor') {
                            obj.children.push(params);
                        } else {
                            obj.children.push(new MenuItemConstructor(params));
                        }

                        return obj;
                    },
                    removeChild  : function (id) {
                        var idx = _.findIndex(obj.children, {id: id});
                        obj.children.splice(idx, 1);
                    },
                    clear        : function () {
                        obj.children.length = 0;
                        return obj;
                    },
                    find         : function (name) {
                        return findMenu(name, obj);
                    }
                };

                obj = angular.extend(obj, params);
                return obj;
            };

            var addMenu = function (name) {
                var menu = new MenuItemConstructor(name);

                menuHolder[name] = menu;
                return menu;
            };

            var getMenu = function (name) {
                if (menuHolder.hasOwnProperty(name)) {
                    return menuHolder[name];
                }


                var m = null;

                for (var menuName in menuHolder) {
                    m = findMenu(name, menuHolder[menuName]);
                    if (m != null) {
                        break;
                    }
                }

                return m;
            };

            var findMenu = function (name, menuItem) {
                var m = null;
                if (menuItem.children.length > 0) {
                    for (var i = 0; i < menuItem.children.length; i++) {
                        if (menuItem.children[i].name == name || menuItem.children[i].text == name) {
                            m = menuItem.children[i];
                        }

                        if (m == null) {
                            m = findMenu(name, menuItem.children[i]);
                        }

                        if (m != null) {
                            break;
                        }
                    }

                }
                return m;
            };

            var getMenuConf = function (name, conf) {
                var _conf = {};
                switch (name) {
                    case 'delete':
                        _conf = {
                            text: 'Delete',
                            icon: 'icon-trash',
                        }
                        break;
                    case 'edit':
                        _conf = {
                            text: 'Edit',
                            icon: 'icon-pencil',
                            auth: true
                        };
                        break;
                    case 'row-menu':
                        _conf = {
                            name: 'row-menu',
                            // 'class': 'dropdown-toggle btn-group-xs',
                            icon: 'icon-gear'
                        };
                        break;
                }
                _conf.name = name;
                _.merge(_conf, conf);
                return _conf;
            }

            // will add a new menuItem and will return the reference for the added menuItem
            this.add = function (name) {
                return addMenu(name);
            };

            this.get = function (name) {
                return getMenu(name);
            };

            this.$get = function aptMenuFactory() {
                return {
                    Item: MenuItemConstructor,
                    get : getMenu,
                    add : addMenu
                };
            };
        }])
    ;


})(window.angular);