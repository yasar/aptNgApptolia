/**
 * Created by murat on 26.08.2015.
 */



(function (app) {

    app.directive('aptCalendar', ['$timeout', function ($timeout) {
        return {
            restrict    : 'A', // ACME
            scope       : {
                calendar_name         : '@calendarName',
                toggleableEventSources: '=?',
                configCalendar        : '='
            },
            templateUrl : 'modules/calendar/calendar.tpl.html',
            controller  : controllerFn,
            controllerAs: 'VM',
            link        : linkFn
        };

        function linkFn() {
            // $timeout(function () {
            //     // $(".styled").uniform({
            //     //     radioClass: 'choice'
            //     // });
            // }, 1000);
        }

    }]);

    controllerFn.$inject = ['$scope', 'uiCalendarConfig', 'CalendarService', 'NotifyingService'];
    function controllerFn($scope, uiCalendarConfig, CalendarService, NotifyingService) {

        var is_ready = false;

        var viewRender = function (view, element) {

            if (!is_ready && $scope.configCalendar.notifyReady) {
                NotifyingService.notify('calendar:ready', {
                    start: view.intervalStart,
                    end  : view.intervalEnd,
                    view : view
                });
                is_ready = true;
                return;
            }

            NotifyingService.notify('calendar:render', {
                start: view.intervalStart,
                end  : view.intervalEnd,
                view : view
            });
        };


        var eventClick = function (date, jsEvent, view) {

            if (!$scope.configCalendar.eventClick) {
                return;
            }

            if (date.hasOwnProperty('callback') && date.callback.hasOwnProperty('click')
                && angular.isFunction(date.callback.click)) {

                date.callback.click(date);
            } else {
                NotifyingService.notify('calendar:event-click', {date: date, view: view});
            }
        };


        var dayClick = function (date, jsevent, view) {

            if (!$scope.configCalendar.dayClick) {
                return;
            }

            NotifyingService.notify('calendar:day-click', {date: date, view: view});
        };


        var eventDrop = function (event, delta, revertFunc, jsEvent, ui, view) {


            if (!$scope.configCalendar.eventDrop) {
                return;
            }

            NotifyingService.notify('calendar:event-drop', {event: event, view: view});
        };

        var eventResize = function (event, delta, revertFunc, jsEvent, ui, view) {

            if (!$scope.configCalendar.eventResize) {
                return;
            }

            NotifyingService.notify('calendar:event-resize', {event: event, view: view});
        };

        $scope.addEvent = function () {
            var view = uiCalendarConfig.calendars[$scope.calendar_name].fullCalendar('getView');
            NotifyingService.notify('calendar:add-event-button-click', {date: null, view: view});

        };

        $scope.uiConfig = {
            calendar: {
                height            : 500,
                editable          : true,
                header            : {
                    left  : '',
                    center: 'title',
                    right : 'today prev,next'
                },
                eventStartEditable: $scope.configCalendar.eventStartEditable,
                defaultView       : 'month',
                slotDuration      : '00:10:00',
                minTime           : "06:00:00",
                maxTime           : "24:00:00",
                dayClick          : dayClick,
                eventClick        : eventClick,
                viewRender        : viewRender,
                eventResize       : eventResize,
                eventDrop         : eventDrop

            }
        };

        $scope.changeView = function (view, calendar) {

            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };

        NotifyingService.notify('calendar-ready');

        $scope.eventSources = CalendarService.getEventSources();
    }

}(angular.module("apt.calendar")) );
