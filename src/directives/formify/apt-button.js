/**
 * Created by yasar on 10.10.2015.
 */


(function () {

    angular.module('ngApptolia').directive('aptButton', fn);

    fn.$inject = ['gettextCatalog', '$templateCache', '$compile', '$timeout'];
    function fn(gettextCatalog, $templateCache, $compile, $timeout) {
        return {
            scope       : true,
            restrict    : 'E',
            controller  : controllerFn,
            controllerAs: 'vmButton',
            compile     : function () {
                return {
                    pre: linkFn
                }
            }
        };

        /**
         * attrs can have:
         *      type
         *      label
         *      iconPosition (left|right, default: right)
         *      actionType (post|cancel)
         *      isBusy
         *      isFailed
         */

        function linkFn(scope, elem, attrs, ctrl) {
            var vm = scope.vmButton;
            var label, isBusy, isFailed;
            if (angular.isDefined(attrs.label)) {
                label = attrs.label;
            } else {
                label = '"Button"';
            }

            angular.isDefined(attrs.actionType) && delete attrs.actionType;
            angular.isDefined(attrs.label) && delete attrs.label;

            if (!_.isUndefined(attrs.isBusy)) {
                isBusy = attrs.isBusy;
            } else {
                isBusy = false;
            }

            if (!_.isUndefined(attrs.isFailed)) {
                isFailed = attrs.isFailed;
            } else {
                isFailed = false;
            }

            var $tpl = $('<button type="' + attrs.type + '" ng-disabled="' + isBusy + '" ' +
                'ng-class="{\'' + scope.vmButton.buttonClass + '\': !' + isBusy + ', \'' + vm.busyButtonClass + '\': ' + isBusy + ', \'' + vm.failedButtonClass + '\': ' + isFailed + '}"></button>');
            $tpl.append('<span data-ng-bind="' + label + '|translate"></span>');
            $tpl.append('<i ng-class="{\'' + vm.iconClass + '\': !' + isBusy + ', \'' + vm.busyIconClass + '\': ' + isBusy + ', \'' + vm.failedIconClass + '\': ' + isFailed + '}"></i>');


            /**
             * transfer the attributes,
             * note the usage of context in forEach, ie $tpl.
             */
            angular.forEach(
                attrs,
                function (value, key) {
                    if (['$$element', '$attr', '$scope'].indexOf(key) !== -1) {
                        return;
                    }

                    if (['type', 'label', 'action-type', 'icon-position', 'is-busy'].indexOf(key) !== -1) {
                        return;
                    }

                    this.attr(attrs.$attr[key], value);
                },
                $tpl);


            $timeout(function () {
                var compiledEl = $compile($tpl)(scope);
                elem.replaceWith(compiledEl);
            });

        };
    };

    controllerFn.$inject = ['$injector', '$attrs'];
    function controllerFn($injector, $attrs) {
        var vm         = this;
        vm.icon        = ''
        vm.buttonClass = 'btn';

        vm.busyIconClass   = 'icon-spinner9 spinner';
        vm.busyButtonClass = 'btn btn-warning';

        vm.failedIconClass   = 'icon-times';
        vm.failedButtonClass = 'btn btn-danger';

        vm.iconPositon = $attrs.iconPosition ? $attrs.iconPosition : 'right';

        switch ($attrs.actionType) {
            case 'post':
                vm.iconClass = 'icon-database-upload';
                vm.buttonClass += ' btn-primary btn-xs';
                break;
            case 'import':
                vm.iconClass = 'icon-import';
                vm.buttonClass += ' btn-default btn-xs';
                break;
            case 'cancel':
                vm.iconClass = 'icon-cancel-circle2';
                vm.buttonClass += ' btn-default btn-xs';
                break;
        }

        vm.iconClass += ' position-' + vm.iconPositon;
        vm.busyIconClass += ' position-' + vm.iconPositon;
    };

})();


