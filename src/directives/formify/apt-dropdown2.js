/**
 * Created by yasar on 04.12.2015.
 */


(function (app) {

    app.directive('aptDropdown2', [
        '$compile',
        function ($compile) {
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
                        //.addClass('input-group-btn')
                        //.attr('uib-dropdown', '') // add attribute
                        //.attr('uib-keyboard-nav', '') // add attribute
                        //.empty()
                        .append($label)
                        .append($menu);

                    //elem.replaceWith($compile(elem)(scope));


                    //elem.removeAttr('uib-dropdown');
                    $compile(elem)(scope);


                    //elem.removeAttr('apt-dropdown');
                    //elem.removeAttr('data-apt-dropdown');
                });

            };

            var directiveObject = {
                replace: true,
                restrict: 'EA',
                priority: 20,
                transclude: true,
                link2: linkFn,
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

            return directiveObject;

        }]);

})(angular.module('ngApptolia'));


