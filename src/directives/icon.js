/*global window */
(function (angular) {
    'use strict';
    angular.module('ngApptolia')
        .factory('aptIcon', ['$injector', function ($injector) {
            return {
                get: function (name) {
                    var aptTempl = $injector.get('aptTempl');
                    var icon     = null;
                    var icons    = aptTempl.appConfig.defaults.icons[aptTempl.appConfig.iconLib];
                    if (_.has(icons, name)) {
                        icon = _.get(icons, name);
                    } else {
                        var strIcon = _.camelCase(name);
                        if (_.has(icons, strIcon)) {
                            icon = _.get(icons, strIcon);
                        }
                    }

                    var elClass = '';
                    switch (aptTempl.appConfig.iconLib) {
                        case 'fa':
                            icon    = icon || 'dot-circle-o';
                            elClass = 'fa fa-fw fa-' + icon;
                            break;
                        case 'icomoon':
                        default:
                            icon    = icon || 'primitive-dot';
                            elClass = 'icon-' + icon;
                            break;
                    }

                    return elClass;
                }
            };
        }])
        .directive('icon', ['aptIcon',
            function (aptIcon) {
                return {
                    //scope: false,
                    //replace: false,
                    link: function (scope, element, attrs) {

                        /**
                         * sometimes we may have to set the icon attribute but dont require this directive in effect.
                         * the ignore parameter is used to by-pass the directive.
                         *
                         * this has been needed when using the mfb-menu (floating menu)
                         * each menu item has a mfb-button directive which handles the icon settings internally
                         * and consequently conflicting with this directive. thats why we needed this ignore parameter.
                         */
                        if (attrs.hasOwnProperty('iconIgnore') && attrs.iconIgnore !== false) {
                            return;
                        }

                        var iconStr = '<i class="' + aptIcon.get(attrs.icon) + '"></i>';

                        if (attrs.hasOwnProperty('iconAppend') && attrs.iconAppend!='false') {
                            element.append(iconStr);
                        } else {
                            // element.replaceWith(iconStr);
                            element.addClass(aptIcon.get(attrs.icon));
                        }
                    }
                };
            }]);
})(window.angular);