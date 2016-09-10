/**
 * Created by murat on 27.01.2016.
 */
(function () {
    var directiveName = 'ImageManager';
    var path          = 'modules/image-manager';
    angular
        .module('apt.imageManager')
        .directive('aptImageManager', fn);

    fn.$inject = ['Restangular'];
    function fn(Restangular) {
        var directiveObj = {
            restrict        : 'EA', // ACME
            scope           : {},
            bindToController: {
                bindId               : '=?',
                bindTo               : '=',
                prefix               : '@?',
                watch                : '@?',
                imageData            : '=imageData',
                imageUploaderSettings: '=?',
                readonly             : '@?',
                itemClass            : '@?',
                images               : '=?',
                autoload             : '@?'
            },
            templateUrl     : path + '/image-manager.tpl.html',
            controller      : controllerFn,

            controllerAs: 'vm' + directiveName
        };

        return directiveObj;

    }

    controllerFn.$inject = ['Restangular', '$scope'];
    function controllerFn(Restangular, $scope) {

        var vm = this;

        if(_.isUndefined(vm.bindTo) && _.isUndefined(vm.images)){
            console.error('You can not leave both `bindTo` and `images` empty. One of them is required to function properly.');
            return;
        }

        vm.watch    = _.isUndefined(vm.watch) ? false : vm.watch == 'true';
        vm.autoload = _.isUndefined(vm.autoload) ? true : vm.autoload == 'true';

        if (_.isUndefined(vm.images)) {
            vm.images = [];
        } else {
            vm.watch    = false;
            vm.autoload = false;
        }

        if (!vm.itemClass) {
            vm.itemClass = 'col-sm-4';
        }


        /**
         * prefix : Veritabanında tablolara verilen app numaları için kullanılmaktadır.
         * Bu proje için kullanılan app numarası app002'dir.
         * @type {{bindTo: (string|*|string), prefix: *}}
         */

        /**
         * @outhor Murat Demir
         * @date 07.03.2016
         *
         * Örnek : /data/dtr/{db:[dtr_id]}/issues/{db:[issue_id]}/images
         *
         * Ö N E M L İ
         *
         * Url parse için ilgili module eğerki birden fazla id bekliyorsa
         * ilk id her zaman bindId ile gönderilecek ikinci id ise image-data
         * içersine nesne olarak dışardan gönderilmelidir.
         *
         *
         */

        if (angular.isDefined(vm.watch) && vm.watch) {
            $scope.$watch('vmImageManager.bindId', function (newVal, oldVal) {
                if (angular.isUndefined(newVal) || newVal == oldVal) {
                    return;
                }
                loadImages(newVal);
            });
        }

        if (_.isUndefined(vm.autoload) || vm.autoload != false) {
            loadImages(vm.bindId);
        }

        function loadImages(id) {
            if (angular.isDefined(vm.prefix)) {
                var restUrl = vm.prefix + '/' + vm.bindTo;
            } else {
                restUrl = vm.bindTo;
            }
            Restangular.one(restUrl, id).getList('images', vm.imageData).then(function (data) {
                angular.merge(vm.images, data.plain());
            })
        }


    }

})();