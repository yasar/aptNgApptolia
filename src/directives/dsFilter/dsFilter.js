;(function () {

    angular.module('ngApptolia').directive('aptDsFilter', Directive);

    function Directive() {
        return {
            restrict        : 'EA',
            bindToController: {
                // datasource : '=datasource',
                filterReset: '<?resetObj',
                builder    : '@'
            },
            controllerAs    : 'vmDsFilter',
            controller      : Controller,
        };
    }

    Controller.$inject = ['$scope', '$injector'];
    function Controller($scope, $injector) {
        var vm               = this;
        var aptUtils         = $injector.get('aptUtils');
        var $filter          = $injector.get('$filter');
        var NotifyingService = $injector.get('NotifyingService');
        var $window          = $injector.get('$window');
        var builder          = $window[vm.builder];
        var service          = $injector.get(builder.getServiceName('service'));
        var _datasource      = null;

        NotifyingService.subscribe($scope, builder.getEventName('loaded'), function (event, result) {
            _datasource = _.clone(result.data);
        });

        $scope.filterObj = vm.filterReset ? _.clone(vm.filterReset) : {};
        $scope.reset     = reset;
        $scope.apply     = apply;


        function reset() {
            $scope.filterObj = vm.filterReset ? _.clone(vm.filterReset) : {};
            service.setRepo(_datasource);
        }

        function apply() {
            var filterApply = $scope.filterObj;
            /**
             * null values should be removed from filter.
             */
            _.forIn(filterApply, function (val, key) {
                if (val === null) {
                    delete filterApply[key];
                }
                else if (_.endsWith(key, '_id') && val === 0) {
                    delete filterApply[key];
                }
            });

            service.setRepo($filter('filter')(_datasource, filterApply));
        }
    }
})();