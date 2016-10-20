/**
 * Created by yasar on 30.01.2016.
 */


;(function () {
    angular.module('ngApptolia').factory('aptMenuSlotButtonMenu', fn);

    fn.$inject = ['aptAuthorizationService', 'aptAuthEnumService'];
    function fn(authorization, enums) {
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
                    aInLiWithSubMenuClass: null,
                    columnCount          : 2
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

            var scope       = {
                    itemData: angular.element(service.element).scope().row
                },
                $menuHolder = null;

            ctr++;


            if (parent.is('div')) {
                $menuHolder = parent;
            } else {
                $menuHolder = angular.element('<div></div>');
                if (ctr > 0 && service.config.ulIsSubMenuClass !== null) {
                    $menuHolder.addClass(service.config.ulIsSubMenuClass);
                }
                parent.append($menuHolder);
            }

            $menuHolder.addClass('row');
            for (var i = 1; i <= service.config.columnCount; i++) {
                $menuHolder.append('<div class="col-xs-' + (12 / service.config.columnCount) + '"></div>');
            }

            var colCtr = 0;
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

                var textHtml;
                if (service.config.translate){
                    textHtml='<span translate>' + menuItem.text + '</span>';
                }else {
                    textHtml='<span>' + menuItem.text + '</span>';
                }

                var $button = angular.element('<button class="btn ' + menuItem.class + ' btn-block btn-float btn-float-lg" ' +
                    '>' + textHtml + '</button>');

                if (menuItem.click) {
                    $button.click(function () {
                        menuItem.click(scope.itemData);
                    });
                }

                if (menuItem.icon) {
                    $button.prepend('<i class="' + menuItem.icon + '"></i>');
                }

                $menuHolder.find('div:nth-child(' + (colCtr % service.config.columnCount + 1) + ')').append($button);

                colCtr++;
            });

        }
    }


})();