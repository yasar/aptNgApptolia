/*global window */
(function (angular) {
    'use strict';
    // angular.module('ngApptolia').factory('aptUtils', fn);
    angular.module('ngApptolia').provider('aptUtils', [
        /**
         * this is provider level $injector,
         * and it will only hold providers
         */
        '$injector',
        function ($injector) {

            var api = new fn($injector);
            angular.extend(this, api);

            this.$get = [
                /**
                 * this is service level $injector
                 * it will hold all the injectables.
                 */
                '$injector',
                function ($injector) {
                    return new fn($injector);
                }];
        }]);

    // fn.$inject = ['$injector'];
    function fn($injector) {
        return {
            lightbox                         : lightbox,
            extendDeep                       : extendDeep,
            getGravatar                      : getGravatar,
            removeObjectProperties           : removeObjectProperties,
            nullifyObjectProperties          : nullifyObjectProperties,
            nullifyAndMerge                  : nullifyAndMerge,
            convertObjectArrayToKeyValueArray: convertObjectArrayToKeyValueArray,
            emptyArray                       : emptyArray,
            emptyAndMerge                    : emptyAndMerge,
            removeAndMerge                   : removeAndMerge,
            isEmptyObject                    : isEmptyObject,
            // form                             : form,
            form                             : aptUtilsForm($injector),
            copyToClipboard                  : copyToClipboard,
            getUrlSearchObject               : getUrlSearchObject,
            getUrlSearchString               : getUrlSearchString,
            getUrlSearchParamValue           : getUrlSearchParamValue,
            setUrlSearchParamValue           : setUrlSearchParamValue,
            getScopeById                     : getScopeById,
            goto                             : goto,
            handleException                  : handleException,
            handlePromiseCatch               : handlePromiseCatch,
            showError                        : showError,
            showConfirm                      : showConfirm,
            showDeleteConfirm                : showDeleteConfirm,
            showInfo                         : showInfo,
            showWait                         : showWait,
            showWarning                      : showWarning,
            showFormDirectiveInPopup         : showFormDirectiveInPopup,
            popupDirective                   : popupDirective,
            formatAddressForPrint            : formatAddressForPrint
        };

        function convertObjectArrayToKeyValueArray(_data, keyField, valueField) {
            var data = [];
            _.forEach(_data, function (item) {
                if (!item || !_.has(item, 'title')) {
                    return;
                }
                data.push([item.title, item.value]);
            });

            return data;
        }

        function showError(title, message, options, translate) {
            var dialogs        = $injector.get('dialogs');
            var aptTempl       = $injector.get('aptTempl');
            var gettextCatalog = $injector.get('gettextCatalog');
            options            = _.defaults(options, aptTempl.appConfig.defaults.dialogs.error);
            translate          = _.isUndefined(translate) ? true : translate;
            if (translate) {
                title   = gettextCatalog.getString(title);
                message = gettextCatalog.getString(message);
            }
            return dialogs.error(title, message, options);
        }

        function showWarning(title, message, options) {
            var dialogs  = $injector.get('dialogs');
            var aptTempl = $injector.get('aptTempl');
            options      = _.defaults(options, aptTempl.appConfig.defaults.dialogs.warning);
            return dialogs.notify(title, message, options);
        }

        function showInfo(title, message, options) {
            var dialogs  = $injector.get('dialogs');
            var aptTempl = $injector.get('aptTempl');
            options      = _.defaults(options, aptTempl.appConfig.defaults.dialogs.info);
            return dialogs.notify(title, message, options);
        }

        function showConfirm(title, message, onAcceptFn, onRejectFn, options) {
            var dialogs  = $injector.get('dialogs');
            var aptTempl = $injector.get('aptTempl');
            options      = _.defaults(options, aptTempl.appConfig.defaults.dialogs.confirm);
            var dlg      = dialogs.confirm(title, message, options);
            dlg.result.then(onAcceptFn, onRejectFn);
        }

        function showDeleteConfirm(onAcceptFn, onRejectFn) {
            var gettextCatalog = $injector.get('gettextCatalog');
            var aptTempl       = $injector.get('aptTempl');
            showConfirm(gettextCatalog.getString('Confirmation'),
                gettextCatalog.getString('Are you sure that you want to delete?'),
                onAcceptFn,
                onRejectFn, aptTempl.appConfig.defaults.dialogs.deleteConfirm);
        }

        function showWait(conf) {
            var dialogs        = $injector.get('dialogs');
            var $rootScope     = $injector.get('$rootScope');
            var aptTempl       = $injector.get('aptTempl');
            var gettextCatalog = $injector.get('gettextCatalog');
            var $timeout       = $injector.get('$timeout');

            conf = _.defaults(conf, {
                title   : undefined,
                message : undefined,
                progress: 0
            });
            dialogs.wait(gettextCatalog.getString(conf.title), gettextCatalog.getString(conf.message), conf.progress,
                aptTempl.appConfig.defaults.dialogs.wait);
            _fakeWaitProgress();

            function _fakeWaitProgress() {
                $timeout(function () {
                    if (conf.progress < 98) {
                        conf.progress += 1;
                        $rootScope.$broadcast('dialogs.wait.progress', {'progress': conf.progress});
                        _fakeWaitProgress();
                    } else {
                        $rootScope.$broadcast('dialogs.wait.complete');
                    }
                }, 400);
            };
        }

        function showFormDirectiveInPopup(conf) {

            conf = _.defaults(conf, {
                /**
                 * @type aptBuilder
                 */
                builder: null,
                itemId : null,
                params : null
            });

            var $templateCache = $injector.get('$templateCache');
            var dialogs        = $injector.get('dialogs');
            var aptTempl       = $injector.get('aptTempl');
            var directiveName  = conf.builder.getDirectiveName('form');

            ///

            var tpl = '<div data-' + _.kebabCase(directiveName);

            if (conf.itemId) {
                tpl += ' item-id="itemId"';
            }

            if (conf.params) {
                tpl += ' params="params"';
            }

            tpl += '></div>';

            ///

            var path = conf.builder.getPath('cache') + '/popup' + directiveName + '.html';
            $templateCache.put(path, tpl);
            dialogs.create(path, [
                '$scope',
                '$uibModalInstance',
                'NotifyingService',
                function ($scope, $uibModalInstance, NotifyingService) {
                    if (conf.itemId) {
                        $scope.itemId = conf.itemId;
                    }
                    if (conf.params) {
                        $scope.params = conf.params;
                    }

                    NotifyingService.subscribe($scope, conf.builder.domain + '.formCanceled', function () {
                        $uibModalInstance.close();
                    });
                }], undefined, aptTempl.appConfig.defaults.dialogs.large);
        }

        function popupDirective(builder, name, conf) {

            conf = _.defaults(conf, {});

            var $templateCache = $injector.get('$templateCache');
            var dialogs        = $injector.get('dialogs');
            var aptTempl       = $injector.get('aptTempl');
            var directiveName  = builder.getDirectiveName(name);

            ///

            var tpl = '<div data-' + _.kebabCase(directiveName);
            tpl += '></div>';

            ///

            var path = builder.getPath('cache') + '/popup' + directiveName + '.html';
            $templateCache.put(path, tpl);
            dialogs.create(path, [
                '$scope',
                '$uibModalInstance',
                'NotifyingService',
                function ($scope, $uibModalInstance, NotifyingService) {
                    if (conf.itemId) {
                        $scope.itemId = conf.itemId;
                    }
                    if (conf.params) {
                        $scope.params = conf.params;
                    }

                    // NotifyingService.subscribe($scope, builder.domain + '.formCanceled', function () {
                    //     $uibModalInstance.close();
                    // });
                }], undefined, aptTempl.appConfig.defaults.dialogs.large);
        }

        function goto(conf) {
            var url           = '',
                $q            = $injector.get('$q'),
                deferred      = $q.defer();
            var $location     = $injector.get('$location');
            var $routeSegment = $injector.get('$routeSegment');
            var $timeout      = $injector.get('$timeout');


            if (conf.hasOwnProperty('segment')) {
                try {
                    if (angular.isObject(conf.segment)) {
                        url = $routeSegment.getSegmentUrl(conf.segment.name, conf.segment.params);
                    } else {
                        url = $routeSegment.getSegmentUrl(conf.segment);
                    }
                } catch (e) {
                    console.error((conf.segment.name || conf.segment) + ' is not exist');
                    url = $routeSegment.getSegmentUrl('main.page404');
                }
            } else if (conf.hasOwnProperty('url')) {
                url = conf.url;
            }

            if (!conf.hasOwnProperty('search')) {
                conf.search = null;
            }

            $timeout(function () {
                if (conf.search) {
                    $location.path(url).search(conf.search);
                } else {
                    $location.path(url);
                }
                deferred.resolve();
            });

            return deferred.promise;
        }

        function getScopeById(scopeId, baseScope) {
            if (!baseScope) {
                baseScope = $injector.get('$rootScope');
            }

            return getScopeId(scopeId, baseScope);

            function getScopeId(scopeId, root) {
                var foundScope = null;
                traverse(root);
                return foundScope;

                function traverse(scope) {
                    if (scope.$id == scopeId) {
                        foundScope = scope;
                    }

                    if (foundScope == null) {
                        if (scope.$$nextSibling)
                            traverse(scope.$$nextSibling);
                        if (scope.$$childHead)
                            traverse(scope.$$childHead);
                    }
                }
            }

        }

        function getUrlSearchObject(paramObj) {
            var $location = $injector.get('$location');
            var searchObj = $location.search();
            if (paramObj) {
                angular.merge(searchObj, paramObj);
            }
            return searchObj
        }

        function getUrlSearchString(paramObj) {
            var $httpParamSerializer = $injector.get('$httpParamSerializer');
            var searchObj            = getUrlSearchObject(paramObj);
            return $httpParamSerializer(searchObj);
        }

        function getUrlSearchParamValue(paramName, defaultValue, varType) {
            var _this       = this;
            var searchObj   = getUrlSearchObject();
            var returnValue = null;
            if (paramName in searchObj) {
                returnValue = searchObj[paramName];

            } else {

                _.each(_this.searchArr, function (item) {
                    if (returnValue != null) {
                        return;
                    }
                    if (item.param == paramName) {
                        returnValue = item.value;
                    } else if (_.isObject(item.param)) {
                        _.forIn(item.param, function (value, key) {
                            if (returnValue != null) {
                                return;
                            }
                            if (key == paramName) {
                                returnValue = value;
                            }
                        });
                    }
                });
            }

            if (returnValue && varType) {
                returnValue = convertValue(returnValue, varType);
            }

            return returnValue || defaultValue || null;

            function convertValue(value, type) {
                if (type == 'int') {
                    value = parseInt(value);
                }
                return value;
            }
        }

        function setUrlSearchParamValue(param, value, timer) {
            var _this    = this;
            var $timeout = $injector.get('$timeout');
            if (this.timerPromise) {
                $timeout.cancel(this.timerPromise);
            }

            if (!this.searchArr) {
                this.searchArr = [];
            }

            var searchObj = {
                param: param,
                value: value
            };

            var idx = _.findIndex(this.searchArr, {param: param});
            if (idx > -1) {
                this.searchArr[idx] = searchObj;
            } else {
                this.searchArr.push(searchObj);
            }

            if (!_.isUndefined(timer) && !timer) {
                proceed();
            } else {
                this.timerPromise = $timeout(function () {
                    proceed();
                }, _.isInteger(timer) ? timer : 100);

                /**
                 * in case we shall need this promise,
                 * we return it back.
                 */
                return this.timerPromise;
            }

            function proceed() {
                var $location = $injector.get('$location');
                _.each(_this.searchArr, function (item) {
                    if (_.has($location.$$search, item.param)
                        && (_.isUndefined(item.value) || _.isNull(item.value))) {

                        delete $location.$$search[item.param];

                    }
                    else if (_.isString(item.param)) {
                        _.set($location.$$search, item.param, _.isObject(item.value) ? angular.toJson(item.value) : item.value);
                    } else {
                        _.forIn(item.param, function (value, key) {
                            if (_.isUndefined(value) || _.isNull(value)) {
                                delete item.param[key];
                            }
                        });
                        _.merge($location.$$search, item.param);
                    }

                });
                $location.$$compose();
            }
        }

        function lightbox(groupId) {
            var $timeout = $injector.get('$timeout');
            $timeout(function () {
                $("div[id^='" + groupId + "']")
                    .each(
                        function () {
                            var gr = $(this)
                                .attr('id')
                                .replace(groupId, '');
                            $(this)
                                .find("a[rel^='lightbox']")
                                .attr('rel', 'lightbox-gr' + gr)
                                .attr('title',
                                    function () {
                                        return $(this)
                                            .closest('.component_box')
                                            .find('.counter:last-child')
                                            .html();
                                    })
                                .slimbox();
                        });
            }, 2000);
        }

        function extendDeep() {
            var innerFn = function () {

                /**
                 * if dst is undefined then
                 * extending will fail.
                 * so we have to initialize it with an empty object
                 */
                var dst = arguments[0] || {};


                angular.forEach(arguments, function (obj) {
                    if (obj !== dst) {
                        angular.forEach(obj, function (value, key) {
                            if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                                innerFn(dst[key], value);
                            } else {
                                dst[key] = angular.copy(value);
                            }
                        });
                    }
                });
                return dst;
            };

            return innerFn.apply(null, arguments);
            // return innerFn(dst);
        }

        function getGravatar(email, options) {
            var gravatarService = $injector.get('gravatarService');

            options = _.merge({
                size   : 62,
                rating : 'pg',
                default: 'retro'
            }, options);

            return gravatarService.url(email, options);
        }

        function removeObjectProperties(object) {
            for (var member in object) delete object[member];
        }

        function nullifyObjectProperties(object) {
            for (var member in object) object[member] = null;
        }

        function nullifyAndMerge(object, mergeWith) {
            nullifyObjectProperties(object);
            _.merge(object, mergeWith);
        }

        function removeAndMerge(object, mergeWith) {
            removeObjectProperties(object);
            _.merge(object, mergeWith);
        }

        function emptyAndMerge(target, source) {
            emptyArray(target);
            _.merge(target, _.uniq(source));
        }

        function emptyArray(target) {
            target.splice(0, target.length);
        }

        function isEmptyObject(obj) {
            var bar;
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        }

        // function form(domain, data, _options) {
        //     _options             = _.defaults(_options, {
        //         integrate: true
        //     });
        //     var formObj          = this;
        //     var dialogs          = $injector.get('dialogs');
        //     var Restangular      = $injector.get('Restangular');
        //     var NotifyingService = $injector.get('NotifyingService');
        //     var model            = $injector.get(_.upperFirst(domain) + 'Model');
        //     var service          = $injector.get(_.upperFirst(domain) + 'Service');
        //     var $timeout         = $injector.get('$timeout');
        //     var gettextCatalog   = $injector.get('gettextCatalog');
        //
        //
        //     var _backupData = null;
        //
        //     var options = angular.extend({
        //         itemId        : null,
        //         /**
        //          * in order to get the watch to work, we have to supply $scope
        //          */
        //         watch         : false,
        //         $scope        : null,
        //         readonlyFields: [],
        //         /**
        //          * when set true, notifyingService will mute
        //          */
        //         mute          : false,
        //         /**
        //          * when set true, it will prevent from routing back to listing page
        //          * after form is submitted
        //          */
        //         stay          : false,
        //         onDataLoad    : null,
        //         /**
        //          * Must return a promise object
        //          */
        //         onBeforeSubmit: null,
        //         hasParent     : undefined,
        //         name          : undefined
        //     }, _options);
        //
        //     if (_.isUndefined(options.hasParent)) {
        //         options.hasParent = false;
        //     }
        //
        //     // formObj.mode           = (data || options.itemId) ? 'edit' : 'new';
        //     formObj.mode = ((data && _.get(data, '__is_incomplete') !== true) || options.itemId) ? 'edit' : 'new';
        //     //if(formObj.mode == 'new' && _.has(data, '__is_incomplete')){
        //     //    data.__is_incomplete = null;
        //     //}
        //     formObj.isBusy         = false;
        //     formObj.isSaving       = false;
        //     formObj.isSavingFailed = false;
        //     // formObj.submitLabel    = 'Save';
        //     formObj.submitLabel    = getSubmitLabel();
        //     formObj.submit         = submit;
        //     formObj.add            = add;
        //     formObj.update         = update;
        //     formObj.cancel         = cancel;
        //     formObj.reset          = reset;
        //     formObj.isReadonly     = isReadonly;
        //     formObj.data           = {};
        //     formObj.name           = options.name || _.uniqueId('form_');
        //     /**
        //      * we need to construct the vm which the itemId is bound-to.
        //      */
        //     var vm                 = 'vm' + _.upperFirst(domain) + 'Form';
        //
        //     if (angular.isObject(data)) {
        //         //_.merge(formObj.data, backupDataAndGetCopy(data));
        //         /**
        //          * this is required for hasParent flag to operate properly.
        //          * However, we should monitor the behaviour against unexpected consequences.
        //          */
        //         formObj.data = backupDataAndGetCopy(data);
        //     }
        //     else if (isFinite(parseInt(data)) || isFinite(parseInt(options.itemId))) {
        //
        //         /**
        //          * decide which of two have the itemId
        //          */
        //         var itemId = options.itemId ? options.itemId : data;
        //
        //         /**
        //          * initially load the data,
        //          * watch will load according to future changes
        //          */
        //         loadData(itemId);
        //
        //     }
        //     else {
        //         loadData();
        //     }
        //
        //     if (options.watch && options.$scope && angular.isDefined(options.$scope[vm].itemId)) {
        //         startWatch('itemId');
        //     }
        //     else if (options.watch && options.$scope && angular.isDefined(options.$scope[vm].item)) {
        //         startWatch('item');
        //     }
        //
        //     formObj.readonlyFields = options.readonlyFields;
        //
        //     /**
        //      * if this form is in a popup window (modal), and modal is closed by clicking the backdrop
        //      * then modal will notify the formCancelRequest.
        //      * We have to ensure that the form is not in dirty state.
        //      * Otherwise, show up a confirmation message.
        //      * all the checks will be done in cancel() method.
        //      */
        //     NotifyingService.subscribe(options.$scope, domain + '.formCancelRequested', function () {
        //         cancel();
        //     });
        //
        //     function loadData(itemId) {
        //
        //         /**
        //          * if `itemId` is undefined, then we are in `new` mode
        //          * and we should create an empty model object.
        //          *
        //          * checking for only undefined is not good enough.
        //          * in some cases, we may initialize the itemId with null
        //          * which is to be updated later on in the code (to be used with watch=true).
        //          * in this case, form will send a get request without an itemId,
        //          * and it will end up with receving the whole table list (a possible huge array).
        //          *
        //          * to prevent this case, we should check against if the itemId has a numeric value.
        //          */
        //         // if (angular.isUndefined(itemId)) {
        //         /**
        //          * note that + sign is to ensure itemId is converted to integer.
        //          */
        //         if (angular.isUndefined(itemId) || !_.isNumber(+itemId)) {
        //             // formObj.data = backupDataAndGetCopy(model.one());
        //             _.merge(formObj.data, backupDataAndGetCopy(model.one()));
        //             formObj.submitLabel = getSubmitLabel();
        //             notify(formObj.data, 'formDataLoaded');
        //             return;
        //         }
        //
        //         var waitConf = {
        //             title   : gettextCatalog.getString('Retrieving data'),
        //             message : gettextCatalog.getString('Please wait while form data is being retrieved from server'),
        //             progress: 10
        //         };
        //         showWait(waitConf);
        //
        //         /**
        //          * if we have the `itemId`, we should grab the data from server
        //          * and assing it to the `form.data`
        //          */
        //         formObj.isBusy = true;
        //         model.one(itemId).get().then(function (remoteData) {
        //             // formObj.data   = backupDataAndGetCopy(remoteData);
        //             // removeAndMerge(formObj.data, backupDataAndGetCopy(remoteData));
        //             loadDataFromData(remoteData);
        //             formObj.isBusy      = false;
        //             formObj.submitLabel = getSubmitLabel(remoteData);
        //             waitConf.progress   = 100;
        //         });
        //     }
        //
        //     function loadDataFromData(remoteData) {
        //         removeAndMerge(formObj.data, backupDataAndGetCopy(remoteData));
        //         if (_.isFunction(options.onDataLoad)) {
        //             options.onDataLoad($injector, options.$scope, formObj);
        //         }
        //         notify(formObj.data, 'formDataLoaded');
        //     }
        //
        //     function startWatch(watchFor) {
        //         options.$scope.$watch(
        //             function () {
        //                 return options.$scope[vm][watchFor];
        //             },
        //             function (newVal, oldVal) {
        //                 if (_.isEqual(_.omit(newVal, ['$$hashKey']), oldVal) || angular.isUndefined(newVal)) {
        //                     return;
        //                 }
        //
        //                 if (watchFor == 'itemId') {
        //                     loadData(newVal);
        //                     /**
        //                      * watch ile takip edilin herhangi bir formun id si form yuklenirken undefined veya null oldugundan
        //                      * dolayı formu submit ederken form mode new olarak atama yapıyor ve normalde update islemi yapmamız
        //                      * gerekirken add işlemi yapıyorduk.watch ile izlenen id tanımlı olarak geldiginde form submit edilirken
        //                      * update yapmak için form mode 'edit' olarak atandı.
        //                      * @type {string}
        //                      */
        //                     formObj.mode = 'edit';
        //                 } else {
        //                     loadDataFromData(newVal);
        //                 }
        //             },
        //             watchFor == 'item'
        //         );
        //     }
        //
        //     function backupDataAndGetCopy(data) {
        //         if (options.hasParent) {
        //             return data;
        //         }
        //
        //         _backupData = data;
        //
        //         if (_.has(data, 'restangularized')) {
        //             return Restangular.copy(data);
        //         }
        //
        //         return angular.copy(data);
        //     }
        //
        //     function submit(mute) {
        //         if (_.isFunction(options.onBeforeSubmit)) {
        //             options.onBeforeSubmit($injector, options.$scope, formObj).then(function (proceed) {
        //                 if (proceed) {
        //                     proceedSubmit();
        //                 } else {
        //                     return;
        //                 }
        //             });
        //         } else {
        //             proceedSubmit();
        //         }
        //
        //         function proceedSubmit() {
        //             if (_.isUndefined(mute)) {
        //                 mute = {
        //                     mute: options.mute,
        //                     stay: options.stay
        //                 };
        //             }
        //
        //             var proceedWith = null;
        //             if (_.has(formObj, 'data.__is_incomplete') && formObj.data.__is_incomplete) {
        //                 proceedWith = update;
        //             } else {
        //                 proceedWith = formObj.mode == 'edit' ? update : add;
        //             }
        //             proceedWith(mute);
        //         }
        //     }
        //
        //     function add(mute) {
        //         $timeout(function () {
        //             formObj.isSaving       = true;
        //             formObj.isSavingFailed = false;
        //             service.add(formObj.data, mute).then(function () {
        //                 formObj.isSaving       = false;
        //                 formObj.isSavingFailed = false;
        //                 //notify(formObj.data, 'formDataAdded');
        //                 reset();
        //             }).catch(function (error) {
        //                 formObj.isSaving       = false;
        //                 formObj.isSavingFailed = true;
        //
        //                 handleException(_.defaults(error, {type: 'rest-error'}));
        //             });
        //         });
        //     }
        //
        //     function update(mute) {
        //         $timeout(function () {
        //             formObj.isSaving       = true;
        //             formObj.isSavingFailed = false;
        //             try {
        //                 service.update(formObj.data, mute).then(function () {
        //                     formObj.isSaving       = false;
        //                     formObj.isSavingFailed = false;
        //                     formObj.data           = backupDataAndGetCopy(formObj.data);
        //                     //notify(formObj.data, 'formDataUpdated');
        //
        //                     var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');
        //                     if ($formController && $formController.$setPristine) {
        //                         $formController.$setPristine();
        //                     }
        //                 }).catch(function (error) {
        //                     formObj.isSaving       = false;
        //                     formObj.isSavingFailed = true;
        //                     handleException(_.defaults(error, {type: 'rest-error'}));
        //                 });
        //             } catch (error) {
        //                 formObj.isSaving       = false;
        //                 formObj.isSavingFailed = true;
        //
        //                 handleException(error);
        //                 return error;
        //             }
        //         });
        //     }
        //
        //     function reset() {
        //         formObj.data = backupDataAndGetCopy(model.one());
        //     }
        //
        //     function cancel() {
        //         var gettextCatalog  = $injector.get('gettextCatalog');
        //         var $formController = angular.element('[name=' + formObj.name + ']').data('$formController');
        //
        //         if ($formController && $formController.$dirty) {
        //             var title   = gettextCatalog.getString('Confirmation');
        //             var message = gettextCatalog.getString('You have un-saved changes that will be lost if you continue.') + ' ' + gettextCatalog.getString('Are you sure that you want to continue?');
        //             showConfirm(title, message, function () {
        //                 notify(null, 'formCanceled');
        //             });
        //         } else {
        //             notify(null, 'formCanceled');
        //         }
        //     }
        //
        //     function notify(_data, event) {
        //         NotifyingService.notify(domain + '.' + event, _data);
        //         NotifyingService.notify('record.' + event);
        //     }
        //
        //     function isReadonly(field) {
        //         if (!options.readonlyFields) {
        //             return false;
        //         }
        //
        //         if (!field) {
        //             return false;
        //         }
        //
        //         if (options.readonlyFields.indexOf(field) == -1) {
        //             return false;
        //         }
        //
        //         return true;
        //     }
        //
        //     function getSubmitLabel(_data) {
        //         return formObj.mode == 'edit' ? (_.get(_data, '__is_incomplete') ? 'Complete' : 'Update') : 'Add'
        //     }
        // }

        function copyToClipboard(text) {

            if (document.execCommand('copy')) {
                clipboard.copy(text);
            } else {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
            }
        }

        /**
         * Make sure that address is an address object
         * @param address
         */
        function formatAddressForPrint(address) {
            var arr = [];
            address.address && arr.push(address.address);
            _.isObject(address.city) && arr.push(address.city.name);
            _.isObject(address.state) && arr.push(address.state.name);
            _.isObject(address.country) && arr.push(address.country.name);

            return arr.join('\n\r');

            // return address.address + '\n\r'
            //        + address.city.name + '\n\r '
            //        + address.state.name + ', '
            //        + address.country.name
        }

        function handlePromiseCatch(e) {
            var err = {
                type   : 'rest-error',
                message: _.get(e, 'data._.class') == 'AjaxReturn' ? e.data.error_message : e.statusText
            };
            handleException(err);
        }

        function handleException(e) {
            var title          = null;
            var message        = null;
            var gettextCatalog = $injector.get('gettextCatalog');
            var notifyMessage  = '<hr/>' + gettextCatalog.getString('Please report this issue to support team, immediately. You can call us at 0-232-464-6610');

            if (_.has(e, 'type')) {
                switch (e.type) {
                    case 'rest-error':
                        title   = gettextCatalog.getString('REST Error');
                        message = e.message + notifyMessage;
                        break;

                    case 'structural-error':
                        title   = gettextCatalog.getString('Structural Error');
                        message = e.message + notifyMessage;
                        break;

                    default:
                        title   = gettextCatalog.getString('JS Exception Occured');
                        message = e.message;
                }
            }
            showError(title, message);
        }
    }

})(window.angular);