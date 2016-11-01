angular.module('ngApptolia').directive('aptOffClick', ['$timeout', function ($timeout) {
    return function (scope, elem) {
        $timeout(function () {

            $(elem).off('click');
            $(elem).on('click', function (event) {
                event.stopImmediatePropagation();
            });
        });
    }
}]);