/**
 * Created by yasar on 18.12.2015.
 */

/*global window */
;(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .directive('aptMenuBuilder', [
            '$compile',
            'aptAuthorizationService',
            'aptAuthEnumService',
            '$location',
            '$injector',
            // '$routeSegment',
            'aptUtils',
            function ($compile, authorization, enums, $location, $injector, /*$routeSegment,*/ aptUtils) {
                //var getTemplate = function () {
                //};

                var directive_object = {
                    scope  : {
                        /**
                         * The actual menu object which defines the menu structure.
                         *
                         * @type {aptMenu}
                         */
                        model: '=ngModel',

                        /**
                         * Callback function to be called when menu generation is fully completed.
                         *
                         * @type {Function}
                         */
                        onready: '&',

                        /**
                         * the type of generated html for the menu.
                         * could be
                         *     group: will show a grouped button list by utilizing the btn-group structure of bootstrap
                         *         !! note that when group is given, sub-menu will be ignored.
                         *         @todo button with caret should be implemented, so that children menu will be a dropdown of the main menu.
                         *     dropdown: will show a dropdwon menu of bootstrap
                         *     pages: pages is a special case specific to pages admin theme,
                         *     floating: is used for material design floating button menu, similar to one used in Google/Inbox
                         *
                         * @type {String}
                         */
                        menuType: '@', // group | dropdown | pages | pages-list | pages-table | floating | pages-vertical-button-group

                        /**
                         * itemData is to be passed-in to the click event handler
                         * this is especially useful and necessary in conjunction with ng-repeat
                         *
                         * suppose, we have a list of data in a table, and we want to supply a menu for each row
                         * each row will have its own data, and itemData is to hold the reference for this data.
                         *
                         *
                         * @type {Object}
                         */
                        itemData: '<',

                        /**
                         * if set to true, scope.itemData will be watched against any changes
                         * and will re-build menu accordingly.
                         */
                        watchItemData: '<',

                        btnSize: '@',

                        config: '<'
                    },
                    require: 'ngModel',
                    replace: true,
                    link   : function (scope, element, attrs) {
                        var ctr = 0;

                        var config = angular.extend({
                            liHasSubMenuClass    : null,
                            ulIsSubMenuClass     : null,
                            aInLiWithSubMenuClass: null,
                            translate            : true
                        }, scope.config);

                        // scope.$routeSegment = $routeSegment;

                        var proceed = function (_menu) {
                            // console.log('menu proceed is executing..');

                            if (true) {
                                var buildDropdownMenu = function (menu, parent) {


                                    /**
                                     * @todo not sure why this is required.
                                     */
                                    ctr++;

                                    var $ul = null;

                                    if (parent.is('ul')) {
                                        $ul = parent;
                                    } else if (menu.children.length) {
                                        $ul = angular.element('<ul></ul>');
                                        if (ctr > 0 && config.ulIsSubMenuClass !== null) {
                                            $ul.addClass(config.ulIsSubMenuClass);
                                        }
                                        parent.append($ul);
                                    }


                                    angular.forEach(menu.children, function (menuItem, key) {
                                        if (menuItem.hasOwnProperty('show')) {
                                            if (menuItem.show === false) {
                                                return;
                                            } else if (angular.isFunction(menuItem.show)) {
                                                var cont = menuItem.show.call(undefined, scope.itemData);
                                                if (!cont) {
                                                    return;
                                                }
                                            }
                                        }

                                        if (menuItem.hasOwnProperty('auth') && menuItem.auth) {
                                            //if (!authAccountModel.can(menuItem.auth.right, menuItem.auth.type, menuItem.auth.topic)) {
                                            //    return;
                                            //}
                                            if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                                                return;
                                            }
                                        }

                                        var $li         = angular.element('<li></li>');
                                        var hasChildren = false;
                                        if (menuItem.hasOwnProperty('children') && menuItem.children.length > 0) {
                                            hasChildren = true;
                                        }

                                        if (hasChildren && config.liHasSubMenuClass !== null) {
                                            $li.addClass(config.liHasSubMenuClass);
                                        }
                                        $ul.append($li);

                                        var $a = angular.element('<a></a>');
                                        if (hasChildren && config.aInLiWithSubMenuClass !== null) {
                                            $a.addClass(config.aInLiWithSubMenuClass);
                                        }

                                        if (menuItem.href) {
                                            $a.attr('ng-href', menuItem.href);
                                        }

                                        if (menuItem.click) {
                                            $a.click(function () {
                                                menuItem.click(scope.itemData);
                                            });
                                        }

                                        if (menuItem.children.length) {
                                            $a.addClass('expand');
                                        }

                                        if (menuItem.icon) {
                                            $a.append('<i class="' + menuItem.icon + '"></i>');
                                        }

                                        if (config.translate) {
                                            $a.append('<span translate>' + menuItem.text + '</span>');
                                        } else {
                                            $a.append('<span>' + menuItem.text + '</span>');
                                        }

                                        $li.append($a);

                                        if (menuItem.children) {
                                            buildMenu(menuItem, $li);
                                        }
                                    });
                                };
                                var buildMenu         = buildDropdownMenu;

                                var buildButtonGroupMenu = function (menu, parent) {

                                    var $parent = null;

                                    // !!! do not confuse parent and $parent
                                    // parent is the passed in argument
                                    // $parent is the element we are referring to parent.
                                    if (parent.is('div')) {
                                        $parent = parent;
                                    } else {
                                        $parent = angular.element('<div></div>');
                                        parent.append($parent);
                                    }

                                    parent.addClass('btn-group');
                                    if (menu.class) {
                                        parent.addClass(menu.class);
                                    }

                                    angular.forEach(menu.children, function (menuItem, key) {
                                        if (menuItem.hasOwnProperty('show')) {
                                            if (menuItem.show === false) {
                                                return;
                                            } else if (angular.isFunction(menuItem.show)) {
                                                var cont = menuItem.show.call(undefined, scope.itemData);
                                                if (!cont) {
                                                    return;
                                                }
                                            }
                                        }

                                        if (menuItem.hasOwnProperty('auth') && menuItem.auth) {
                                            //if (!authAccountModel.can(menuItem.auth.right, menuItem.auth.type, menuItem.auth.topic)) {
                                            //    return;
                                            //}
                                            if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                                                return;
                                            }
                                        }


                                        var $a = angular.element(menuItem.href ? '<a />' : '<button type="button"' + (scope.btnSize ? ' class="btn-' + scope.btnSize + '"' : '') + ' />');
                                        if (menuItem.href) {
                                            $a.attr('ng-href', menuItem.href);
                                        }
                                        if (menuItem.click) {
                                            $a.click(function () {
                                                menuItem.click(scope.itemData);
                                            });
                                        }
                                        $a.addClass('btn');

                                        //$a.addClass(menuItem.class ? menuItem.class : 'btn-default');
                                        var itemClass = !menuItem.class ? 'btn-default' : (angular.isFunction(menuItem.class) ? menuItem.class.call(undefined, scope.itemData) : menuItem.class);
                                        $a.addClass(itemClass);


                                        if (menuItem.icon) {
                                            $a.append('<i icon="' + menuItem.icon + '"></i>');
                                        }
                                        if (menuItem.text !== '') {
                                            if (config.translate) {
                                                $a.append('<span translate>' + menuItem.text + '</span>');
                                            } else {
                                                $a.append('<span>' + menuItem.text + '</span>');
                                            }
                                        }
                                        $parent.append($a);


                                        if (!!menuItem.children.length) {
                                            $a.wrap('<div class="btn-group" uib-dropdown />');

                                            //var $caret = angular.element('<button type="button" class="btn' + (scope.btnSize ? ' btn-' + scope.btnSize : '') + ' dropdown-toggle" data-toggle="dropdown"><span class="caret caret-split"></span></button>');
                                            //var $caret = angular.element('<button type="button" class="btn' + (scope.btnSize ? ' btn-' + scope.btnSize : '') + ' uib-dropdown-toggle" uib-dropdown-toggle><span class="caret caret-split"></span></button>');
                                            var $caret = angular.element('<button type="button" class="btn' + (scope.btnSize ? ' btn-' + scope.btnSize : '') + '" uib-dropdown-toggle><span class="caret caret-split"></span></button>');
                                            //$caret.addClass(menuItem.class ? menuItem.class : 'btn-default');
                                            $caret.addClass(itemClass);
                                            $a.parent().append($caret);

                                            //var $ul = angular.element('<ul class="uib-dropdown-menu dropdown-menu-right dropdown-icons-right" role="menu" />');
                                            var $ul = angular.element('<ul class="dropdown-menu dropdown-menu-right dropdown-icons-right" role="menu" />');
                                            $a.parent().append($ul);


                                            buildDropdownMenu(menuItem, $ul);
                                        }
                                    });
                                };

                                var buildLimitlessButtonGroupMenu = function (menu, parent) {

                                    var $parent = null;

                                    // !!! do not confuse parent and $parent
                                    // parent is the passed in argument
                                    // $parent is the element we are referring to parent.
                                    if (parent.is('div')) {
                                        $parent = parent;
                                    } else {
                                        $parent = angular.element('<div></div>');
                                        parent.append($parent);
                                    }

                                    parent.addClass('btn-group');
                                    if (menu.class) {
                                        parent.addClass(menu.class);
                                    }

                                    angular.forEach(menu.children, function (menuItem, key) {
                                        if (menuItem.hasOwnProperty('show')) {
                                            if (menuItem.show === false) {
                                                return;
                                            } else if (angular.isFunction(menuItem.show)) {
                                                var cont = menuItem.show.call(undefined, scope.itemData);
                                                if (!cont) {
                                                    return;
                                                }
                                            }
                                        }

                                        if (menuItem.hasOwnProperty('auth') && menuItem.auth) {
                                            //if (!authAccountModel.can(menuItem.auth.right, menuItem.auth.type, menuItem.auth.topic)) {
                                            //    return;
                                            //}
                                            if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                                                return;
                                            }
                                        }


                                        var $a = angular.element(menuItem.href ? '<a />' : '<button type="button"' + (scope.btnSize ? ' class="btn-' + scope.btnSize + '"' : '') + ' />');
                                        if (menuItem.href) {
                                            $a.attr('ng-href', menuItem.href);
                                        }
                                        if (menuItem.click) {
                                            $a.click(function () {
                                                menuItem.click(scope.itemData);
                                            });
                                        }
                                        $a.addClass('btn');

                                        //$a.addClass(menuItem.class ? menuItem.class : 'btn-default');
                                        var itemClass = !menuItem.class ? 'btn-default' : (angular.isFunction(menuItem.class) ? menuItem.class.call(undefined, scope.itemData) : menuItem.class);
                                        $a.addClass(itemClass);


                                        if (menuItem.icon) {
                                            $a.append('<i class="' + menuItem.icon + '"></i> ');
                                        }
                                        if (menuItem.text !== '') {
                                            if (config.translate) {
                                                $a.append('<span translate>' + menuItem.text + '</span>');
                                            } else {
                                                $a.append('<span>' + menuItem.text + '</span>');
                                            }
                                        }
                                        $parent.append($a);


                                        if (!!menuItem.children.length) {
                                            $a.wrap('<div class="btn-group" uib-dropdown />');

                                            //var $caret = angular.element('<button type="button" class="btn' + (scope.btnSize ? ' btn-' + scope.btnSize : '') + ' dropdown-toggle" data-toggle="dropdown"><span class="caret caret-split"></span></button>');
                                            var $caret = angular.element('<button type="button" class="btn' + (scope.btnSize ? ' btn-' + scope.btnSize : '') + '" uib-dropdown-toggle><span class="caret caret-split"></span></button>');
                                            //$caret.addClass(menuItem.class ? menuItem.class : 'btn-default');
                                            $caret.addClass(itemClass);
                                            $a.parent().append($caret);

                                            //var $ul = angular.element('<ul class="uib-dropdown-menu dropdown-menu-right dropdown-icons-right" role="menu" />');
                                            var $ul = angular.element('<ul class="dropdown-menu dropdown-menu-right dropdown-icons-right" role="menu" />');
                                            $a.parent().append($ul);


                                            buildDropdownMenu(menuItem, $ul);
                                        }
                                    });
                                };

                                var buildLimitlessMenu = function (menu, parent) {

                                    ctr++;

                                    menu.children.sort(function (a, b) {
                                        if (a.order > b.order) {
                                            return 1;
                                        }

                                        if (a.order < b.order) {
                                            return -1;
                                        }

                                        return 0;
                                    });

                                    var $ul = null;

                                    if (parent.is('ul')) {
                                        $ul = parent;
                                    } else if (menu.children.length) {
                                        $ul = angular.element('<ul></ul>');
                                        if (ctr > 0 && config.ulIsSubMenuClass !== null) {
                                            $ul.addClass(config.ulIsSubMenuClass);
                                        }
                                        parent.append($ul);
                                    }


                                    angular.forEach(menu.children, function (menuItem, key) {
                                        if (menuItem.hasOwnProperty('show')) {
                                            if (menuItem.show === false) {
                                                return;
                                            } else if (angular.isFunction(menuItem.show)) {
                                                var cont = menuItem.show.call(undefined, scope.itemData);
                                                if (!cont) {
                                                    return;
                                                }
                                            }
                                        }

                                        if (menuItem.hasOwnProperty('auth') && menuItem.auth) {
                                            // if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                                            if (!authorization.isAuthorized(menuItem.auth)) {
                                                return;
                                            }
                                        }

                                        var hasChildren = false;
                                        if (menuItem.hasOwnProperty('children') && menuItem.children.length > 0) {
                                            hasChildren = true;
                                        }

                                        var $li = angular.element('<li></li>');
                                        if (hasChildren && config.liHasSubMenuClass !== null) {
                                            $li.addClass(config.liHasSubMenuClass);
                                        }
                                        // $li.attr('ng-class', '{active: (\'' + menuItem.segment + '\' | routeSegmentStartsWith)}');
                                        $li.attr('ui-sref-active', 'active');
                                        $ul.append($li);

                                        var $a = angular.element('<a></a>');

                                        if (menuItem.href) {
                                            $a.attr('ng-href', menuItem.href);
                                        }

                                        if (menuItem.segment) {
                                            try {
                                                // $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment));
                                                $a.attr('ui-sref', menuItem.segment);
                                            } catch (err) {
                                                console.error(err);
                                            }
                                            //$a.attr('ng-class', '{active: (\'' + menuItem.segment + '\' | routeSegmentStartsWith)}');
                                            //$a.attr('ng-class', '{active: $routeSegment.startsWith(\''+menuItem.segment+'\')}');
                                        }

                                        if (hasChildren && config.aInLiWithSubMenuClass !== null) {
                                            $a.addClass(config.aInLiWithSubMenuClass);
                                        }

                                        if (menuItem.click) {
                                            $a.click(function () {
                                                menuItem.click(scope.itemData);
                                            });
                                        }

                                        if (false && menuItem.children.length) {
                                            $a.addClass('expand');
                                        }

                                        if (menuItem.icon) {
                                            $a.append('<i class="' + menuItem.icon + '"></i>');
                                        }

                                        if (config.translate) {
                                            $a.append('<span translate>' + menuItem.text + '</span>');
                                        } else {
                                            $a.append('<span>' + menuItem.text + '</span>');
                                        }

                                        if (false && menuItem.details) {
                                            $a.append('<span class="details">' + menuItem.details + '</span>');
                                            $a.addClass('detailed');
                                        }
                                        $li.append($a);

                                        if (menuItem.children.length) {
                                            //$a.append('<span class="arrow"></span>');
                                            buildFn(menuItem, $li);
                                        }
                                    });
                                };

                                var buildFloatingMenu = function (menu, parent) {

                                    ctr++;

                                    menu.children.sort(function (a, b) {
                                        if (a.order > b.order) {
                                            return 1;
                                        }

                                        if (a.order < b.order) {
                                            return -1;
                                        }

                                        return 0;
                                    });


                                    var $ul = null;

                                    if (parent.is('nav')) {
                                        $ul = parent;
                                    } else {
                                        $ul = angular.element('<nav mfb-menu></nav>');
                                        parent.append($ul);
                                    }

                                    $ul.attr('active-icon', 'icon-cross2');
                                    $ul.attr('resting-icon', 'icon-plus3');
                                    $ul.attr('effect', 'zoomin');
                                    $ul.attr('toggling-method', 'click');
                                    $ul.attr('position', 'tr');

                                    scope.clickHandlers = {};
                                    scope.menuItems     = {};

                                    /**
                                     * this is where the magic happens.
                                     * we store the menuItems in the scope of this directive to access them.
                                     * note that the parameter `key` is used for accessing the correct item in the array
                                     * as we might have multiple items in the array
                                     *
                                     * there after, we shall check if click event is defined.
                                     *      IMPORTANT: if there is a click handler defined, the handler fn must return `true` in order to
                                     *      continue to evaluate the `href` attribute.
                                     *
                                     * @param key
                                     */
                                    scope.onItemClick = function (key) {
                                        var itm      = scope.menuItems[key];
                                        var response = true;


                                        if (itm.hasOwnProperty('click')) {
                                            response = itm.click();
                                        }

                                        if (response && itm.hasOwnProperty('href')) {
                                            aptUtils.goto({url: itm.href});
                                        }
                                    };

                                    angular.forEach(menu.children, function (menuItem, key) {
                                        if (menuItem.hasOwnProperty('show')) {
                                            if (menuItem.show === false) {
                                                return;
                                            } else if (angular.isFunction(menuItem.show)) {
                                                var cont = menuItem.show.call(undefined, scope.itemData);
                                                if (!cont) {
                                                    return;
                                                }
                                            }
                                        }

                                        if (menuItem.hasOwnProperty('auth') && menuItem.auth) {
                                            if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                                                return;
                                            }
                                        }

                                        scope.menuItems[key] = menuItem;

                                        var $a = angular.element('<a mfb-button></a>');

                                        /**
                                         * read the above description for more details.
                                         */
                                        if (menuItem.click) {
                                            $a.attr('ng-click', 'onItemClick(' + key + ')');
                                        }


                                        if (menuItem.icon) {
                                            $a.attr('icon', menuItem.icon);
                                            $a.attr('icon-ignore', true);
                                        }

                                        $a.attr('label', menuItem.text);

                                        $ul.append($a);

                                    });
                                };
                            }

                            var menu; // need this for jshint's out of scope error.
                            if (true) {
                                /**
                                 * Note that, since we are going to modify the menu array based on the sort order,
                                 * the digest cycle will detect the changes and will re-run the loop as we watch the model for changes.
                                 * And this may and eventually will cause 10x digest cycle error.
                                 *
                                 * Also note that we watch the model against any changes made during the life cycle of the program
                                 * as there may be some situations where we need to add/update/remove menu items while app is running.
                                 *
                                 * So, thats why we have to take a copy of the model (which is menu in this case) and
                                 * do the sorting on the copy, this way we will prevent digest cycle to get this run through again.
                                 */
                                menu = angular.copy(_menu);
                                menu.children.sort(function (a, b) {
                                    if (a.order > b.order) {
                                        return 1;
                                    }

                                    if (a.order < b.order) {
                                        return -1;
                                    }

                                    return 0;
                                });
                            }

                            var buildFn    = null,
                                pluginName = _.camelCase('apt-menu-' + scope.menuType),
                                plugin     = null;

                            if ($injector.has(pluginName)) {
                                plugin         = $injector.get(pluginName);
                                plugin.menu    = menu;
                                plugin.element = element;
                                plugin.config  = scope.config;
                                buildFn        = plugin.build;
                            } else {

                                // define the menu builder function based on the menu type requested
                                switch (scope.menuType) {
                                    case 'btn-group':
                                    case 'group':
                                        buildFn = buildButtonGroupMenu;
                                        break;
                                    case 'limitless':
                                        buildFn = buildLimitlessMenu;
                                        break;
                                    case 'limitless-group':
                                        buildFn = buildLimitlessButtonGroupMenu;
                                        break;
                                    case 'floating':
                                        buildFn = buildFloatingMenu;
                                        break;
                                    default:
                                        buildFn = buildDropdownMenu;
                                        break;
                                }
                            }


                            // clear the holder element before starting the built.
                            element.html('');

                            // now build the menu
                            buildFn(menu, element);

                            // make it angular aware
                            $compile(element.contents())(scope);

                            // add the directive class
                            element.addClass('aptmenubuilder');

                            // check if we have any onready callback
                            if (attrs.hasOwnProperty('onready')) {
                                scope.onready();
                            }
                        };


                        var last_menu = null;

                        if (scope.watchItemData) {
                            scope.$watch(function () {
                                return scope.itemData;
                            }, function (newVal, oldVal) {
                                if (!angular.isDefined(newVal)) {
                                    return;
                                }

                                if (!last_menu) {
                                    return;
                                }
                                proceed(last_menu);
                            }, true);
                        }

                        /**
                         * make sure that below commented out code will not break anything.
                         * it seems like it looks for any changes in the menu-model.
                         * however, supposedly we should never listen for it.
                         * if any privileges is changed on the fly, we ask user to re-login.
                         * so there should be no need for this.
                         */
                        scope.$watch(function () {
                            return scope.model;
                        }, function (newVal, oldVal) {
                            // console.log(authAccountModel);
                            if (!angular.isDefined(newVal)) {
                                return;
                            }

                            // set the last menu
                            // we need this for authAccountModel changes
                            // when it is changed, we would never know what the menu was otherwise.
                            last_menu = newVal;


                            // we should call proceed here, as well.
                            // module menu will be set at controller level
                            // which is by then menu should have been generated here
                            // and we should regenerate it.
                            proceed(last_menu);

                        }, true);


                    }
                };

                return directive_object;
            }]);

})(window.angular);