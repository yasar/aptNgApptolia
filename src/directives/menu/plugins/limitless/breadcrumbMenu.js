/**
 * Created by yasar on 30.01.2016.
 */


(function () {
    angular.module('ngApptolia').factory('aptMenuBreadcrumbMenu', fn);

    fn.$inject = ['aptAuthorizationService', 'aptAuthEnumService', '$routeSegment', 'aptUtils', '$compile'];
    function fn(authorization, enums, $routeSegment, aptUtils, $compile) {
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

            if (angular.isUndefined(service.config)) {
                service.config = {
                    ulIsSubMenuClass     : null,
                    liHasSubMenuClass    : null,
                    aInLiWithSubMenuClass: null
                };
            }

            var $menuEl = $('<div></div>');
            buildMenu(service.menu, $menuEl);
            service.element.append($menuEl);
        }

        function buildMenu(menu, parent) {


            if (!menu.children.length) {
                return;
            }

            var scope = {
                    itemData: angular.element(service.element).scope().row
                },
                $ul   = null;

            ctr++;


            if (parent.is('div')) {
                $ul = parent;
            } else {
                $ul = angular.element('<div></div>');
                if (ctr > 0 && service.config.ulIsSubMenuClass !== null) {
                    $ul.addClass(service.config.ulIsSubMenuClass);
                }
                parent.append($ul);
            }

            $ul.addClass('btn-group btn-group-xs');


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
                    if (authorization.authorize(true, menuItem.auth) == enums.authorised.notAuthorised) {
                        return;
                    }
                }


                // var $a = angular.element('<a class="btn btn-default btn-icon" title="' + menuItem.text + '"></a>');
                var $a;
                if(service.config.translate){
                    $a = angular.element('<a class="btn btn-default btn-icon" uib-tooltip="{{\'' + menuItem.text + '\'|translate}}"></a>');
                }else {
                    $a = angular.element('<a class="btn btn-default btn-icon" uib-tooltip="' + menuItem.text + '"></a>');
                }
                if (menuItem.href) {
                    $a.attr('ng-href', menuItem.href);
                }

                if (menuItem.segment) {

                    $a.attr('ng-href', $routeSegment.getSegmentUrl(menuItem.segment));
                    //$a.attr('ng-class', '{active: (\'' + menuItem.segment + '\' | routeSegmentStartsWith)}');
                    $a.attr('ng-class', '{active: $routeSegment.startsWith(\'' + menuItem.segment + '\')}');
                }

                if (menuItem.click) {
                    $a.click(function () {
                        menuItem.click(scope.itemData);
                    });
                }

                if (menuItem.icon) {
                    $a.append('<i class="' + menuItem.icon + '"></i>');
                }

                $ul.append($a);
            });

        }
    }


})();