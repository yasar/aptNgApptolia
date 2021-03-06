/*global window */
;(function (angular) {
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
                }
            ];
        }
    ]);
    
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
            jsGetURLParameter                : jsGetURLParameter,
            getFormController                : getFormController,
            findController                   : findController,
            getScopeById                     : getScopeById,
            goto                             : goto,
            handleException                  : handleException,
            handlePromiseCatch               : handlePromiseCatch,
            showError                        : showError,
            showConfirm                      : showConfirm,
            showContinueConfirm              : showContinueConfirm,
            showDeleteConfirm                : showDeleteConfirm,
            showInfo                         : showInfo,
            showSuccess                      : showSuccess,
            showWait                         : showWait,
            showWarning                      : showWarning,
            showFormDirectiveInPopup         : showFormDirectiveInPopup,
            popupDirective                   : popupDirective,
            formatAddressForPrint            : formatAddressForPrint,
            grabLabelFromAttrs               : grabLabelFromAttrs,
            download                         : download
        };
        
        function grabLabelFromAttrs(attrs) {
            var str = null;
            
            if (_.has(attrs, 'label')) {
                str = attrs.label;
            }
            else if (_.has(attrs, 'field')) {
                str = attrs.field;
            }
            else if (_.has(attrs, 'ngModel')) {
                str = parseModel(attrs.ngModel);
            }
            else if (attrs.$$element.find('[data-ng-model]').length) {
                str = parseModel(attrs.$$element.find('[data-ng-model]').attr('data-ng-model'));
            }
            else if (_.has(attrs, 'type')) {
                str = attrs.type;
            }
            
            if (str && _.endsWith(str, '_id')) {
                str = str.substr(0, str.length - 3);
            }
            
            return _.startCase(str);
            
            function parseModel(model) {
                var arr = model.split('.');
                var str = arr[arr.length - 1];
                return str;
            }
        }
        
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
            var _options       = _.defaults(options, aptTempl.appConfig.defaults.dialogs.error);
            var _translate     = _.isUndefined(translate) ? true : translate;
            var _message       = null;
            var _title         = title;
            if (_translate) {
                _title = gettextCatalog.getString(title);
                if (_.isObject(message)) {
                    if (_.has(message, 'data.error_message')) {
                        _message = message.data.error_message;
                    }
                }
                else {
                    _message = gettextCatalog.getString(message);
                }
            }
            return dialogs.error(_title, _message, _options);
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
        
        function showSuccess(options) {
            var dialogs  = $injector.get('dialogs');
            var aptTempl = $injector.get('aptTempl');
            options      = _.defaults(options, aptTempl.appConfig.defaults.dialogs.info);
            return dialogs.notify('Success', 'The operation completed, successfully.', options);
        }
        
        function showConfirm(title, message, onAcceptFn, onRejectFn, options) {
            var dialogs  = $injector.get('dialogs');
            var aptTempl = $injector.get('aptTempl');
            options      = _.defaults(options, aptTempl.appConfig.defaults.dialogs.confirm);
            var dlg      = dialogs.confirm(title, message, options);
            dlg.result.then(onAcceptFn, onRejectFn);
        }
        
        function showContinueConfirm(onAcceptFn, onRejectFn, options) {
            var title   = 'Continue?';
            var message = 'Are you sure you want to continue';
            
            showConfirm(title, message, onAcceptFn, onRejectFn, options);
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
                    }
                    else {
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
                }
            ], undefined, aptTempl.appConfig.defaults.dialogs.large);
        }
        
        function popupDirective(builder, name, conf) {
            
            conf = _.defaults(conf, {
                controller: function () {
                },
                attrs     : {},
                size      : 'large'
            });
            
            var $templateCache = $injector.get('$templateCache');
            var dialogs        = $injector.get('dialogs');
            var aptTempl       = $injector.get('aptTempl');
            var directiveName  = builder.getDirectiveName(name);
            
            ///
            
            var tpl = '<div data-' + _.kebabCase(directiveName);
            _.forOwn(conf.attrs, function (value, key) {
                tpl += ' data-' + _.kebabCase(key) + '="' + value + '"';
            });
            tpl += '></div>';
            
            ///
            
            var popupConf =
                    _.has(aptTempl.appConfig.defaults.dialogs, conf.size)
                        ? _.get(aptTempl.appConfig.defaults.dialogs, conf.size)
                        : {};
            
            var path = builder.getPath('cache') + '/popup' + directiveName + '.html';
            $templateCache.put(path, tpl);
            dialogs.create(path, ['$scope', '$injector', '$uibModalInstance', conf.controller], undefined, popupConf);
        }
        
        function goto(conf) {
            var url       = '';
            var $q        = $injector.get('$q');
            var deferred  = $q.defer();
            var $location = $injector.get('$location');
            var $state    = $injector.get('$state');
            var $timeout  = $injector.get('$timeout');
            var aptTempl  = $injector.get('aptTempl');
            
            if (conf.hasOwnProperty('segment')) {
                try {
                    if (angular.isObject(conf.segment)) {
                        var params = _.merge({},
                            conf.segment.params,
                            (conf.search ? conf.search : {})
                        );
                        return $state.go(conf.segment.name, params, {reload: false});
                    }
                    else {
                        return $state.go(conf.segment);
                    }
                    // retuils.rn;
                    //
                    // if (!url) {
                    //     aptUtils.showError('Url can not be generated. Please check the console log.');
                    //     console.log(conf);
                    // }
                    //
                    // /**
                    //  * $state.href will return relative url containing hashPrefix
                    //  * and location.path() does not comply with hashed url.
                    //  * so we have to clean that portion up, if there is any.
                    //  */
                    // if (aptTempl.appConfig.html5Mode) {
                    //     url = _.replace(url, '#' + aptTempl.appConfig.hashPrefix, '');
                    // }
                } catch (e) {
                    console.warn((conf.segment.name || conf.segment) + ' is not exist');
                    url = $state.href('main.page404');
                }
            }
            else if (conf.hasOwnProperty('url')) {
                url = conf.url;
            }
            
            if (!conf.hasOwnProperty('search')) {
                conf.search = null;
            }
            
            $timeout(function () {
                if (conf.search) {
                    $location.path(url).search(conf.search);
                }
                else {
                    $location.path(url);
                }
                deferred.resolve();
            }, 1);
            
            return deferred.promise;
        }
        
        // function goto(conf) {
        //     var url          = '';
        //     var $q           = $injector.get('$q');
        //     var deferred     = $q.defer();
        //     var $location    = $injector.get('$location');
        //     var $state       = $injector.get('$state');
        //     var $timeout     = $injector.get('$timeout');
        //     var aptTempl     = $injector.get('aptTempl');
        //
        //
        //     if (conf.hasOwnProperty('segment')) {
        //         try {
        //             if (angular.isObject(conf.segment)) {
        //                 url = $state.href(conf.segment.name, conf.segment.params);
        //             } else {
        //                 url = $state.href(conf.segment);
        //             }
        //
        //             if (!url) {
        //                 aptUtils.showError('Url can not be generated. Please check the console log.');
        //                 console.log(conf);
        //             }
        //
        //             /**
        //              * $state.href will return relative url containing hashPrefix
        //              * and location.path() does not comply with hashed url.
        //              * so we have to clean that portion up, if there is any.
        //              */
        //             if (aptTempl.appConfig.html5Mode) {
        //                 url = _.replace(url, '#' + aptTempl.appConfig.hashPrefix, '');
        //             }
        //         } catch (e) {
        //             console.warn((conf.segment.name || conf.segment) + ' is not exist');
        //             url = $state.href('main.page404');
        //         }
        //     } else if (conf.hasOwnProperty('url')) {
        //         url = conf.url;
        //     }
        //
        //     if (!conf.hasOwnProperty('search')) {
        //         conf.search = null;
        //     }
        //
        //     $timeout(function () {
        //         if (conf.search) {
        //             $location.path(url).search(conf.search);
        //         } else {
        //             $location.path(url);
        //         }
        //         deferred.resolve();
        //     }, 1);
        //
        //     return deferred.promise;
        // }
        
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
                        if (scope.$$nextSibling) {
                            traverse(scope.$$nextSibling);
                        }
                        if (scope.$$childHead) {
                            traverse(scope.$$childHead);
                        }
                    }
                }
            }
            
        }
        
        function getFormController(scope) {
            var controller = null;
            
            function search(scope) {
                _.forOwn(scope, function (fn) {
                    if (!controller && _.isObject(fn) && fn.constructor && fn.constructor.name == 'FormController') {
                        controller = fn;
                    }
                });
                
                if (!controller && scope.$parent) {
                    search(scope.$parent);
                }
            }
            
            search(scope);
            
            return controller;
        }
        
        function findController(controllerAs, scope) {
            var controller = null;
            
            function search(scope) {
                _.forOwn(scope, function (value, key) {
                    if (!controller && key == controllerAs && _.isObject(value)) {
                        controller = value;
                    }
                });
                
                if (!controller && scope.$parent) {
                    search(scope.$parent);
                }
            }
            
            search(scope);
            
            return controller;
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
                
            }
            else {
                /**
                 * searchArr is causing a bug.
                 * suppose you are at product page, and used the filter to filter our the list.
                 * so in your url parameter you have a `status` param is set.
                 * then, navigate to mast page, the filter is autloaded on page loaded,
                 * then bum, the previous status is caught by the mast filter, which is not applicable and
                 * causes server side 500 error.
                 * so now, we are disabling this feature.
                 * pay close attention to figure out which code utilize this feature and
                 * provide a better solution thereafter.
                 */
                if (false) {
                    _.each(_this.searchArr, function (item) {
                        if (returnValue != null) {
                            return;
                        }
                        if (item.param == paramName) {
                            returnValue = item.value;
                        }
                        else if (_.isObject(item.param)) {
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
        
        function jsGetURLParameter(sParam, defaultValue) {
            var sPageURL      = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
            return defaultValue;
        }
        
        /**
         *
         * set param=false to reset internal cache!
         *
         * @param param
         * @param value
         * @param timer
         * @returns {*}
         */
        function setUrlSearchParamValue(param, value, timer) {
            var _this    = this;
            var $timeout = $injector.get('$timeout');
            if (this.timerPromise) {
                $timeout.cancel(this.timerPromise);
            }
            
            if (!this.searchArr) {
                this.searchArr = [];
            }
            
            if (param === false) {
                this.searchArr = [];
                return;
            }
            
            var searchObj = {
                param: param,
                value: value
            };
            
            var idx = _.findIndex(this.searchArr, {param: param});
            if (idx > -1) {
                this.searchArr[idx] = searchObj;
            }
            else {
                this.searchArr.push(searchObj);
            }
            
            if (!_.isUndefined(timer) && !timer) {
                proceed();
            }
            else {
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
                        // && (_.isUndefined(item.value) || _.isNull(item.value))) {
                        && (_.isUndefined(item.value))) { // we need null values
                        
                        delete $location.$$search[item.param];
                        
                    }
                    else if (_.isString(item.param)) {
                        _.set($location.$$search, item.param, _.isObject(item.value) ? angular.toJson(item.value) : item.value);
                    }
                    else {
                        _.forIn(item.param, function (value, key) {
                            // if (_.isUndefined(value) || _.isNull(value)) {
                            if (_.isUndefined(value)) {
                                delete item.param[key];
                                delete $location.$$search[key];
                            }
                        });
                        _.merge($location.$$search, item.param);
                    }
                    
                });
                $location.$$compose();
                
                /**
                 * once we are done, clear the cache
                 * so that future operations will have a clean cache.
                 */
                _this.searchArr = [];
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
                            }
                            else {
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
            for (var member in object) {
                delete object[member];
            }
        }
        
        function nullifyObjectProperties(object) {
            for (var member in object) {
                object[member] = null;
            }
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
        
        function copyToClipboard(text) {
            
            if (document.execCommand('copy')) {
                clipboard.copy(text);
            }
            else {
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
        }
        
        //        function handlePromiseCatch(e) {
        //            var err = {
        //                type   : 'rest-error',
        //                message: !_.isObject(e) ? e
        //                    : _.get(e, 'data._.class') == 'AjaxReturn' ? e.data.error_message
        //                             : e.statusText
        //            };
        //            handleException(err);
        //        }
        
        function handlePromiseCatch(e) {
            
            if (e.isHandled) {
                return;
            }
            
            var errObj = {
                type   : 'rest-error',
                message: ''
            };
            
            if (!_.isObject(e)) {
                errObj.message = e;
            }
            
            else if (_.get(e, 'data._.class') == 'AjaxReturn') {
                errObj.message = e.data.error_message;
                
                if (_.has(e, 'data.error_nature')) {
                    switch (e.data.error_nature) {
                        case 'WarningException':
                            errObj.type = 'warning';
                            break;
                        case 'InfoException':
                            errObj.type = 'info';
                            break;
                    }
                }
            }
            
            else if (e.status && e.status == 500) {
                errObj.type    = e.status;
                errObj.message = e.data;
            }
            
            errObj.exception = e;
            
            handleException(errObj);
        }
        
        function handleException(e) {
            
            if (e.isHandled) {
                return;
            }
            
            var title          = null;
            var message        = null;
            var gettextCatalog = $injector.get('gettextCatalog');
            var notifyMessage  = '<hr/>' + gettextCatalog.getString('Please report this issue to support team, immediately. You can call us at 0-232-464-6610');
            
            if (_.has(e, 'type')) {
                switch (e.type) {
                    case 'rest-error':
                        title   = gettextCatalog.getString('REST Error');
                        message = e.message + notifyMessage;
                        showError(title, message);
                        break;
                    
                    case '500':
                    case 500:
                        title   = gettextCatalog.getString('Internal Server Error');
                        message = e.message + notifyMessage;
                        showError(title, message);
                        break;
                    
                    case 'structural-error':
                        title   = gettextCatalog.getString('Structural Error');
                        message = e.message + notifyMessage;
                        showError(title, message);
                        break;
                    
                    case 'info':
                        title   = gettextCatalog.getString('Info');
                        message = e.message;
                        showInfo(title, message);
                        break;
                    
                    case 'warning':
                        title   = gettextCatalog.getString('Warning');
                        message = e.message;
                        showWarning(title, message);
                        break;
                    
                    default:
                        title   = gettextCatalog.getString('JS Exception Occured');
                        message = e.message;
                        showError(title, message);
                }
            }
            
        }
        
        function download(fileDownload) {
            var downloadLink = angular.element('<a></a>');//create a new  <a> tag element
            downloadLink.attr('href', fileDownload);
            downloadLink.attr('target', '_blank');
            downloadLink[0].click();//call click function
        }
    }
    
})(window.angular);