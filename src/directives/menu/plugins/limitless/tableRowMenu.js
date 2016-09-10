/**
 * Created by yasar on 24.01.2016.
 */

(function () {
    angular.module('ngApptolia').factory('aptMenuTableRowMenu', fn);

    fn.$inject = ['aptAuthorizationService', 'aptAuthEnumService', '$interpolate', '$routeSegment'];
    function fn(authorization, enums, $interpolate, $routeSegment) {
        var service = {
                config : null,
                menu   : null,
                element: null,
                build  : buildFn
            },
            ctr     = 0;

        return service;

        function buildFn() {
            if (!service.menu.children.length) {
                return;
            }

            /*if (angular.isUndefined(service.config)) {
             service.config = {
             ulIsSubMenuClass     : null,
             liHasSubMenuClass    : null,
             aInLiWithSubMenuClass: null,
             icon                 : 'icon-more'
             };
             }*/

            service.config = angular.merge({
                ulIsSubMenuClass     : null,
                liHasSubMenuClass    : null,
                aInLiWithSubMenuClass: null,
                icon                 : 'icon-more'
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
            service.element.append($holder.find('li').append($menuEl.addClass('dropdown-menu dropdown-menu-right')).end());
        }

        function buildMenu(menu, parent) {


            if (!menu.children.length) {
                return;
            }

            var elementScope = angular.element(service.element).scope();
            var scope        = {
                    itemData: elementScope.row || elementScope.item
                },
                $ul          = null;

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

                if (hasChildren && service.config.liHasSubMenuClass !== null) {
                    $li.addClass(service.config.liHasSubMenuClass);
                }
                $li.attr('ui-sref-active-eq', 'active');
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

                        $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment[0], paramObj));
                    } else {
                        $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment));
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

                // $a.append('<span>' + menuItem.text + '</span>');
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

            /*if (parent.hasClass('icons-list')) {
             parent.removeClass('icons-list');
             }
             var $holder = '<ul class="icons-list">' +
             '<li>' +
             '<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-menu7"></i></a>' +
             '</li>' +
             '</ul>';
             parent      = $holder.find('li').append(parent.clone());*/
        }
    }


})();