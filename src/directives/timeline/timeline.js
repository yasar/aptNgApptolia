;(function (angular) {
    'use strict';
    var path = 'directives/timeline';
    angular.module('ngApptolia')
        .directive('aptTimeline', [function () {
            return {
                bindToController: {
                    source: '<?'
                },
                scope           : {},
                replace         : true,
                restrict        : 'E',
                templateUrl     : path + '/timeline.tpl.html',
                controller      : function () {
                },
                controllerAs    : 'vmTimeline',
            }
        }]);
})(window.angular);