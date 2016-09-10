/**
 * Created by yasar on 12.12.2015.
 */



(function (app) {
    //return;
    app.directive('aptPanelBasic', fn);

    function fn() {
        var directiveObject = {
            //scope: {},
            replace     : true,
            priority    : 100,
            transclude  : {
                title          : '?aptPanelTitle',
                headingElements: '?aptPanelHeadingElements',
                body           : '?aptPanelBody',
                footer         : '?aptPanelFooter'
            },
            restrict    : 'E',
            templateUrl : 'directives/panel/panel-basic.tpl.html',
            controller  : ['$attrs', '$scope', '$element',
                function ($attrs, $scope, $element) {
                    var vm = this;


                }],
            controllerAs: 'vm',
            compile     : function (element, attrs) {

                throw new Error('use apt-panel-with-tab instead');

                element.removeAttr('apt-panel');
                element.removeAttr('data-apt-panel');
                element.find('apt-panel-title').remove();
                delete attrs.aptPanel;

                return {
                    post: function (scope, element, attrs, ctrl, $transclude) {
                        if (!$transclude.isSlotFilled('title')) {
                            element.find('.panel-heading').remove();
                        }

                        if (!$transclude.isSlotFilled('body')) {
                            element.find('.panel-body').remove();
                        }

                        if (!$transclude.isSlotFilled('footer')) {
                            element.find('.panel-footer').remove();
                        }

                        if (!$transclude.isSlotFilled('headingElements')) {
                            element.find('.heading-elements').remove();
                        }
                    }
                };

            }
        };

        return directiveObject;

    }

})(angular.module('ngApptolia'));