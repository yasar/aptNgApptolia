/*global window */
;(function () {
    'use strict';
    angular
        .module('apt.uploader')
        .directive('aptImageUploader', ['Restangular', '$uibModal', '$rootScope', '$timeout', 'aptTempl',
            function (Restangular, $modal, $root, $timeout, Templ) {
                return {
                    scope      : {
                        readonly: '=',
                        config  : '=config',
                        options : '=settings',
                        model   : '=ngModel'
                    },
                    // templateUrl: 'uploader/image-uploader/image-uploader.tpl.html',
                    templateUrl: function () {
                        if (Templ.appConfig.theme) {
                            return 'modules/uploader/image-uploader/image-uploader.' + Templ.appConfig.theme + '-theme.tpl.html';
                        } else {
                            return 'modules/uploader/image-uploader/image-uploader.tpl.html';
                        }
                    },
                    replace    : true,
                    controller : ['$scope', 'Restangular', 'aptUtils', 'Lightbox',
                        function ($scope, Restangular, aptUtils, Lightbox) {
                            $scope.state = {
                                is_modified: false,
                                is_uploaded: false
                            };

                            $scope.settings = angular.extend({
                                dbtbl         : "`image`",
                                dbfld_recid   : "image_id",
                                dbval_recid   : null, //
                                dbfld_filename: "filename",
                                dbcfg_ref     : null, //
                                dbfld_title   : "title",
                                dbfld_desc    : "desc",
                                dbval_filename: null, //
                                dbval_title   : null, //
                                dbval_desc    : null, //
                                type          : 'image', // upload handler will decide weather this is an image or a regular file
                                cmd           : null
                            }, $scope.options);

                            // $scope.lightboxGroupId = 'lightbox-gr'+_.keys($scope.settings.data)[0];

                            $scope.settings.dbval_title    = $scope.model.title;
                            $scope.settings.dbval_desc     = $scope.model.desc;
                            $scope.settings.dbval_filename = $scope.model.filename;
                            $scope.settings.dbval_recid    = $scope.model.image_id;

                            $scope.title       = $scope.settings.dbval_title;
                            $scope.description = $scope.settings.dbval_desc;
                            $scope.caption     = _.startCase($scope.model.caption) || _.startCase($scope.model.type);

                            /**
                             * todo type için sorulacak.
                             */

                            if ($scope.model.filename) {
                                $scope.uploadFile        = $scope.model.upload_path + '/' + $scope.model.image_id + '/' + $scope.model.filename;
                                $scope.state.is_uploaded = true;
                                $scope.state.is_modified = false;
                            } else {
                                $scope.uploadFile        = null;
                                $scope.state.is_uploaded = false;
                                $scope.state.is_modified = false;
                            }

                            $scope.editDescription = function () {
                                var modalInstance = $modal.open({
                                    templateUrl: 'modules/uploader/image-uploader/image-uploader-desc.tpl.html',
                                    controller : ['$scope', 'description', 'title', 'Restangular',
                                        function ($scopeModal, description, title, Restangular) {
                                            $scopeModal.data = {
                                                description: description,
                                                title      : title
                                            };

                                            $scopeModal.done = function () {
                                                var settings         = angular.copy($scope.settings);
                                                settings.cmd         = 'updateTitle';
                                                settings.dbval_title = $scopeModal.data.description;

                                                Restangular.all('/system/image/update').one(settings.dbval_recid).customPOST(settings).then(function (data) {
                                                    modalInstance.close($scopeModal.data);
                                                });
                                            };
                                        }],
                                    resolve    : {
                                        description: function () {
                                            return $scope.description;
                                        },
                                        title      : function () {
                                            return $scope.title
                                        }
                                    }
                                });

                                modalInstance.result.then(function (data) {
                                    $scope.description = data.description;
                                    $scope.title       = data.title;
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
                                            $scope.uploadFile        = result;
                                            $scope.state.is_modified = true;
                                            $scope.state.is_uploaded = false;
                                        });
                                    };

                                    fileReader.readAsDataURL(event.target.files[0]);

                                    fileElement.remove();
                                });
                            };

                            $scope.crop = function () {
                                var modalInstance = $modal.open({
                                    templateUrl: 'modules/uploader/image-uploader/image-uploader-crop.tpl.html',
                                    controller : ['$scope', 'uploadFile',
                                        function ($scopeModal, uploadFile) {
                                            $scopeModal.imageOut                      = '';
                                            $scopeModal.options                       = {};
                                            $scopeModal.options.image                 = uploadFile.data;
                                            $scopeModal.options.outputImageRatioFixed = false;
                                            $scopeModal.options.viewShowFixedBtn      = true;
                                            $scopeModal.options.viewShowRotateBtn     = true;
                                            $scopeModal.options.viewShowCropTool      = true;
                                            $scopeModal.options.inModal               = true;


                                            $scopeModal.cropImage = function () {
                                                $scopeModal.$broadcast('cropImage');
                                                $scope.state.is_modified = true;
                                                $scope.state.is_uploaded = false;
                                                modalInstance.close($scopeModal.options.image);
                                            };
                                        }],
                                    resolve    : {
                                        uploadFile: function () {
                                            if ($scope.uploadFile.substring(0, 10) == 'data:image') {
                                                return $scope.uploadFile;
                                            }

                                            var settings = angular.copy($scope.settings);
                                            settings.cmd = 'getImage';

                                            //return Restangular.one('system/image', settings).customGET('').then(function (data) {
                                            //    return data;
                                            //}, function () {
                                            //    alert('Error occured while retreiving the full size image file on the server side.');
                                            //    return null;
                                            //});
                                            return Restangular.one('/system/image/crop', settings.dbval_recid).customPOST(settings).then(function (data) {
                                                return data;
                                            }, function () {
                                                aptUtils.showError('Error', 'Error occured while retreiving the full size image file on the server side.');
                                                return null;
                                            });
                                        }
                                    }
                                });

                                modalInstance.result.then(function (data) {
                                    $scope.uploadFile = data;
                                });
                            };

                            $scope.upload = function () {
                                var settings             = angular.copy($scope.settings);
                                settings.bytearrayObject = $scope.uploadFile;
                                settings.return_ar       = true;

                                var waitConf = {
                                    progress: 0
                                };
                                aptUtils.showWait(waitConf);

                                Restangular.all('/system/image/upload').post(settings).then(function (data) {
                                    waitConf.progress = 100;

                                    if (data == 'false') {
                                        aptUtils.showError('Error', 'File could not be uploaded. Make sure folder permissions are properly set.');
                                        return;
                                    }
                                    $scope.model.filename    = data.filename;
                                    $scope.uploadFile        = data.upload_path + '/' + data.image_id + '/' + data.filename;
                                    $scope.state.is_uploaded = true;
                                    $scope.state.is_modified = false;
                                    console.log('file uploaded:' + data);
                                }, function (error) {
                                    waitConf.progress = 100;
                                    aptUtils.showError('Error', error);
                                });
                            };

                            $scope.delete = function () {
                                aptUtils.showDeleteConfirm(function () {
                                    var settings             = angular.copy($scope.settings);
                                    settings.cmd             = 'delete';
                                    settings.data.uploadFile = $scope.uploadFile;

                                    Restangular.one('/system/image/delete', settings.dbval_recid).customPOST(settings)
                                        .then(function (data) {
                                            $scope.uploadFile        = null;
                                            $scope.model.filename    = null;
                                            $scope.state.is_modified = true;
                                            $scope.state.is_uploaded = false;
                                        }, function () {
                                            aptUtils.showConfirm('Confirmation',
                                                'Error occured while deleting the file on the server side.' +
                                                '\n\nYou can ignore the error and try uploading a new file, ' +
                                                'or cancel the operation and create a support ticket regarding to ' +
                                                'resolve the issue. \n\n Do you want ignore the error and upload a new file?',
                                                function () {
                                                    $scope.uploadFile        = null;
                                                    $scope.model.filename    = null;
                                                    $scope.state.is_modified = true;
                                                    $scope.state.is_uploaded = false;
                                                });
                                        });
                                });
                            };

                            $scope.rotate = function (degree) {
                                if (!$scope.state.is_uploaded) {
                                    aptUtils.showWarning('You should upload the image before you can rotate it.');
                                    return;
                                }

                                var settings = angular.copy($scope.settings);
                                settings.cmd = 'rotate';

                                // php will do a counter clock-wise rotation
                                // so, we will change the degree to comply the human intuition.
                                settings.degree = '' + (360 - degree);

                                settings.return_image_size = 'm.';

                                Restangular.one('/system/image/rotate').customPOST(settings).then(function (data) {
                                    $scope.uploadFile     = data.data.thumb + '?' + Math.floor((Math.random() * 100000000) + 1);
                                    $scope.uploadFileOrig = data.data.orig + '?' + Math.floor((Math.random() * 100000000) + 1);
                                });
                            };

                            $scope.openLightboxModal = function () {
                                Lightbox.openModal([$scope.uploadFile], 0);
                            };

                        }],
                    link       : function (scope, element, attrs) {
                        // utils.lightbox(scope.lightboxGroupId);
                    }
                };
            }]);
})();