/**
 * Created by yasar on 01.10.2016.
 */

function aptUtilsForm($injector) {
    return function aptUtilsFormInner(domain, data, _options) {
        _options             = _.defaults(_options, {
            integrate: true
        });
        var formObj          = this;
        var $timeout         = $injector.get('$timeout');
        var gettextCatalog   = $injector.get('gettextCatalog');
        var NotifyingService = $injector.get('NotifyingService');

        if (_options.integrate) {
            var Restangular = $injector.get('Restangular');
            var model       = $injector.get(_.upperFirst(domain) + 'Model');
            var service     = $injector.get(_.upperFirst(domain) + 'Service');
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
            name          : undefined
        }, _options);

        if (_.isUndefined(options.hasParent)) {
            options.hasParent = false;
        }

        // formObj.mode           = (data || options.itemId) ? 'edit' : 'new';
        formObj.mode = ((data && _.get(data, '__is_incomplete') !== true) || options.itemId) ? 'edit' : 'new';
        //if(formObj.mode == 'new' && _.has(data, '__is_incomplete')){
        //    data.__is_incomplete = null;
        //}
        formObj.isBusy         = false;
        formObj.isSaving       = false;
        formObj.isSavingFailed = false;
        // formObj.submitLabel    = 'Save';
        formObj.submitLabel    = getSubmitLabel();
        formObj.submit         = submit;
        formObj.add            = add;
        formObj.update         = update;
        formObj.cancel         = cancel;
        formObj.reset          = reset;
        formObj.isReadonly     = isReadonly;
        formObj.data           = {};
        formObj.name           = options.name || _.uniqueId('form_');
        /**
         * we need to construct the vm which the itemId is bound-to.
         */
        var vm                 = 'vm' + _.upperFirst(domain) + 'Form';

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
        NotifyingService.subscribe(options.$scope, domain + '.formCancelRequested', function () {
            cancel();
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
                // formObj.data = backupDataAndGetCopy(model.one());
                _.merge(formObj.data, backupDataAndGetCopy(model.one()));
                formObj.submitLabel = getSubmitLabel();
                notify(formObj.data, 'formDataLoaded');
                return;
            }

            var waitConf = {
                title   : gettextCatalog.getString('Retrieving data'),
                message : gettextCatalog.getString('Please wait while form data is being retrieved from server'),
                progress: 10
            };
            showWait(waitConf);

            /**
             * if we have the `itemId`, we should grab the data from server
             * and assing it to the `form.data`
             */
            formObj.isBusy = true;
            model.one(itemId).get().then(function (remoteData) {
                // formObj.data   = backupDataAndGetCopy(remoteData);
                // removeAndMerge(formObj.data, backupDataAndGetCopy(remoteData));
                loadDataFromData(remoteData);
                formObj.isBusy      = false;
                formObj.submitLabel = getSubmitLabel(remoteData);
                waitConf.progress   = 100;
            });
        }

        function loadDataFromData(remoteData) {
            removeAndMerge(formObj.data, backupDataAndGetCopy(remoteData));
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
                    if (_.isEqual(_.omit(newVal, ['$$hashKey']), oldVal) || angular.isUndefined(newVal)) {
                        return;
                    }

                    if (watchFor == 'itemId') {
                        loadData(newVal);
                        /**
                         * watch ile takip edilin herhangi bir formun id si form yuklenirken undefined veya null oldugundan
                         * dolayı formu submit ederken form mode new olarak atama yapıyor ve normalde update islemi yapmamız
                         * gerekirken add işlemi yapıyorduk.watch ile izlenen id tanımlı olarak geldiginde form submit edilirken
                         * update yapmak için form mode 'edit' olarak atandı.
                         * @type {string}
                         */
                        formObj.mode = 'edit';
                    } else {
                        loadDataFromData(newVal);
                    }
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
                service.add(formObj.data, mute).then(function () {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = false;
                    //notify(formObj.data, 'formDataAdded');
                    reset();
                }).catch(function (error) {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = true;

                    handleException(_.defaults(error, {type: 'rest-error'}));
                });
            });
        }

        function update(mute) {
            $timeout(function () {
                formObj.isSaving       = true;
                formObj.isSavingFailed = false;
                try {
                    service.update(formObj.data, mute).then(function () {
                        formObj.isSaving       = false;
                        formObj.isSavingFailed = false;
                        formObj.data           = backupDataAndGetCopy(formObj.data);
                        //notify(formObj.data, 'formDataUpdated');

                        var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');
                        if ($formController && $formController.$setPristine) {
                            $formController.$setPristine();
                        }
                    }).catch(function (error) {
                        formObj.isSaving       = false;
                        formObj.isSavingFailed = true;
                        handleException(_.defaults(error, {type: 'rest-error'}));
                    });
                } catch (error) {
                    formObj.isSaving       = false;
                    formObj.isSavingFailed = true;

                    handleException(error);
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
                showConfirm(title, message, function () {
                    notify(null, 'formCanceled');
                });
            } else {
                notify(null, 'formCanceled');
            }
        }

        function notify(_data, event) {
            NotifyingService.notify(domain + '.' + event, _data);
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

        function getSubmitLabel(_data) {
            return formObj.mode == 'edit' ? (_.get(_data, '__is_incomplete') ? 'Complete' : 'Update') : 'Add'
        }
    }
}