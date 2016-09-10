/**
 * Created by yasar on 10.10.2015.
 */


(function (app) {

    app.directive('aptField2', [
        'gettextCatalog',
        '$templateCache',
        '$compile',
        '$timeout',
        function (gettextCatalog, $templateCache, $compile, $timeout) {
            var directiveObject = {
                //replace: true,
                restrict    : 'E',
                //scope: true,
                controller  : [function () {
                    var vmField = this;

                    vmField.status = {
                        open: false
                    };

                    vmField.open = function () {
                        vmField.status.open = true;
                    };
                }],
                controllerAs: 'vmField',
                compile     : function (elem, attrs) {
                    return {
                        post: function (scope, elem, attrs) {
                            if (true) {
                                var tpl = null;
                                if (!tpl && attrs.field) {
                                    tpl = $templateCache.get('fields/' + attrs.field + '.tpl.html');
                                }

                                if (!tpl && attrs.type) {
                                    tpl = $templateCache.get('fields/' + attrs.type + '.tpl.html');
                                }


                                /**
                                 * attrs can have:
                                 *      type
                                 *      field
                                 *      translate
                                 *      label
                                 *      model-base
                                 *      rows
                                 *
                                 */

                                var bindTo = null, showLabel = true;

                                if (attrs.field) {
                                    bindTo = 'formData.' + attrs.field;
                                    if (angular.isDefined(attrs.modelBase)) {
                                        bindTo = attrs.modelBase + '.' + attrs.field;
                                        if (bindTo.indexOf('.') == 0) {
                                            bindTo = bindTo.substr(1);
                                        }
                                    }
                                }

                                if (!tpl) {
                                    var control = {
                                        tag      : 'input',
                                        attrs    : {
                                            type : 'text',
                                            class: 'form-control'
                                        },
                                        selfClose: true,
                                        formify  : true
                                    };

                                    if (attrs.type) {
                                        switch (attrs.type) {
                                            case 'text':
                                                //use the default
                                                options.compile = false;
                                                break;
                                            case 'password':
                                                //use the default
                                                options.compile = false;
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
                                                break;
                                            /*case 'select':
                                             control = {};
                                             control.tag = 'select';
                                             control.attrs = {class: 'form-control'};
                                             control.selfClose = false;
                                             break;*/
                                            case 'textarea':
                                                control = {
                                                    tag      : 'textarea',
                                                    selfClose: false,
                                                    attrs    : {
                                                        class: 'form-control',
                                                        rows : attrs.rows ? attrs.rows : '3'
                                                    },
                                                    formify  : true
                                                };
                                                break;
                                            case 'date-ui':
                                                control = {
                                                    tag      : 'input',
                                                    selfClose: true,
                                                    attrs    : {
                                                        type                  : 'text',
                                                        class                 : 'form-control',
                                                        'uib-datepicker-popup': 'dd.MM.yyyy',
                                                        'datepicker-options'  : 'dateOptions',
                                                        'is-open'             : 'vmField.status.open',
                                                        'datepicker-localdate': ''
                                                    },
                                                    formify  : false
                                                };
                                                break;

                                            case 'date':
                                                control = {
                                                    tag      : 'input',
                                                    selfClose: true,
                                                    attrs    : {
                                                        type                  : 'date',
                                                        class                 : 'form-control',
                                                        'datepicker-localdate': ''
                                                    },
                                                    formify  : true
                                                };
                                                break;
                                        }
                                    }

                                    var tpl = '<' + control.tag;
                                    for (var attr in control.attrs) {
                                        tpl += ' ' + attr + '="' + control.attrs[attr] + '"';
                                    }

                                    if ((!angular.isDefined(attrs.useFormify) || attrs.useFormify !== 'false') && control.formify) {
                                        tpl += ' apt-formify';
                                    }

                                    var label = null;
                                    if (angular.isDefined(attrs.showLabel) && attrs.showLabel == 'false') {
                                        showLabel = false;
                                    } else {
                                        if (angular.isDefined(attrs.label)) {
                                            label = attrs.label;
                                            delete attrs.label;
                                        } else if (attrs.field) {
                                            label = attrs.field.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) {
                                                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                            });
                                        }
                                    }


                                    if (showLabel && label !== null) {
                                        if (attrs.translate && attrs.translate === false) {
                                            label;
                                        } else {
                                            label = gettextCatalog.getString(label);
                                        }

                                        tpl += ' data-label="' + label + '"';

                                    }

                                    //if (bindTo) {
                                    //    tpl += ' data-ng-model="' + bindTo + '"';
                                    //}

                                    tpl += control.selfClose ? ' />' : '></' + control.tag + '>';

                                }

                                var $tpl = $(tpl);

                                if (bindTo) {
                                    $tpl.attr('data-ng-model', bindTo);
                                }

                                if (attrs.type === 'date-ui') {
                                    $tpl = $('<div data-apt-formify class="input-group"></div>')
                                        .append($tpl)
                                        .append('<span class="input-group-btn"> ' +
                                            '<button type="button" data-ng-click="vmField.open()" class="btn btn-default">' +
                                            '<i class="glyphicon glyphicon-calendar"></i></button> </span>');
                                    /*tpl = '<div apt-formify class="input-group">' +
                                     tpl +
                                     '<span class="input-group-btn"> ' +
                                     '<button type="button" data-ng-click="vmField.open()" class="btn btn-default">' +
                                     '<i class="glyphicon glyphicon-calendar"></i></button> </span> </div>';*/
                                }


                                /**
                                 * following is the fix for the question at:
                                 * http://stackoverflow.com/questions/34419515/transcluding-nested-directive-gets-rendered-twice
                                 *
                                 * instead of append, with should do replaceWith.
                                 */
                                    //elem.append($tpl);
                                    //elem.replaceWith($tpl);
                                    //$(elem).replaceWith($compile($tpl)(scope));
                                    //elem.append($tpl);
                                    //$compile(elem)(scope);

                                $compile(elem.append($tpl))(scope);
                            }
                        }
                    };
                }
            };

            return directiveObject;

        }]);

})(angular.module('ngApptolia'));


