/**
 * Created by unal on 09.12.2015.
 */


(function (app) {

    app.factory('CalendarService', [
        'uiCalendarConfig',
        function (uiCalendarConfig) {

            var vars          = {
                events: []
            };
            var event_sources = [];

            var serviceObj = {

                //addEvent: function (event) {
                //    if (event) {
                //        vars.events.push(event);
                //    }
                //},


                addEventSource: function (calendar_name, event_source) {

                    //event_sources.push(event_source);
                    uiCalendarConfig.calendars[calendar_name] && uiCalendarConfig.calendars[calendar_name].fullCalendar('addEventSource', event_source);
                },

                removeEventSource: function (calendar_name, event_source) {
                    uiCalendarConfig.calendars[calendar_name] && uiCalendarConfig.calendars[calendar_name].fullCalendar('removeEventSource', event_source);
                },


                getEventSources: function () {
                    return event_sources;
                },

                findEvent: function (filter) {
                    return vars.events[_.findIndex(vars.events, filter)];
                },

                rerender: function (calendar_name) {
                    uiCalendarConfig.calendars[calendar_name].fullCalendar('rerenderEvents');
                },

                refetchEvents: function (calendar_name) {
                    uiCalendarConfig.calendars[calendar_name].fullCalendar('refetchEvents');
                },

                remove: function (id, calendar_name) {
                    if (id == null || angular.isUndefined(id)) {
                        return;
                    }
                    uiCalendarConfig.calendars[calendar_name].fullCalendar('removeEvents', id);
                },

                removeAllEvents: function (calendarName) {

                    uiCalendarConfig.calendars[calendarName].fullCalendar('removeEvents');
                },

                updateEvent: function (calendarName, event) {
                    uiCalendarConfig.calendars[calendarName].fullCalendar('updateEvent', event);
                },

                addEventToEventSource: function (calendarName, event) {
                    uiCalendarConfig.calendars[calendarName].fullCalendar('renderEvent', event, true);
                }


            };

            return serviceObj;
        }]);

})(angular.module('apt.calendar'));