/**
 * Created by yasar on 04.12.2015.
 */


(function (app) {

    app.directive('aptDropdown', [
        '$compile',
        function ($compile) {

            var directiveObject = {
                replace: true,
                restrict: 'EA',
                priority: 20,
                transclude: true,
                compile: function(elem, attrs){
                    elem.removeAttr('apt-dropdown');
                    elem.removeAttr('data-apt-dropdown');

                    delete attrs.aptDropdown;


                    elem
                        .addClass('input-group-btn')
                        .attr('uib-dropdown', ''); // add attribute
                    //.attr('uib-keyboard-nav', ''); // add attribute

                    return {
                        post: linkFn
                    };
                }
            };

            var linkFn = function (scope, elem, attrs, ctrl, transcludeFn) {
                transcludeFn(scope, function (clone) {
                    var label = '',
                    labelClass = null,
                    $label = null,
                    $menu = null;

                    angular.forEach(clone, function (el, key) {
                        var $el = angular.element(el);
                        var tagName = $el.prop('tagName');
                        if (tagName) {
                            switch (tagName.toLowerCase()) {
                                case 'label':
                                    label = $el.html();
                                    labelClass = $el.attr('class').replace(/ng-scope/g,'');
                                    break;
                                case 'ul':
                                    $menu = $el;
                                    break;
                            }
                        }
                    });

                    $label = angular.element('<button type="button" class="btn btn-' + (labelClass ? labelClass : 'default') + '" uib-dropdown-toggle>' + label + '</ button> ');
                    //$menu.addClass('uib-dropdown-menu').attr('role', 'menu');
                    $menu.addClass('dropdown-menu').attr('role', 'menu');

                    elem
                        .append($label)
                        .append($menu);

                    $compile(elem)(scope);
                });

            };



            return directiveObject;

        }]);

})(angular.module('ngApptolia'));


