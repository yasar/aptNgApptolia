/**
 * Created by yasar on 19.04.2016.
 */

(function (app) {
//return;
    var tabCtr = 0;

    // app.controller('aptPanelController', aptPanelController);

    app.directive('aptPanel', aptPanel);

    app.directive('aptPanelTitle', aptPanelTitle);
    app.directive('aptPanelHeadingElements', aptPanelHeadingElements);
    app.directive('aptPanelBody', aptPanelBody);
    app.directive('aptPanelFooter', aptPanelFooter);

    app.directive('aptPanelTab', aptPanelTab);
    app.directive('aptPanelTabTitle', aptPanelTabTitle);
    app.directive('aptPanelTabBody', aptPanelTabBody);

    var path = 'directives/panel';


    function aptTab() {
        this.title      = null;
        this.body       = null;
        this.isActive   = false;
        this.bodyClass  = null;
        this.titleClass = null;
    }

    aptPanel.$inject = ['$injector'];
    function aptPanel($injector) {
        return {
            restrict    : 'E',
            replace     : true,
            transclude  : true,
            templateUrl : path + '/panel.tpl.html',
            link        : link,
            controller  : aptPanelController,
            controllerAs: 'vmPanel'
        };

        function link(scope, element, attrs, panelCtrl, transclude) {

            var $timeout      = $injector.get('$timeout');
            var $compile      = $injector.get('$compile');
            var customContent = null;

            transclude(scope.$new(), function (clone, newScope) {
                if (clone.length > 0) {
                    customContent = clone;
                }
            });

            if (attrs.form) {
                panelCtrl.form = attrs.form;
            }

            if (attrs.class) {
                panelCtrl.class = attrs.class;
            }

            panelCtrl.process(function () {
                if (customContent) {
                    if (element.find('.panel-footer').length) {
                        $(customContent).insertBefore(element.find('.panel-footer'));
                    } else {
                        element.append(customContent);
                    }
                }
            });
        }
    }

    aptPanelController.$inject = ['$element', '$scope', '$compile', 'aptTempl', '$injector'];
    function aptPanelController(element, $scope, $compile, aptTempl, $injector) {
        var vm             = this;
        var $timeout       = $injector.get('$timeout');
        vm.tabs            = [];
        vm.title           = null;
        vm.headingElements = null;
        vm.body            = null;
        vm.footer          = null;
        vm.icon            = null;
        vm.form            = null;
        vm.class           = null;

        vm.addTab = function (tab) {
            vm.tabs.push(tab);
            return tab;
        };

        vm.process = function (callback) {

            /**
             * we may have <apt-panel-heading-elements /> defined in the body,
             * so processing the body in the first place, will let us to parse those elements
             * in the proper place.
             *
             * so, first process the body, and do the rest in the next cycle (timeout!).
             */
            processBody();
            $timeout(proceed);

            function proceed() {
                processTitle();
                processHeadingElements();
                processTabs();
                processFooter();

                applyFixes();
                callback();
            }

            function applyFixes() {
                if (vm.class) {
                    element
                    // .removeClass()
                        .addClass(vm.class);
                }

                if (!vm.title && !vm.headingElements && vm.tabs.length == 0) {
                    element.find('.panel-heading').remove();
                } else if (vm.headingElements && vm.tabs.length == 0) {
                    element.find('.heading-elements').removeClass('panel-tabs');
                }

                // element.find('apt-panel, apt-panel-title, apt-panel-body').remove();
            }

            function processTitle() {
                if (!vm.title) {
                    element.find('.panel-title').remove();
                    return;
                }

                var pt = element.find('.panel-title');
                pt.append(vm.title);

                if (vm.icon) {
                    pt.prepend('<i class="' + vm.icon + '"></i>');
                }
            }

            function processHeadingElements() {
                // element.find('.heading-elements').append(vm.headingElements);

                /**
                 * above code did not work for save button on /access_write/manager page
                 * so keep an attention on if anything breaks due to this change.
                 */
                var compiled = $compile(vm.headingElements)($scope);
                element.find('.heading-elements').append(compiled);
            }

            function processBody() {
                if (!vm.body) {
                    element.find('.panel-body').remove();
                    return;
                }
                // element.find('.panel-body').append(vm.body);
                element.find('.panel-body').append(vm.body.contents());
            }

            function processFooter() {
                if (!vm.footer) {
                    element.find('.panel-footer').remove();
                    return;
                }

                if (aptTempl.appConfig.theme == 'limitless13') {
                    limitless13();
                } else {
                    side('left');
                    side('right');
                }

                function side(which) {

                    var $el       = vm.footer;
                    var $template = element;

                    var holder  = angular.element('<ul class="pull-' + which + '"></ul>');
                    var $footer = $el.find('apt-panel-footer-' + which);
                    if (!$footer) {
                        $footer = $el.find('.form-actions-' + which);
                    }

                    if (!_.isUndefined($footer.attr('defaults')) && !$footer.attr('defaults') && vm.form) {
                        $footer.addClass('btn-group-xs');
                        var button = '' +
                                     '<apt-button ' +
                                     'type="button" ' +
                                     'action-type="cancel" ' +
                                     'label="\'Cancel\'" ' +
                                     'data-ng-click="' + vm.form + '.cancel()"></apt-button>' +
                                     '<apt-button ' +
                                     'type="submit" ' +
                                     'action-type="post" ' +
                                     'label="' + vm.form + '.submitLabel" ' +
                                     'ng-disabled="{{' + vm.form + '.name}}.$invalid" ' +
                                     'is-busy="' + vm.form + '.isSaving"  ' +
                                     'is-failed="' + vm.form + '.isSavingFailed"></apt-button>';

                        //$footer.html($compile(button)($scope));
                        $footer.html(button);
                    }

                    $footer.children().each(function () {
                        $('<li class="dropdown"></li>').append(this).appendTo(holder);
                    });

                    if (holder.length) {
                        $template.find('.panel-footer').append(holder);
                        $compile(holder)($scope);
                    }
                }

                function limitless13() {

                    var $el       = vm.footer;
                    var $template = element;

                    var holder = $('<div class="heading-elements"></div>');

                    var $footerLeft = $el.find('apt-panel-footer-left');
                    if ($footerLeft) {
                        holder.append('<span class="heading-text text-semibold">' + $footerLeft.html() + '</span>');
                    }

                    var $footer = $el.find('apt-panel-footer-right');
                    if (!$footer) {
                        $footer = $el.find('.form-actions-right');
                    }

                    if ($footer) {

                        if (!_.isUndefined($footer.attr('defaults')) && !$footer.attr('defaults') && vm.form) {
                            $footer.addClass('btn-group-xs');
                            var button = '' +
                                         '<apt-button ' +
                                         'type="button" ' +
                                         'action-type="cancel" ' +
                                         'label="\'Cancel\'" ' +
                                         'data-ng-click="' + vm.form + '.cancel()"></apt-button>' +
                                         '<apt-button ' +
                                         'type="submit" ' +
                                         'action-type="post" ' +
                                         'label="' + vm.form + '.submitLabel" ' +
                                         'ng-disabled="{{' + vm.form + '.name}}.$invalid || !{{' + vm.form + '.name}}.$dirty" ' +
                                         'is-busy="' + vm.form + '.isSaving"  ' +
                                         'is-failed="' + vm.form + '.isSavingFailed"></apt-button>';

                            $footer.html($compile(button)($scope));
                            // $footer.html(button);
                        }
                        var $innerHolder = $('<div class="heading-btn pull-right"></div>');
                        holder.append($innerHolder);

                        $footer.children().each(function () {
                            $innerHolder.append(this);
                            $innerHolder.append('\n\r'); // required for spacing
                        });

                        holder.append('<a class="heading-elements-toggle"><i class="icon-more"></i></a>');
                    }

                    if (holder.length) {
                        if ($template.find('.panel-footer').length) {
                            $template.find('.panel-footer').append(holder);
                        } else {
                            var _footer = $('<div class="panel-footer"></div>');
                            _footer.append(holder);
                            $template.append(_footer);
                        }

                        /**
                         * REMOVED!!
                         * compile will cause click events to fire up twice.
                         * so we have removed it.
                         */
                        // $compile(holder)($scope);
                    }
                }


            }

            function processTabs() {
                if (vm.tabs.length == 0) {
                    element.find('.panel-tab-content').remove();
                    return;
                }

                element.find('.panel-tabs').empty();
                var elTabsHolder = angular.element('<ul class="nav nav-tabs nav-tabs-bottom"></ul>');
                element.find('.panel-tabs').append(elTabsHolder);

                var elContentHolder = element.find('.panel-tab-content');

                _.forEach(vm.tabs, function (aptTab, key) {
                    if (_.isUndefined(aptTab)) {
                        throw new Error('tab is undefined. check the code !');
                    }

                    var elTab = $('<li></li>');

                    if (aptTab.titleClass) {
                        // elTab.removeClass().addClass(aptTab.titleClass);
                        elTab.addClass(aptTab.titleClass);
                    }

                    tabCtr++;

                    ///

                    var elTitle = angular.element('<a href="#panel-tab' + tabCtr + '" data-toggle="tab"></a>').append(aptTab.title);

                    var elContent = $('<div class="tab-pane" id="panel-tab' + tabCtr + '"></div>').append(aptTab.body);

                    if (aptTab.bodyClass) {
                        // elContent.removeClass().addClass(aptTab.bodyClass);
                        elContent.addClass(aptTab.bodyClass);
                    }

                    if (aptTab.isActive) {
                        /**
                         * put the active class on elTab rather than elTitle
                         */
                        elTab.addClass('active');
                        elContent.addClass('active');
                    }


                    elTab.append(elTitle);
                    elTabsHolder.append(elTab);
                    elContentHolder.append(elContent);
                });

            }
        }
    }

    function aptPanelTitle() {
        return {
            restrict  : 'E',
            transclude: 'element',
            link      : link,
            controller: function () {
                // Empty controller is needed for child directives to require this directive
            }
        };

        function link(scope, element, attrs, panelTitleCtrl, transclude) {
            if (!_.has(scope, '$parent.vmPanel')) {
                return;
            }

            var panelCtrl = scope.$parent.vmPanel;
            transclude(scope, function (clone) {
                panelCtrl.title = clone;
            });

            if (_.has(attrs, 'icon')) {
                panelCtrl.icon = attrs.icon;
            }
        }

    }

    function aptPanelHeadingElements() {
        return {
            restrict  : 'E',
            transclude: true,
            link      : link
        };

        function link(scope, element, attrs, panelTitleCtrl, transclude) {
            // if (!_.has(scope, '$parent.vmPanel')) {
            if (!scope.$parent.vmPanel) {
                return;
            }

            var panelCtrl = scope.$parent.vmPanel;
            transclude(scope, function (clone) {
                panelCtrl.headingElements = clone;
            });
        }

    }

    function aptPanelBody() {
        return {
            restrict  : 'E',
            transclude: 'element',
            link      : link
        };

        function link(scope, element, attrs, panelBodyCtrl, transclude) {
            var panelCtrl = scope.$parent.vmPanel;
            transclude(scope, function (clone) {
                panelCtrl.body = clone;
            });
        }
    }

    function aptPanelFooter() {
        return {
            restrict  : 'E',
            transclude: 'element',
            link      : link
        };

        function link(scope, element, attrs, panelBodyCtrl, transclude) {
            var panelCtrl = scope.$parent.vmPanel;
            transclude(scope, function (clone) {
                panelCtrl.footer = clone;
            });
        }
    }

    function aptPanelTab() {
        return {
            restrict    : 'E',
            transclude  : 'element',
            terminal    : true,
            controller  : panelTabCtrl,
            controllerAs: 'vmPanelTab',
            link        : link
        };
        function link(scope, element, attrs, panelTabCtrl, transclude) {
            var panelCtrl = scope.$parent.vmPanel;
            if (_.has(attrs, 'active')) {
                panelTabCtrl.panelTab.isActive = true;
            }

            transclude(scope, function (clone) {
                panelCtrl.addTab(panelTabCtrl.panelTab);
            });
        }

        function panelTabCtrl() {
            var vm      = this;
            vm.panelTab = new aptTab();
        }
    }

    function aptPanelTabTitle() {
        return {
            restrict  : 'E',
            transclude: true,
            require   : '^aptPanelTab',
            link      : link
        };

        function link(scope, element, attrs, panelTabCtrl, transclude) {

            if (_.has(attrs, 'class')) {
                panelTabCtrl.panelTab.titleClass = attrs.class;
            }

            transclude(scope, function (clone) {
                panelTabCtrl.panelTab.title = clone;
            });
        }
    }

    aptPanelTabBody.$inject = ['$injector'];
    function aptPanelTabBody($injector) {
        return {
            restrict  : 'E',
            transclude: 'element',
            require   : '^aptPanelTab',
            link      : link
        };

        function link(scope, element, attrs, panelTabCtrl, transclude) {

            var $timeout = $injector.get('$timeout');
            var $compile = $injector.get('$compile');


            if (_.has(attrs, 'class')) {
                panelTabCtrl.panelTab.bodyClass = attrs.class;
            }

            transclude(scope, function (clone) {
                panelTabCtrl.panelTab.body = clone;
            });
        }
    }

})(angular.module('ngApptolia'));
