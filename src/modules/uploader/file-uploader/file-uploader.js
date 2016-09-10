/*global window */
(function () {
    'use strict';
    angular
        .module('apt.uploader')
        .directive('aptFileUploader', ['Restangular', '$uibModal', '$rootScope', '$timeout',
            function (Restangular, $modal, $root, $timeout) {
                return {
                    scope      : {
                        readonly: '=',
                        config  : '=config',
                        options : '=settings',
                        model   : '=ngModel'
                    },
                    templateUrl: 'modules/uploader/file-uploader/file-uploader.tpl.html',
                    replace    : true,
                    controller : ['$scope', 'Restangular', 'aptUtils',
                        function ($scope, Restangular, aptUtils) {
                            $scope.state = {
                                is_modified: false,
                                is_uploaded: false
                            };

                            $scope.settings = angular.extend({
                                dbtbl         : "file",
                                dbfld_recid   : "file_id",
                                dbval_recid   : null, //
                                dbfld_filename: "filename",
                                dbcfg_ref     : null, //
                                dbfld_title   : "title",
                                dbval_filename: null, //
                                dbval_title   : null, //
                                type          : 'file', // upload handler will decide weather this is an file or a regular file
                                cmd           : null
                            }, $scope.options);

                            // $scope.lightboxGroupId = 'lightbox-gr'+_.keys($scope.settings.data)[0];

                            $scope.settings.dbval_title    = $scope.model.title;
                            $scope.settings.dbval_filename = $scope.model.filename;
                            $scope.settings.dbval_recid    = $scope.model.file_id;

                            //var type = typeService.get($scope.model.type_id);
                            //$scope.caption = type ? $root.lang(type.name) : '...';
                            //$scope.caption     = 'a';
                            //$scope.description = $scope.settings.dbval_title;

                            if ($scope.model.filename) {
                                $scope.uploadFile        = $scope.model.upload_path + '/' + $scope.model.file_id + '/' + $scope.model.filename;
                                $scope.state.is_uploaded = true;
                                $scope.state.is_modified = false;
                            } else {
                                $scope.uploadFile        = null;
                                $scope.state.is_uploaded = false;
                                $scope.state.is_modified = false;
                            }

                            $scope.editDescription = function () {
                                var modalInstance = $modal.open({
                                    templateUrl: 'modules/uploader/file-uploader/file-uploader-desc.tpl.html',
                                    controller : ['$scope', 'description', 'title', 'Restangular',
                                        function ($scopeModal, description, title, Restangular) {

                                            $scopeModal.data = {
                                                description: description,
                                                title      : title
                                            };

                                            $scopeModal.done = function () {
                                                var settings = angular.copy($scope.settings);
                                                var fileInf  = {
                                                    description: $scopeModal.data.description,
                                                    title      : $scopeModal.data.title,
                                                    file_id    : settings.dbval_recid
                                                };

                                                Restangular.all('/system/file/update').one(settings.dbval_recid).customPOST(fileInf).then(function (data) {
                                                    modalInstance.close($scopeModal.data);
                                                });
                                            };
                                        }],
                                    resolve    : {
                                        description: function () {
                                            return $scope.model.description;
                                        },
                                        title      : function () {
                                            return $scope.model.title
                                        }
                                    }
                                });

                                modalInstance.result.then(function (data) {
                                    $scope.model.description = data.description;
                                    $scope.model.title       = data.title;
                                });
                            };

                            $scope.selectFile = function () {
                                var fileElement = angular.element('<input type="file" style="display: none;" />');
                                angular.element('body').append(fileElement);
                                fileElement.trigger('click');
                                fileElement.change(function (event) {
                                    var fileReader    = new FileReader();
                                    fileReader.onload = function () {
                                        var result = this.result;
                                        $timeout(function () {
                                            $scope.settings.dbval_filename = event.target.files[0].name;
                                            $scope.uploadFile              = result;
                                            $scope.state.is_modified       = true;
                                            $scope.state.is_uploaded       = false;
                                        });
                                    };

                                    fileReader.readAsDataURL(event.target.files[0]);

                                    fileElement.remove();
                                });
                            };

                            $scope.upload = function () {
                                var settings             = angular.copy($scope.settings);
                                settings.bytearrayObject = $scope.uploadFile;
                                settings.return_ar       = true;

                                Restangular.all('/system/file/upload').post(settings).then(function (data) {
                                    $scope.model.filename    = data.filename;
                                    $scope.uploadFile        = $scope.model.upload_path + '/' + $scope.model.file_id + '/' + $scope.model.filename;
                                    $scope.state.is_uploaded = true;
                                    $scope.state.is_modified = false;
                                    console.log('file uploaded:' + data);
                                }, function (error) {
                                    aptUtils.showError('Error', error);
                                });
                            };

                            $scope.delete = function () {
                                if (confirm('Are you sure that you want to delete this file?')) {

                                    var settings             = angular.copy($scope.settings);
                                    settings.cmd             = 'delete';
                                    settings.data.uploadFile = $scope.uploadFile;

                                    Restangular.one('/system/file/delete', settings.dbval_recid).customPOST(settings).then(function (data) {
                                        $scope.uploadFile        = null;
                                        $scope.model.filename    = data.filename;
                                        $scope.state.is_modified = true;
                                        $scope.state.is_uploaded = false;
                                    }, function () {
                                        var errMsg = 'Error occured while deleting the file file on the server ' +
                                            'side.\n\nYou can ignore the error and try uploading a new file file, ' +
                                            'or cancel the operation and create a support ticket regarding to ' +
                                            'resolve the issue. \n\n Do you want ignore the error and ' +
                                            'upload a new file?';
                                        aptUtils.showConfirm('Error', errMsg, function () {
                                            $scope.uploadFile        = null;
                                            $scope.model.filename    = null;
                                            $scope.state.is_modified = true;
                                            $scope.state.is_uploaded = false;
                                        });
                                        // if (confirm('Error occured while deleting the file file on the server side.\n\nYou can ignore the error and try uploading a new file file, or cancel the operation and create a support ticket regarding to resolve the issue. \n\n Do you want ignore the error and upload a new file?')) {
                                        //     $scope.uploadFile        = null;
                                        //     $scope.model.filename    = null;
                                        //     $scope.state.is_modified = true;
                                        //     $scope.state.is_uploaded = false;
                                        // }
                                    });
                                }
                            };

                        }],
                    link       : function ($scope, element, attrs) {
                        // utils.lightbox($scope.lightboxGroupId);
                    }
                };
            }]);
})();