/**
 * Created by yasar on 01.10.2016.
 */

function aptUtilsForm($injector) {
    return function aptUtilsFormInner(builder, data, _options) {
        /**
         * we have changed the first parameter to builder from domain.
         * so, if in case we are provided with a domain, then we should find the builder object.
         */
        if (!_.isObject(builder)) {
            var $window = $injector.get('$window');
            builder     = $window[builder + 'Builder'];

            if (!builder) {
                throw 'Expecting a builder object or a domain name which has a valid builder in the global window scope';
            }
        }

        var aptUtils         = $injector.get('aptUtils');
        var formObj          = this;
        var $timeout         = $injector.get('$timeout');
        var $rootScope       = $injector.get('$rootScope');
        var gettextCatalog   = $injector.get('gettextCatalog');
        var NotifyingService = $injector.get('NotifyingService');

        _options = _.defaults(_options, {
            /**
             * when set to false, it can be used for ordinary forms.
             */
            integrate: true
        });

        if (_options.integrate) {
            var Restangular = $injector.get('Restangular');
            // var model       = $injector.get(_.upperFirst(domain) + 'Model');
            // var service     = $injector.get(_.upperFirst(domain) + 'Service');
            var model   = $injector.get(builder.getServiceName('model'));
            var service = $injector.get(builder.getServiceName('service'));
        }
        var _backupData = null;

        var options = angular.extend({
            itemId        : null,
            /**
             * in order to get the watch to work, we have to supply $scope
             */
            watch         : false,
            $scope        : null,
            readonlyFields: [],
            /**
             * when set true, notifyingService will mute
             */
            mute          : false,
            /**
             * when set true, it will prevent from routing back to listing page
             * after form is submitted
             */
            stay          : false,
            onDataLoad    : null,
            /**
             * Must return a promise object
             */
            onBeforeSubmit: null,
            hasParent     : undefined,
            name          : undefined,
            sendWithGet   : null
        }, _options);

        if (_.isUndefined(options.hasParent)) {
            options.hasParent = false;
        }

        formObj.isBusy         = false;
        formObj.isSaving       = false;
        formObj.isSavingFailed = false;
        ///
        formObj.mode           = null;
        formObj.submitLabel    = null;
        updateFormMode(data);
        ///
        formObj.submit     = submit;
        formObj.add        = add;
        formObj.update     = update;
        formObj.cancel     = cancel;
        formObj.reset      = reset;
        formObj.isReadonly = isReadonly;
        formObj.data       = {};
        formObj.vars       = {}; // use as cache or storing dummy/internal variables
        formObj.name       = options.name || _.uniqueId('form_');
        /**
         * we need to construct the vm which the itemId is bound-to.
         */
            // var vm             = 'vm' + _.upperFirst(domain) + 'Form';
        var vm             = builder.getControllerAsName('form');

        if (_options.integrate) {
            if (angular.isObject(data)) {
                //_.merge(formObj.data, backupDataAndGetCopy(data));
                /**
                 * this is required for hasParent flag to operate properly.
                 * However, we should monitor the behaviour against unexpected consequences.
                 */
                formObj.data = backupDataAndGetCopy(data);
            }
            else if (isFinite(parseInt(data)) || isFinite(parseInt(options.itemId))) {

                /**
                 * decide which of two have the itemId
                 */
                var itemId = options.itemId ? options.itemId : data;

                /**
                 * initially load the data,
                 * watch will load according to future changes
                 */
                loadData(itemId);

            }
            else {
                loadData();
            }

            if (options.watch && options.$scope && angular.isDefined(options.$scope[vm].itemId)) {
                startWatch('itemId');
            }
            else if (options.watch && options.$scope && angular.isDefined(options.$scope[vm].item)) {
                startWatch('item');
            }
        }
        formObj.readonlyFields = options.readonlyFields;

        /**
         * if this form is in a popup window (modal), and modal is closed by clicking the backdrop
         * then modal will notify the formCancelRequest.
         * We have to ensure that the form is not in dirty state.
         * Otherwise, show up a confirmation message.
         * all the checks will be done in cancel() method.
         */
        // NotifyingService.subscribe(options.$scope, domain + '.formCancelRequested', function () {
        NotifyingService.subscribe(options.$scope, builder.getEventName('formCancelRequested'), function () {
            cancel();
        });


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            toState.resolve.pauseStateChange = [
                '$q',
                function ($q) {
                    var defer = $q.defer();
                    $timeout(function () {
                        var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');

                        if ($formController && $formController.$dirty) {
                            var title   = gettextCatalog.getString('Confirmation');
                            var message = gettextCatalog.getString('You have un-saved changes that will be lost if you continue.') + ' ' + gettextCatalog.getString('Are you sure that you want to continue?');
                            aptUtils.showConfirm(title, message, defer.resolve, defer.reject);
                        } else {
                            defer.resolve();
                        }
                    });
                    return defer.promise;
                }
            ]
        });

        function loadData(itemId) {

            /**
             * if `itemId` is undefined, then we are in `new` mode
             * and we should create an empty model object.
             *
             * checking for only undefined is not good enough.
             * in some cases, we may initialize the itemId with null
             * which is to be updated later on in the code (to be used with watch=true).
             * in this case, form will send a get request without an itemId,
             * and it will end up with receving the whole table list (a possible huge array).
             *
             * to prevent this case, we should check against if the itemId has a numeric value.
             */
            // if (angular.isUndefined(itemId)) {
            /**
             * note that + sign is to ensure itemId is converted to integer.
             */
            if (angular.isUndefined(itemId) || !_.isNumber(+itemId)) {
                _.merge(formObj.data, backupDataAndGetCopy(model.one()));
                // formObj.submitLabel = getSubmitLabel();
                updateFormMode();
                notify(formObj.data, 'formDataLoaded');
                return;
            }

            var waitConf = {
                title   : gettextCatalog.getString('Retrieving data'),
                message : gettextCatalog.getString('Please wait while form data is being retrieved from server'),
                progress: 10
            };
            aptUtils.showWait(waitConf);

            /**
             * if we have the `itemId`, we should grab the data from server
             * and assing it to the `form.data`
             */
            formObj.isBusy = true;
            model.one(itemId).get().then(function (remoteData) {
                loadDataFromData(remoteData);
                formObj.isBusy = false;
                // formObj.submitLabel = getSubmitLabel(remoteData);
                updateFormMode(remoteData);
                waitConf.progress = 100;
            });
        }

        function loadDataFromData(remoteData) {
            aptUtils.removeAndMerge(formObj.data, backupDataAndGetCopy(remoteData));
            if (_.isFunction(options.onDataLoad)) {
                options.onDataLoad($injector, options.$scope, formObj);
            }
            notify(formObj.data, 'formDataLoaded');
        }

        function startWatch(watchFor) {
            options.$scope.$watch(
                function () {
                    return options.$scope[vm][watchFor];
                },
                function (newVal, oldVal) {
                    /**
                     * watch ile takip edilin herhangi bir formun id si form yuklenirken undefined veya null oldugundan
                     * dolayı formu submit ederken form mode new olarak atama yapıyor ve normalde update islemi yapmamız
                     * gerekirken add işlemi yapıyorduk.watch ile izlenen id tanımlı olarak geldiginde form submit edilirken
                     * update yapmak için form mode 'edit' olarak atandı.
                     */


                    if (_.isEqual(_.omit(newVal, ['$$hashKey']), oldVal) || angular.isUndefined(newVal)) {
                        formObj.mode = 'edit';
                        return;
                    }

                    if (watchFor == 'itemId') {
                        loadData(newVal);
                    } else {
                        loadDataFromData(newVal);
                    }

                    formObj.mode = 'edit';
                },
                watchFor == 'item'
            );
        }

        function backupDataAndGetCopy(data) {
            if (options.hasParent) {
                return data;
            }

            _backupData = data;

            if (_.has(data, 'restangularized')) {
                return Restangular.copy(data);
            }

            return angular.copy(data);
        }

        function submit(mute) {
            if (_.isFunction(options.onBeforeSubmit)) {
                options.onBeforeSubmit($injector, options.$scope, formObj).then(function (proceed) {
                    if (proceed) {
                        proceedSubmit();
                    } else {
                        return;
                    }
                });
            } else {
                proceedSubmit();
            }

            function proceedSubmit() {
                if (_.isUndefined(mute)) {
                    mute = {
                        mute: options.mute,
                        stay: options.stay
                    };
                }

                var proceedWith = null;
                if (_.has(formObj, 'data.__is_incomplete') && formObj.data.__is_incomplete) {
                    proceedWith = update;
                } else {
                    proceedWith = formObj.mode == 'edit' ? update : add;
                }
                proceedWith(mute);
            }
        }

        function add(mute) {
            $timeout(function () {
                formObj.isSaving       = true;
                formObj.isSavingFailed = false;
                service.add(formObj.data, mute, _options.sendWithGet).then(function (data) {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = false;
                    //notify(formObj.data, 'formDataAdded');
                    updateFormMode(data);
                    reset();
                }).catch(function (error) {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = true;

                    aptUtils.handleException(_.defaults(error, {type: 'rest-error'}));
                });
            });
        }

        function update(mute) {
            $timeout(function () {
                formObj.isSaving       = true;
                formObj.isSavingFailed = false;
                try {
                    service.update(formObj.data, mute, _options.sendWithGet).then(function (data) {
                        formObj.isSaving       = false;
                        formObj.isSavingFailed = false;
                        _.merge(formObj.data, data);
                        formObj.data = backupDataAndGetCopy(formObj.data);
                        //notify(formObj.data, 'formDataUpdated');
                        updateFormMode(data);

                        var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');
                        if ($formController && $formController.$setPristine) {
                            $formController.$setPristine();
                        }
                    }).catch(function (error) {
                        formObj.isSaving       = false;
                        formObj.isSavingFailed = true;
                        aptUtils.handleException(_.defaults(error, {type: 'rest-error'}));
                    });
                } catch (error) {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = true;

                    aptUtils.handleException(error);
                    return error;
                }
            });
        }

        function reset() {
            formObj.data = backupDataAndGetCopy(model.one());
        }

        function cancel() {
            var gettextCatalog  = $injector.get('gettextCatalog');
            var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');

            if ($formController && $formController.$dirty) {
                var title   = gettextCatalog.getString('Confirmation');
                var message = gettextCatalog.getString('You have un-saved changes that will be lost if you continue.') + ' ' + gettextCatalog.getString('Are you sure that you want to continue?');
                aptUtils.showConfirm(title, message, function () {
                    notify(null, 'formCanceled');
                });
            } else {
                notify(null, 'formCanceled');
            }
        }

        function notify(_data, event) {
            // NotifyingService.notify(domain + '.' + event, _data);
            NotifyingService.notify(builder.getEventName(event), _data);
            NotifyingService.notify('record.' + event);
        }

        function isReadonly(field) {
            if (!options.readonlyFields) {
                return false;
            }

            if (!field) {
                return false;
            }

            if (options.readonlyFields.indexOf(field) == -1) {
                return false;
            }

            return true;
        }

        // function getSubmitLabel(_data) {
        //     return formObj.mode == 'edit' ? (_.get(_data, '__is_incomplete') ? 'Complete' : 'Update') : 'Add'
        // }

        function updateSubmitLabel(data) {
            formObj.submitLabel = formObj.mode == 'edit' ? (_.get(data, '__is_incomplete') ? 'Complete' : 'Update') : 'Add'
        }

        function updateFormMode(data) {
            formObj.mode = ((data && _.get(data, '__is_incomplete') !== true) || !!options.itemId) ? 'edit' : 'new';
            updateSubmitLabel(data);
        }
    }
}