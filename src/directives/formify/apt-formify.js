/**
 * Created by yasar on 03.12.2015.
 */



(function (app) {

    app.directive('aptFormify', ['$compile', '$timeout', '$injector',
        function ($compile, $timeout, $injector) {
            var directiveObject = {
                restrict: 'A',
                require : ['?^aptFormifyHolder'],
                terminal: true,
                compile : function (elem, attrs) {
                    return {
                        pre: function (scope, elem, attrs, ctrls) {
                            var holderCtrl     = ctrls[0];
                            var needsCompile   = _.has(elem.scope(), 'vmField');
                            var wrapperClass   = attrs.aptFormify !== '' ? attrs.aptFormify : 'form-group form-group-xs';
                            var wrapper        = angular.element('<div class="' + wrapperClass + '"></div>');
                            var label          = attrs.label && attrs.label !== 'false';
                            var helpText       = attrs.helpText && attrs.helpText !== 'false';
                            var _elem          = needsCompile ? elem.clone() : elem;
                            var translate      = (!_.has(attrs, 'translate') || attrs.translate != 'false');
                            var gettextCatalog = $injector.get('gettextCatalog');

                            if (!!label) {
                                label = attrs.label;

                                if (translate) {
                                    label = gettextCatalog.getString(label, _.get(attrs, 'translateContext'));
                                }

                                label = $('<label>' + label + '</label>');
                            }

                            if (!!helpText) {
                                helpText = attrs.helpText;

                                if (translate) {
                                    helpText = gettextCatalog.getString(helpText, _.get(attrs, 'translateContext'));
                                }

                                helpText = angular.element('<span class="help-block">' + helpText + '</span>');
                            }

                            if (!!label) {
                                if (attrs.hasOwnProperty('controlEnableState')
                                    && attrs.controlEnableState == 'true') {

                                    var scopeId = '_private_' + (new Date().getTime());
                                    var _scope  = scope[scopeId] = {isDisabled: null};

                                    if (!attrs.hasOwnProperty('ngDisabled')) {

                                        _scope.isDisabled = attrs.hasOwnProperty('disabled') && attrs.disabled;
                                        _elem.attr('ng-disabled', scopeId + '.isDisabled');

                                    }
                                    else {
                                        /**
                                         * we should evaluate the expression that is bound to ngDisabled and
                                         * get it set to _scope.isDisabled for internal use.
                                         */
                                        _scope.isDisabled = scope.$eval(attrs.ngDisabled);
                                    }

                                    $(label).on('click', function () {
                                        if (_elem.hasClass('js-switch')) {
                                            $timeout(function () {
                                                _scope.isDisabled = _scope.isDisabled == 'disabled' ? '' : 'disabled';

                                                /**
                                                 * this one is the trickiest one.
                                                 * what we are doing is, pushing the new value of isDisabled to
                                                 * whatever expression was bound to attrs.ngDisabled.
                                                 * In order to get a better insight understanding,
                                                 * one should debug the code carefully.
                                                 */
                                                _.set(scope, attrs.ngDisabled, _scope.isDisabled);


                                                if (_scope.isDisabled) {
                                                    $(label).addClass('disabled');
                                                } else {
                                                    $(label).removeClass('disabled');
                                                }
                                            });
                                        }
                                    }).addClass('clickable');

                                    if (_scope.isDisabled) {
                                        $(label).addClass('disabled');
                                    }
                                }

                                if (attrs.hasOwnProperty('clearable') && attrs.clearable == 'true') {
                                    label.addClass('display-block');
                                    label.append('<span class="clickable pl-5 pull-right" ng-click="vmField.reset()" title="Clear"><i class="icon-cross"></i></span>');
                                }
                            }

                            if (['input', 'select', 'textarea'].indexOf(_elem.prop('tagName').toLowerCase()) !== -1) {
                                var className = 'form-control';

                                if (_elem.attr('type') == 'checkbox') {
                                    className = 'checkbox';
                                }
                                _elem.addClass(className);
                            }

                            if (!attrs.layout) {
                                if (holderCtrl && holderCtrl.layout) {
                                    attrs.layout = holderCtrl.layout;
                                } else {
                                    attrs.layout = 'ver';
                                }
                            }


                            if (attrs.layout == 'ver') {
                                if (needsCompile) {
                                    if (label !== null) {
                                        wrapper.append(label);
                                    }
                                    wrapper.append(_elem);
                                    if (helpText !== null) {
                                        wrapper.append(helpText);
                                    }
                                } else {
                                    _elem.wrap(wrapper);
                                    if (!_.isNull(label)) {
                                        _elem.before(label);
                                    }
                                    if (!_.isNull(helpText)) {
                                        _elem.after(helpText);
                                    }
                                }
                            }

                            else if (attrs.layout == 'hor') {
                                var labelWidth = [3];
                                var sizeOrder  = ['lg', 'md', 'sm', 'xs'];

                                if (holderCtrl && holderCtrl.labelWidth) {
                                    labelWidth = holderCtrl.labelWidth;
                                }

                                var inner_wrapper = angular.element('<div class="col-lg-9"></div>');
                                label.addClass('control-label');
                                angular.forEach(labelWidth, function (size, ctr) {
                                    label.addClass('col-' + sizeOrder[ctr] + '-' + size);
                                    _elem.addClass('col-' + sizeOrder[ctr] + '-' + (12 - size));
                                });

                                if (needsCompile) {
                                    wrapper.append(label);
                                    wrapper.append(inner_wrapper);
                                    inner_wrapper.append(_elem);
                                } else {
                                    _elem.wrap(inner_wrapper);
                                    _elem.wrap(wrapper);
                                    _elem.before(label);
                                }
                            }

                            _elem.removeAttr('apt-formify');
                            _elem.removeAttr('data-apt-formify');
                            _elem.removeAttr('label');
                            _elem.removeAttr('data-label');
                            _elem.removeAttr('layout');
                            _elem.removeAttr('data-layout');
                            _elem.removeAttr('translate');

                            if (needsCompile) {
                                /**
                                 * the order of is important.
                                 * first add the element into DOM, then compile it.
                                 *
                                 * it was causing ngForm to not detect dirty state of the form-controls.
                                 * doing it this way fixed that issue.
                                 */
                                elem.after(wrapper);
                                elem.remove();
                                $compile(wrapper)(scope);
                            }
                        }
                    };
                }
            };

            return directiveObject;
        }]);

})(angular.module('ngApptolia'));