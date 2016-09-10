/**
 * Created by yasar on 06.09.2015.
 */

(function (app) {
    /**
     * source: http://www.codelord.net/2015/05/04/angularjs-notifying-about-changes-from-services-to-controllers/
     * jsfiddle: http://jsfiddle.net/avivby/msjkv72r/
     *
     * just a bit modified for our own needs.
     */
    app.factory('NotifyingService', [
        '$rootScope',
        '$timeout',
        function ($rootScope, $timeout) {
            return {
                subscribe: function (scope, event, callback, once, lifo) {
                    var handler;
                    var eventName = 'notifying-service-event:' + event;

                    handler = $rootScope.$on(eventName, once ? function (event, stay) {
                        //callback();
                        //callback.apply(arguments);
                        callback(event, stay);
                        handler();
                    } : callback);

                    /**
                     * event listeners are executed in the order of initialization.
                     * lifo means last in first out
                     * which means last added listener should be called first.
                     * here we manually change the listeners array of the angular's core.
                     *
                     */
                    if (!_.isUndefined(lifo) && lifo) {
                        var listener, listenersArray;
                        listenersArray = $rootScope.$$listeners[eventName];
                        listener       = listenersArray[listenersArray.length - 1];
                        listenersArray.splice(listenersArray.length - 1, 1);
                        listenersArray.unshift(listener);
                    }

                    if (scope) {
                        scope.$on('$destroy', handler);
                    }

                    return handler;
                },

                notify: function (event, data, timeout) {
                    var emit = function () {
                        $rootScope.$emit('notifying-service-event:' + event, data);
                    };

                    if (angular.isNumber(timeout)) {
                        $timeout(function () {
                            emit();
                        }, timeout);
                    } else {
                        emit();
                    }

                }
            };
        }]
    );


})(angular.module('ngApptolia'));