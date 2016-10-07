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
            templateUrl : function (elem, attrs) {
                _.set(attrs, 'showHelp', (_.includes(['false', undefined], _.get(attrs, 'showHelp')) ? false : _.get(attrs, 'showHelp')));
                return !attrs.showHelp ? path + '/panel.tpl.html' : path + '/panel-with-help.tpl.html';
            },
            compile     : Compile,
            controller  : aptPanelController,
            controllerAs: 'vmPanel',
            require     : ['aptPanel', '^^?form']
        };
        function Compile(element, attrs) {

            if (!!attrs.showHelp && element.closest('[uib-modal-window]').length) {
                element.addClass('border-slate-800 border-xlg');
                element.find('.panel-help-wrapper').addClass('bg-slate-800 no-margin');
                element
                    .find('.panel-help')
                    .attr('marked', '')
                    .attr('src', "'" + attrs.showHelp + "'");

                var contentWrapper = element.find('.panel-content-wrapper');
                contentWrapper.addClass('bg-slate-800 no-padding');
                contentWrapper.children('.panel-heading').addClass('bg-white no-margin');
                contentWrapper.children('.panel-body').addClass('bg-white');
                contentWrapper.children('.panel-footer').hide();
            }

            return link;

            function link(scope, element, attrs, ctrls, transclude) {

                var $timeout        = $injector.get('$timeout');
                var $compile        = $injector.get('$compile');
                var customContent   = null;
                var panelCtrl       = ctrls[0];
                var $formController = ctrls[1];

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

                panelCtrl.process($formController, function () {
                    if (customContent) {
                        if (element.find('.panel-footer').length) {
                            $(customContent).insertBefore(element.find('.panel-footer'));
                        } else {
                            element.append(customContent);
                        }
                    }
                });

                $timeout(function () {
                    /**
                     * footer section must be in the timeout.
                     * remember that we have form types of nested, in-form etc.
                     * these forms will be parsed in after compilation has been completed.
                     */
                    var contentWrapper = element.find('.panel-content-wrapper');
                    var panelFooter    = contentWrapper.children('.panel-footer');
                    panelFooter.addClass('bg-slate-300 border-slate-400 border-lg');

                    var btnSubmit = panelFooter.find(':submit');
                    btnSubmit.removeClass().addClass('bg-slate-800 btn btn-labeled btn-xs');
                    btnSubmit.find('i').wrap('<b></b>');

                    panelFooter.slideDown();

                }, 800);
            }
        }

    }

    aptPanelController.$inject = ['$element', '$scope', '$compile', 'aptTempl', '$injector', '$attrs'];
    function aptPanelController(element, $scope, $compile, aptTempl, $injector, $attrs) {
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

        vm.process = function ($formController, callback) {

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
                var titleEl;
                if (!$attrs.showHelp) {
                    titleEl = element.children('.panel-heading').children('.panel-title');
                } else {
                    titleEl = element
                        .children('.panel-help-wrapper')
                        .children('.panel-content-wrapper')
                        .children('.panel-heading')
                        .children('.panel-title');
                }
                if (!vm.title) {
                    titleEl.remove();
                    return;
                }

                titleEl.append(vm.title);

                if (vm.icon) {
                    titleEl.prepend('<i class="' + vm.icon + '"></i>');
                }
            }

            function processHeadingElements() {
                if (!vm.headingElements) {
                    return;
                }

                element.find('.heading-elements').append(vm.headingElements);

                if ($formController) {
                    if (vm.headingElements.is('ng-model')) {
                        addControl(vm.headingElements);
                    } else {
                        _.map(vm.headingElements.find('[ng-model]'), addControl);
                    }

                    function addControl(formElement) {
                        try {
                            var $ngModelController = $(formElement).data().$ngModelController;
                            $formController.$addControl($ngModelController);
                        } catch (e) {
                        }
                    }
                }
            }

            function processBody() {
                var elBody = element.find('.panel-body');

                if (!vm.body) {
                    elBody.remove();
                    return;
                }

                elBody.append(vm.body.contents());
                var bodyClasses = vm.body.prop("classList");
                if (bodyClasses.length) {
                    _.forEach(bodyClasses, function (value) {
                        elBody.addClass(value);
                    });
                }
                vm.body.remove();
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
