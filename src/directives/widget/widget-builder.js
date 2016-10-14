/**
 * Created by yasar on 24.07.2016.
 */
;(function () {
    // var builder = dashboardBuilder;
    // var name    = 'widget';

    angular.module('ngApptolia')
        .directive('aptWidgetBuilder', Directive);

    Directive.$inject = ['$injector']
    function Directive($injector) {
        return {
            restrict        : 'EA', // ACME
            scope           : {
                viewType     : '@?',
                params       : '<?',
                onGraphCreate: '&?'
            },
            templateUrl     : function (elem, attrs) {

                var viewType = attrs.viewType || 'default';
                return 'directives/widget/' + viewType + '.tpl.html';
            },
            link            : Link,
            controller      : Controller,
            controllerAs    : 'vmWidgetBuilder',
            bindToController: true
        };

        function Link($scope) {
            var $timeout = $injector.get('$timeout');
            var vm       = $scope.vmWidgetBuilder;
            if (_.isFunction(vm.onGraphCreate)) {
                /**
                 * graphApi is not ready at this cycle,
                 * tiemout is required for the next cycle.
                 */
                $timeout(function () {
                    vm.onGraphCreate({graphApi: vm.graphApi});
                });
            }
        }
    }

    Controller.$inject = ['$injector'];
    function Controller($injector) {
        var vm      = this;
        var aptMenu = $injector.get('aptMenu');

        /**
         * this will be set within the directive
         * check the html to see where it is assigned to.
         */
        vm.graphApi = null;

        _.defaults(vm.params, {
            title           : null,
            subTitle        : null,
            description     : null,
            color           : null,
            headingMenuItems: null,
            graph           : {
                type: null,
                data: null
            }
        });

        var headingMenu = null;
        if (_.isArray(vm.params.headingMenuItems) && vm.params.headingMenuItems.length > 0) {
            headingMenu = aptMenu.Item({name: vm.params.builder.Domain + 'WidgetMenu'});
            _.forEach(vm.params.headingMenuItems, function (menuItem) {
                headingMenu.addChild(menuItem);
            });
        }

        vm.conf = {
            bgColor          : vm.params.color ? 'bg-' + vm.params.color + '-400' : 'bg-default',
            headingMenu      : headingMenu,
            headingMenuConfig: {
                icon    : 'icon-menu5',
                // iconNext: 'fa fa-angle-down'
            }
        };


        if (vm.params.graph.type) {
            vm.hasGraph = true;
            vm.conf     = _.set(vm.conf, 'graph', vm.params.graph);
        }

    }
})();