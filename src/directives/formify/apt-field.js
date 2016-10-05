/**
 * Created by yasar on 10.10.2015.
 */


(function () {

    angular.module('ngApptolia').directive('aptField', fn);

    fn.$inject = ['$injector'];
    function fn($injector) {
        var $interpolate   = $injector.get('$interpolate');
        var $parse         = $injector.get('$parse');
        var $templateCache = $injector.get('$templateCache');
        var $compile       = $injector.get('$compile');
        var aptTempl       = $injector.get('aptTempl');
        var ngAttrs        = {};

        return {
            scope       : true,
            // scope       : {
            //     modelBase: '='
            // },
            replace     : true,
            // scope       : false,
            restrict    : 'E',
            priority    : 9100,
            controller  : controllerFn,
            controllerAs: 'vmField',
            compile     : compileFn,
            require     : ['^^?form', 'aptField']
        };

        /**
         * attrs can have:
         *      type
         *      field
         *      translate
         *      translate-context
         *      label
         *      help-text
         *      model-base
         *      rows  // for textarea
         *      use-formify
         *      show-label
         *      params
         */

        function compileFn(elem, attrs) {
            _.forIn(attrs, function (value, key) {
                if (!_.includes(['ngIf'], key) && _.startsWith(key, 'ng')) {
                    ngAttrs[key] = value;
                    delete attrs[key];
                    delete attrs.$attr[key];
                    elem.removeAttr(_.kebabCase(key));
                }
            });

            ///

            return {
                post: linkFn
            };

            ///

            function linkFn(scope, elem, attrs, ctrls) {

                var vm             = ctrls[1];
                var gettextCatalog = vm.translate ? $injector.get('gettextCatalog') : null;

                if (_.has(attrs, 'field')) {
                    attrs.field = $interpolate(attrs.field)(scope);
                }

                if (_.has(attrs, 'type')) {
                    attrs.type = $interpolate(attrs.type)(scope);
                }

                var bindTo = getBindTo(attrs, scope);
                if (_.has(attrs, 'params')) {
                    vm.params = $parse(attrs.params)(scope);
                }

                var label           = _.has(attrs, 'label') && _.includes(['', 'false', 'null'], attrs.label) ? false : true;
                var $tpl            = $(getTemplate(scope, attrs, vm));
                var isSelfContained = false;

                if (!_.isNull(bindTo)) {
                    /**
                     * check the template file `checkbox-input-group.tpl.html`
                     * in this template, we dont use anything from the aptField engine.
                     * the template is self-contained.
                     * so we should be able to set the ng-model properly.
                     *
                     * in order to do this, check if the template has ng-model attribute at any element.
                     * if not found, then this is regular apt-field tag and set the ng-model at the most outer element ($tpl).
                     * otherwise, set the ng-model at the found element (tplModel) and also
                     * set the isSelfContained flag to true.
                     */
                    var tplModel = $tpl.find('[ng-model],[data-ng-model]');
                    if (tplModel.length == 0) {
                        $tpl.attr('data-ng-model', bindTo);
                    } else {
                        tplModel.removeAttr('ng-model data-ng-model');
                        tplModel.attr('data-ng-model', bindTo);
                        isSelfContained = true;
                    }
                }

                if (label) {
                    if (isSelfContained) {
                        // vm.label = getLabel(attrs);
                        vm.label = gettextCatalog.getString(getLabel(attrs), _.get(attrs, 'translateContext'));
                    } else {
                        $tpl.attr('label', getLabel(attrs));
                    }
                }


                if (!isSelfContained) {
                    /**
                     * note that we send attrs.$attr
                     */
                    // transferAttributes(attrs.$attr, $tpl);
                    transferAttributes(attrs, $tpl);
                    transferAttributes(ngAttrs, $tpl);

                    $tpl = finalize(elem, attrs, $tpl);
                }

                elem.after($tpl);
                elem.remove();
                var compiledElement = $compile($tpl)(scope);

                /**
                 * this will fix the ui-switch directive to initialize itself twice.
                 * first will be due to above compilation, second will be due to apt-formify.
                 * once is enough, so we should remove the directive attribute from the element to prevent double init.
                 */
                // if (true || attrs.type == 'switch') {
                //     elem.find('[ui-switch]').removeAttr('ui-switch');
                // }

            }
        }

        function fixFormify(elem, attrs, $tpl) {
            var hasFormify = false;
            var hasLabel   = false;
            var label      = null;

            if ($tpl.attr('data-apt-formify') != undefined || $tpl.attr('apt-formify') != undefined) {
                $tpl.removeAttr('data-apt-formify');
                $tpl.removeAttr('apt-formify');
                hasFormify = true;
            }

            if ($tpl.attr('data-label') != undefined || $tpl.attr('label') != undefined) {
                label    = $tpl.attr('data-label') || $tpl.attr('label');
                hasLabel = true;
            }

            {
                var elHavingFormify = null;

                if ((elHavingFormify = $tpl.find('[apt-formify]')).length) {
                    elHavingFormify.removeAttr('apt-formify');
                    hasFormify = true;
                }
                else if ((elHavingFormify = $tpl.find('[data-apt-formify]')).length) {
                    elHavingFormify.removeAttr('data-apt-formify');
                    hasFormify = true;
                }

                if (elHavingFormify.length > 0) {
                    if (elHavingFormify.attr('label') != undefined) {
                        hasLabel = true;
                        label    = elHavingFormify.attr('label');
                    }
                    else if (elHavingFormify.attr('data-label') != undefined) {
                        hasLabel = true;
                        label    = elHavingFormify.attr('data-label');
                    }
                }

            }


            if (hasFormify) {
                $tpl.attr('data-apt-formify', '');
                attrs['aptFormify']       = '';
                attrs.$attr['aptFormify'] = '';
                elem.attr('apt-formify', '');
            }
            if (hasLabel) {
                $tpl.attr('data-label', label);
                attrs['label']       = label;
                attrs.$attr['label'] = label;
                elem.attr('label', label);
            }

        }

        function getTemplate(scope, attrs, vm) {
            var tpl = undefined,
                control,
                attr;

            if (_.has(attrs, 'type')) {
                tpl = $templateCache.get('common/fields/' + attrs.type + '.tpl.html');
            }

            if (_.isUndefined(tpl) && _.has(attrs, 'field')) {
                tpl = $templateCache.get('common/fields/' + attrs.field + '.tpl.html');
            }

            if (_.isUndefined(tpl)) {
                control = getControlObject(scope, attrs, vm);

                tpl = '<' + control.tag;
                for (attr in control.attrs) {
                    tpl += ' ' + attr + '="' + control.attrs[attr] + '"';
                }

                if ((!_.has(attrs, 'useFormify') || attrs.useFormify !== 'false') && control.formify) {
                    tpl += ' apt-formify';
                    if (attrs.aptFormify && attrs.aptFormify !== '') {
                        tpl += '="' + attrs.aptFormify + '"';
                    }
                }

                tpl += control.selfClose ? ' />' : '></' + control.tag + '>';
            }

            if (_.has(attrs, 'compile')) {
                delete attrs.compile;
                tpl = $compile(tpl)(scope);
            }

            return tpl;

            function getControlObject(scope, attrs, vm) {
                var control = {
                    tag      : 'input',
                    attrs    : {
                        type : 'text',
                        class: 'form-control input-xs'
                    },
                    selfClose: true,
                    formify  : true
                };

                if (attrs.type) {
                    switch (attrs.type) {
                        case 'text':
                            //use the default
                            break;
                        case 'number':
                            control = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type : 'number',
                                    class: 'form-control input-xs'
                                },
                                formify  : true
                            };
                            break;
                        case 'password':
                            control = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type : 'password',
                                    class: 'password input-xs'
                                },
                                formify  : true
                            };
                            break;

                        case 'switch':
                            control = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type       : 'checkbox',
                                    class      : 'js-switch pull-right',
                                    'ui-switch': '{size: \'small\'}'
                                },
                                formify  : true
                            };

                            if (attrs.ngTrueValue) {
                                control.attrs['ng-true-value'] = attrs.ngTrueValue;
                            }
                            if (attrs.ngFalseValue) {
                                control.attrs['ng-false-value'] = attrs.ngFalseValue;
                            }
                            break;
                        case 'checkbox':
                            control = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type : 'checkbox',
                                    class: 'checkbox'
                                },
                                formify  : true
                            };

                            if (attrs.ngTrueValue) {
                                control.attrs['ng-true-value'] = attrs.ngTrueValue;
                            }
                            if (attrs.ngFalseValue) {
                                control.attrs['ng-false-value'] = attrs.ngFalseValue;
                            }
                            break;
                        case 'select':
                            control = {
                                tag      : 'select',
                                selfClose: false,
                                attrs    : {
                                    class: 'form-control input-xs'
                                },
                                formify  : true
                            };

                            if (scope.vmField.params && scope.vmField.params.options) {
                                if (vm.translate) {
                                    control.attrs['ng-options'] = 'item as $root.translate(item) for item in vmField.params.options';
                                } else {
                                    control.attrs['ng-options'] = 'item as item for item in vmField.params.options';
                                }
                            }
                            break;
                        case 'textarea':
                            control = {
                                tag      : 'textarea',
                                selfClose: false,
                                attrs    : {
                                    class: 'form-control',
                                    rows : attrs.rows ? attrs.rows : '3',
                                    style: attrs.rows ? ('min-height:' + (attrs.rows * 24) + 'px') : ''
                                },
                                formify  : true
                            };
                            break;
                        // case 'date-ui':
                        //     control = {
                        //         tag      : 'input',
                        //         selfClose: true,
                        //         attrs    : {
                        //             type                  : 'text',
                        //             class                 : 'form-control',
                        //             'uib-datepicker-popup': aptTempl.appConfig.defaults.formats.screenDateUib,
                        //             // 'datepicker-options'  : 'dateOptions',
                        //             'is-open'             : 'vmField.status.open',
                        //             // 'datepicker-localdate': ''
                        //         },
                        //         formify  : true
                        //     };
                        //     break;
                        case 'date':
                        case 'date-ui':
                            aptTempl.appConfig.aeDateOptions = {
                                format          : aptTempl.appConfig.defaults.formats.screenDate,
                                showClear       : true,
                                showClose       : true,
                                showTodayButton : true,
                                keepOpen        : false,
                                allowInputToggle: true,
                                debug           : false
                            };
                            control                          = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type            : 'text',
                                    class           : 'form-control input-xs',
                                    'datetimepicker': '',
                                    options         : '$root.apt.Templ.appConfig.aeDateOptions'
                                },
                                formify  : true
                            };
                            break;
                        case 'datetime':
                            aptTempl.appConfig.aeDatetimeOptions = {
                                format          : aptTempl.appConfig.defaults.formats.screenDateTime,
                                showClear       : true,
                                showClose       : true,
                                showTodayButton : true,
                                keepOpen        : false,
                                allowInputToggle: true,
                                debug           : false
                            };
                            control                              = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type            : 'text',
                                    class           : 'form-control input-xs',
                                    'datetimepicker': '',
                                    options         : '$root.apt.Templ.appConfig.aeDatetimeOptions'
                                },
                                formify  : true
                            };
                            break;

                        case 'date-range-single':
                            control = {
                                tag      : 'input',
                                selfClose: true,
                                attrs    : {
                                    type               : 'text',
                                    class              : 'form-control date-picker input-xs',
                                    'date-range-picker': '',
                                    'options'          : '{singleDatePicker: true, showDropdowns: true, locale: {format: ' + aptTempl.appConfig.defaults.formats.screenDate + '}}',
                                },
                                formify  : true
                            };
                            break;

                        // case 'date':
                        //     control = {
                        //         tag      : 'input',
                        //         selfClose: true,
                        //         attrs    : {
                        //             type                  : 'date',
                        //             class                 : 'form-control',
                        //             'datepicker-localdate': ''
                        //         },
                        //         formify  : true
                        //     };
                        //     break;
                    }
                }


                if (attrs.class) {
                    control.attrs.class += ' ' + attrs.class;
                }

                control.attrs.name = attrs.field;

                return control;
            }
        }


        function getLabel(attrs) {
            var str = null;

            if (_.has(attrs, 'label')) {
                str = attrs.label;
            } else if (_.has(attrs, 'field')) {
                str = attrs.field;
            }

            return _(str).chain().trimEnd('_id').startCase().value();
        }

        function getBindTo(attrs, scope) {
            var bindTo = null;

            if (_.has(attrs, 'field')) {
                bindTo = 'formData.' + attrs.field;

                if (_.has(attrs, 'modelBase')) {
                    bindTo = attrs.modelBase + '.' + attrs.field;

                    if (bindTo.indexOf('.') == 0) {
                        bindTo = bindTo.substr(1);
                    }
                }
            }

            return bindTo;
        }


        function finalize(elem, attrs, $tpl) {
            if (['date-ui', 'datetime'].indexOf(attrs.type) !== -1) {
                // if (attrs.type === 'date-ui') {
                $tpl = $('<div ' + (attrs.useFormify !== 'false' ? 'data-apt-formify ' : '') + 'class="input-group input-group-xs"></div>')
                    .append($tpl)
                    .append('<span class="input-group-addon no-border no-padding"> ' +
                            '<button type="button" data-ng-click="vmField.open()" class="btn btn-default btn-xs">' +
                            '<i class="icon-calendar"></i></button> </span>');
            }

            /*if (['datetime'].indexOf(attrs.type) !== -1) {
             // if (attrs.type === 'date-ui') {
             $tpl = $('<div ' + (attrs.useFormify !== 'false' ? 'data-apt-formify ' : '') + 'class="input-group input-group-xs"></div>')
             .append($tpl)
             .append('<span class="input-group-addon no-border no-padding"> ' +
             '<button type="button" class="btn btn-default btn-xs">' +
             '<i class="icon-calendar"></i></button> </span>');
             }*/

            // else if(attrs.type === 'date-moment'){
            //     /**
            //      * ng-model is not used for moment-picker,
            //      * rather it should be as
            //      * <span moment-picker="model" ... ></span>
            //      */
            //     $tpl.removeAttr('data-ng-model');
            // }


            else if (attrs.type == 'switch') {
                $tpl = $('<div class="checkbox checkbox-switchery checkbox-right switchery-xs"></div>')
                    .append($tpl);
            }

            if (['switch'].indexOf(attrs.type) == -1) {
                fixFormify(elem, attrs, $tpl);
            }

            if (attrs.holderClass) {
                $tpl.addClass(attrs.holderClass);
            }

            return $tpl;
        }
    };

    controllerFn.$inject = ['$injector', '$scope', '$attrs'];
    function controllerFn($injector, $scope, $attrs) {
        var vm       = this;
        var $parse   = $injector.get('$parse');
        vm.translate = false;

        if (_.has($attrs, 'modelBase')) {
            vm.modelBase = $parse(_.get($attrs, 'modelBase'))($scope);
        }

        if ((!_.has($attrs, 'translate') || (_.has($attrs, 'translate') && $attrs.translate != 'false')) && $injector.has('gettextCatalog')) {
            vm.translate = true;
        }

        vm.reset = reset;

        vm.status = {
            open: false
        };

        vm.open = function () {
            vm.status.open = true;
        };


        function reset() {
            $scope.$broadcast('reset-model');
        }
    }

    function transferAttributes(attrs, $tpl) {
        _.forOwn(attrs, function (value, key) {
            if (_.includes([
                    '$$element', '$attr', '$scope',
                    'field', 'modelBase', 'type', 'labelx', 'rows', 'translate', 'useFormify', 'helpTextx',
                ], key)) {
                return;
            }
            $tpl.attr(_.kebabCase(key), value);
        });
    }
})();


