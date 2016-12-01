/**
 * Created by yasar on 24.01.2016.
 */

;(function () {
    angular.module('ngApptolia').factory('aptMenuTableRowMenu', fn);

    fn.$inject = ['$injector'];
    function fn($injector) {
        var aptAuthorizationService = $injector.get('aptAuthorizationService');
        var aptIcon                 = $injector.get('aptIcon');
        var aptUtils                = $injector.get('aptUtils');
        var $interpolate            = $injector.get('$interpolate');
        var service                 = {
            config : null,
            menu   : null,
            element: null,
            scopeId: null,
            build  : buildFn
        };
        var ctr                     = 0;

        return service;

        function buildFn() {
            if (!service.menu.children.length) {
                return;
            }

            service.config = angular.merge({
                ulIsSubMenuClass     : null,
                liHasSubMenuClass    : null,
                aInLiWithSubMenuClass: null,
                icon                 : aptIcon.get('item-menu')
            }, service.config);

            var $menuEl = $('<ul></ul>');
            buildMenu(service.menu, $menuEl);

            var holderTpl = '<ul class="icons-list">' +
                            '<li class="dropdown">' +
                            '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
                            '<i class="' + service.config.icon + '"></i>';
            if (service.config.iconNext) {
                holderTpl += '<span class="' + service.config.iconNext + '"></span>';
            }
            holderTpl += '</a>' +
                         '</li>' +
                         '</ul>';
            var $holder = $(holderTpl);
            $holder
                .find('li')
                .append($menuEl.addClass('dropdown-menu dropdown-menu-xs dropdown-menu-right bg-slate-300'));
            // service
            //     .element
            //     .append(
            //         $holder
            //             .find('li')
            //             .append($menuEl.addClass('dropdown-menu dropdown-menu-xs dropdown-menu-right bg-slate-300')).end()
            //     );
            service.element.append(service.element.is('ul') ? $holder.contents() : $holder);
        }

        function buildMenu(menu, parent) {


            if (!menu.children.length) {
                return;
            }

            // var elementScope = angular.element(service.element).scope();
            // var elementScope = service.element.scope;
            var elementScope = aptUtils.getScopeById(service.scopeId);
            var scope        = {itemData: elementScope.row || elementScope.item || elementScope.itemData};
            var $ul          = null;

            ctr++;

            if (parent.is('ul')) {
                $ul = parent;
            } else {
                $ul = angular.element('<ul></ul>');
                if (ctr > 0 && service.config.ulIsSubMenuClass !== null) {
                    $ul.addClass(service.config.ulIsSubMenuClass);
                }
                parent.append($ul);
            }

            if (service.config.showPKeyId) {
                $ul.append('<li class="dropdown-header">ID: ' + scope.itemData[service.config.pkey] + '</li>');
            }

            _.forEach(menu.children, function (menuItem, key) {
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

                ///

                if (menuItem.hasOwnProperty('auth')
                    && menuItem.auth
                    && !aptAuthorizationService.isAuthorized(menuItem.auth)) {
                    return;
                }

                ///

                var $li         = angular.element('<li></li>');
                var hasChildren = false;
                if (menuItem.hasOwnProperty('children') && menuItem.children.length > 0) {
                    hasChildren = true;
                }

                if (hasChildren && service.config.liHasSubMenuClass !== null) {
                    $li.addClass(service.config.liHasSubMenuClass);
                }
                $ul.append($li);

                var $a = angular.element('<a></a>');
                if (hasChildren && service.config.aInLiWithSubMenuClass !== null) {
                    $a.addClass(service.config.aInLiWithSubMenuClass);
                }

                if (menuItem.href) {
                    $a.attr('ng-href', menuItem.href);
                }

                if (menuItem.segment) {
                    if (_.isArray(menuItem.segment)) {
                        var paramObj = menuItem.segment[1];
                        _.forEach(paramObj, function (value, key) {
                            paramObj[key] = $interpolate(value)(scope.itemData);
                        });

                        // $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment[0], paramObj));
                        $a.attr('ui-sref', menuItem.segment[0] + '(' + angular.toJson(paramObj) + ')');
                    } else {
                        // $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment));
                        $a.attr('ng-href', menuItem.segment);
                    }
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

                if (service.config.translate) {
                    $a.append('<span translate>' + menuItem.text + '</span>');
                } else {
                    $a.append('<span>' + menuItem.text + '</span>');
                }

                $li.append($a);

                if (menuItem.children) {
                    buildMenu(menuItem, $li);
                }
            });
        }
    }
})();