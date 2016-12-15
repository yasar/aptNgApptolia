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

                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('addEventSource', event_source);
                },

                removeEventSource: function (calendar_name, event_source) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('removeEventSource', event_source);
                },


                getEventSources: function () {
                    return event_sources;
                },

                findEvent: function (filter) {
                    return vars.events[_.findIndex(vars.events, filter)];
                },

                rerender: function (calendar_name) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('rerenderEvents');
                },

                refetchEvents: function (calendar_name) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('refetchEvents');
                },

                remove: function (id, calendar_name) {
                    if (id == null || angular.isUndefined(id)) {
                        return;
                    }

                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('removeEvents', id);
                },

                removeAllEvents: function (calendar_name) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('removeEvents');
                },

                updateEvent: function (calendar_name, event) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('updateEvent', event);
                },

                addEventToEventSource: function (calendar_name, event) {
                    if (!uiCalendarConfig.calendars[calendar_name]) {
                        return;
                    }

                    uiCalendarConfig.calendars[calendar_name].fullCalendar('renderEvent', event, true);
                }


            };

            return serviceObj;
        }]);

})(angular.module('apt.calendar'));