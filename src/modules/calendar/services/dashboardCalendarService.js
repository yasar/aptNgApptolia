/**
 * Created by unal on 23.02.2016.
 */

;(function () {
    angular.module('apt.calendar').factory('DashboardCalendarService', fn);

    fn.$inject = ['CalendarService'];

    function fn(CalendarService) {

        var calendarName = null;

        var eventSources = [];

        var serviceObj = {

                addEventSource: function (eventSource) {
                    eventSources.push(eventSource);
                    eventSource.callback.onToggle = onToggle;
                    eventSource.callback.onLoad   = onLoad;
                    onToggle();

                    function onToggle() {
                        if (eventSource.is_enabled) {
                            CalendarService.addEventSource(calendarName, eventSource.data);
                        } else {
                            CalendarService.removeEventSource(calendarName, eventSource.data);
                        }
                    }

                    function onLoad() {
                        CalendarService.removeEventSource(calendarName, eventSource.data);
                        CalendarService.addEventSource(calendarName, eventSource.data);
                    }
                },

                setCalendarName: function (name) {
                    calendarName = name;
                },

                getEventSources: function () {
                    return eventSources;
                },

                pullEvents: function (calendarObj) {
                    angular.forEach(eventSources, function (eventSource) {
                        eventSource.callback.loadEvents(calendarObj.view.start, calendarObj.view.end);
                    });
                },

                cleanEventSources: function () {
                    eventSources.splice(0, eventSources.length);
                },

            }
            ;


        return serviceObj;
    }

})();