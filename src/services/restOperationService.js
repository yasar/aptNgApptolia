/**
 /**
 * Created by yasar on 02.05.2015.
 *
 */

;(function () {
    angular
        .module('ngApptolia')
        .factory('restOperationService', fn);

    fn.$inject = [
        '$templateCache',
        'dialogs',
        '$location',
        '$timeout',
        '$injector',
        'gettextCatalog',
        'NotifyingService',
        'aptTempl',
        'aptUtils',
        'Restangular'
    ];
    function fn($templateCache, dialogs, $location, $timeout,
                $injector, gettextCatalog, NotifyingService, Templ, aptUtils, Restangular) {

        var options = null;

        return {
            /**
             * conf: {
                 *      size: sm|md|lg
                 *      popup: false | true
                 *      add_before: false | true
                 * }
             *
             * @param conf
             */
            edit      : editFn,
            delete    : deleteFn,
            addNew    : addNewFn,
            getOptions: getOptionsFn
        };

        function getOptionsFn() {
            return options;
        }

        function editFn(conf) {

            checkBuilder(conf);

            if (conf.discardPopup) {
                var id      = conf._builder.getPrimaryKey();
                var segment = [
                    'main',
                    (conf._builder.package ? conf._builder.package : ''),
                    (conf._builder.domain ? conf._builder.domain : (conf.type ? conf.type : '')),
                    'edit'
                ];
                segment     = segment.join('.').replace(/\.\./g, '.');
                aptUtils.goto({segment: {name: segment, params: {id: conf.data[id]}}});
                return;
            }

            if (angular.isObject(conf.data) || conf.popup) {

                var size          = conf.size || 'lg';
                var readonlyItems = conf.readonlyItems || [];
                var popupOptions  = {
                    type         : conf.type,
                    suffix       : conf.suffix,
                    data         : conf.data,
                    size         : size,
                    stay         : conf.stay,
                    readonlyItems: readonlyItems
                };

                if (angular.isFunction(conf.data.then)) {
                    conf.data.then(function (data) {
                        popupOptions.data = data;
                        showPopup(popupOptions);
                    });
                } else {
                    showPopup(popupOptions);
                }

            } else {
                var segment = [
                    'main',
                    (conf._builder.package ? conf._builder.package : ''),
                    (conf._builder.domain ? conf._builder.domain : (conf.type ? conf.type : '')),
                    'edit'
                ];
                segment     = segment.join('.').replace(/\.\./g, '.');
                aptUtils.goto({segment: {name: segment, params: {id: conf.data}}});
            }
        }

        function deleteFn(conf) {
            var translated = {
                confirm: gettextCatalog.getString('Are you sure that you want to delete this record?')
            };
            Templ.blurPage(true);
            var confirm = dialogs.confirm('Confirm Delete', translated.confirm, {
                size     : 'sm',
                animation: true
            });
            confirm.result.then(function () {
                Restangular.copy(conf.data).remove().then(function (response) {
                    if (response === 'true') {
                        var allData                               = conf.allData;
                        var filterObj                             = {};
                        filterObj[_.snakeCase(conf.type) + '_id'] = conf.data[_.snakeCase(conf.type) + '_id'];
                        allData.splice(_.indexOf(allData, _.find(allData, filterObj)), 1);
                    }
                    Templ.blurPage(false);
                });
            }, function () {
                Templ.blurPage(false);
            });
        }

        function addNewFn(conf) {
            checkBuilder(conf);
            /**
             * ----------------
             * add_before
             * ----------------
             * some records may need to be first added into database with empty dataset and
             * then edited immediately as if it is like adding a new record.
             *
             * this case is required for person module. Person form have a contact tab which requires
             * the primary_key id is available in the form.
             *
             * NOTE THAT we send {__is_incomplete:1} as the posted data for the new record,
             * in return we will have the primary_key id for the new record.
             * __is_incomplete will indicate that we haven't completed this record, yet.
             *
             * this is a protection against accidental add-new clicks.
             * we should have our server-side scripts and sql queries to properly handle this case.
             *
             */
            if (conf.hasOwnProperty('add_before') && conf.add_before) {

                conf.discardPopup = false;

                /**
                 * Use the angular $injector service to manually inject the Model service
                 */
                var modelService  = $injector.get(conf._builder.getServiceName('Model'));
                var moduleService = $injector.get(conf._builder.getServiceName('Service'));
                var $rootScope    = $injector.get('$rootScope');
                var $timeout      = $injector.get('$timeout');

                var waitConf = {
                    progress: 0
                };
                aptUtils.showWait(waitConf);

                /**
                 * now we post to the model service which will add a new record with and empty dataset.
                 * in return, we will have a data-row having the primary_key id which will be good for editing.
                 */
                var _obj = modelService.one();
                _.merge(_obj, _.get(conf, 'initialData'), {__is_incomplete: 1});
                _obj.save().then(function (data) {

                    if (!data || data == 'false') {
                        console.error('server returned false. make sure database table has __is_incomplete column configured properly.');
                        return;
                    }
                    $timeout(function () {
                        waitConf.progress = 100;

                        if (!conf.popup && angular.isDefined(data.__is_incomplete)) {
                            conf.discardPopup = true;
                        }

                        /**
                         * grab the data from the server
                         */
                        conf.data = data;

                        /**
                         * once the data is updated, it should be a real record.
                         * so set the incomplete flag to null
                         *
                         * UPDATE: this should be done in utils/form
                         * so that we can decide if this is an edit or new form.
                         */
                        // conf.data.__is_incomplete = null;

                        /**
                         * now call the edit method along with our data
                         */
                        editFn(conf);
                    });
                }, function (error) {
                    waitConf.progress = 99;
                    aptUtils.showError('Error', error);
                });


                /**
                 * we expect the promise from model.post() will takeover the proceeding.
                 * so we just return here to end the process.
                 */
                return;
            }
            else {
                showPopup(conf);
            }
        }

        function showPopup(_options) {
            options = _.extend({
                type         : null,
                suffix       : null,
                data         : null,
                size         : null,
                readonlyItems: null,
                stay         : null,
            }, _options);

            if (!options.suffix) {
                options.suffix = 'form';
            }

            /**
             * vesselPosition gibi type 'ları parçalamak için
             */
            // options.type = _.kebabCase(options.type);
            $timeout(function () {
                var dialogsOptions = Templ.appConfig.defaults.dialogs.edit;
                if (options.hasOwnProperty('size')) {
                    dialogsOptions.size = options.size;
                }

                var _path = '/' + options.type + '/edit.html';
                $templateCache.put(_path,
                    '<div data-apt-' + _.kebabCase(options.type) + '-' + options.suffix + ' ' +
                    'data-item="item"' + '  ' + 'stay=' + options.stay + '  ' +
                    'data-readonly-items="readonlyItems"></div>');
                dialogs.create(_path
                    , ['$scope', '$injector', '$uibModalInstance', dialogControllerFn]
                    , undefined
                    , dialogsOptions);
            });
        }

        function checkBuilder(conf) {
            if (!conf._builder) {
                if (!conf.type) {
                    throw new Exception('You must provide either `_builder` or `type` for restOperation to function');
                }

                var $window = $injector.get('$window');
                if (!_.has($window, _.camelCase(conf.type + 'Builder'))) {
                    throw new Exception('restOperation could not find `' + _.camelCase(conf.type + 'Builder') + '` in global scope.');
                }

                conf._builder = $window[_.camelCase(conf.type + 'Builder')];
            }

            if (!conf.type) {
                conf.type = conf._builder.domain;
            }
        }
    }

    function dialogControllerFn($scope, $injector, $uibModalInstance) {
        var NotifyingService     = $injector.get('NotifyingService');
        var restOperationService = $injector.get('restOperationService');
        var aptTempl             = $injector.get('aptTempl');
        var options              = restOperationService.getOptions();

        if (options.data) {
            $scope.item = options.data;
        }

        if (options.readonlyItems) {
            $scope.readonlyItems = options.readonlyItems;
        }

        aptTempl.blurPage(true);


        NotifyingService.subscribe($scope, 'record.added', function (event, stay) {
            if (stay.stay) {
                return;
            }
            $uibModalInstance.close('apt:formCloseConfirmed');
            aptTempl.blurPage(false);
        }, true);

        NotifyingService.subscribe($scope, _.camelCase(options.type) + ':updated', function (event, stay) {
            if (stay.stay) {
                return;
            }
            $uibModalInstance.close('apt:formCloseConfirmed');
            aptTempl.blurPage(false);
        }, true);

        NotifyingService.subscribe($scope, _.camelCase(options.type) + '.formCanceled', function () {
            $uibModalInstance.close('apt:formCloseConfirmed');
            aptTempl.blurPage(false);
        }, false);

        $scope.$on('modal.closing', function (event, resultOrReason, closing) {

            if (resultOrReason == 'apt:formCloseConfirmed') {
                // aptTempl.blurPage(false);
                return;
            }

            NotifyingService.notify(_.camelCase(options.type) + '.formCancelRequested');
            return event.preventDefault();

        });
    }
})();