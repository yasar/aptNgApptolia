/**
 * Created by yasar on 16.12.2015.
 */



(function (app) {

    app.directive('aptSidebarSlot', fn);

    fn.$inject = ['$parse'];
    function fn($parse) {
        var directiveObject = {
            replace: true,
            priority: 100,
            transclude: {
                'title': '?aptSidebarSlotTitle',
                'body': '?aptSidebarSlotBody'
            },
            restrict: 'E',
            templateUrl: 'directives/sidebarSlot/sidebarSlot.tpl.html',
            controller: controllerFn,
            controllerAs: 'vmSidebarSlot',
            link: linkFn
        };

        return directiveObject;

        function linkFn(scope, element, attrs) {
            var vm = scope.vmSidebarSlot;

            if (attrs.hasOwnProperty('isCollapsable'))
                vm.isCollapsable = $parse(attrs.isCollapsable)(scope);

            if (attrs.hasOwnProperty('isCollapsed'))
                vm.isCollapsed = $parse(attrs.isCollapsed)(scope);

            if (attrs.hasOwnProperty('showTitle'))
                vm.showTitle = $parse(attrs.showTitle)(scope);


            if (!vm.showTitle) {
                $(element).find('.category-title').remove();
                $(element).find('.category-content').removeAttr('uib-collapse');
            } else {
                if (!vm.isCollapsable) {
                    $(element).find('.category-title').removeAttr('ng-click');
                    $(element).find('.category-title').off('click');
                    $(element).find('.category-title').find('.icons-list').remove();
                    $(element).find('.category-content').removeAttr('uib-collapse');
                } else {
                    if (!vm.isCollapsed) {
                        $(element).find('.category-title').removeClass('.category-collapsed');
                    }
                }
            }

        }

    }

    function controllerFn() {
        var vm = this;
        vm.showTitle = true;
        vm.isCollapsable = true;
        vm.isCollapsed = true;
    };

})(angular.module('ngApptolia'));