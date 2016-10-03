/**
 * Created by yasar on 05.12.2015.
 */


(function (app) {

    app.directive('selectorMenu', [function () {
        var directiveObject = {
            //scope: {},
            replace     : true,
            priority    : 100,
            templateUrl : 'directives/selectorMenu/selector-menu.tpl.html',
            controller  : controllerFn,
            controllerAs: 'vmSelectorMenu',
            compile     : compileFn
        };

        return directiveObject;

    }]);

    function compileFn(element, attrs) {
        element.removeAttr('selector-menu');
        element.removeAttr('data-selector-menu');
        delete attrs.selectorMenu;
    }


    controllerFn.$inject = ['$attrs', '$scope', '$element'];
    function controllerFn($attrs, $scope, $element) {
        var vm        = this;
        var modelBase = null;
        var fnNameReload;
        var fnNameResetSelect;
        var fnNameAdd;
        var fnNameEdit;

        if (!_.get($scope, 'builder.selector.showMenu')) {
            vm.enabled = false;
            return;
        }

        var menuConf = {
            addNew: true,
            edit  : true,
            reload: true,
            reset : true
        };

        if (_.isObject($scope.builder.selector.showMenu)) {
            menuConf = _.merge(menuConf, $scope.builder.selector.showMenu);
        }

        if ($attrs.domain) {
            // vm.domain = _.snakeCase($attrs.domain);
            vm.domain = $attrs.domain;


            /**
             *saleitemGroup olarak gelen domain asagıda işlemle Saleitemgroup stringine donusuyor.
             * buda selector menude add delete edit dropdown menu gurubu tuslarının gorunmesını engelliyor.
             * bunun için loads upperFirst ile SaleitemGroup elde edilecek
             */

            vm.Domain = _.upperFirst(vm.domain);
            //vm.Domain = vm.domain.replace(/\w\S*/g, function (txt) { // capitalize words
            //    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            //});

        }

        if ($attrs.modelBase) {
            modelBase = $attrs.modelBase;
        }

        if (menuConf.reload) {
            if (_.hasIn($scope, fnNameReload = modelize('reload' + vm.Domain)) || _.hasIn($scope, fnNameReload = modelize('reload'))) {
                vm.hasReload = true;
            }
        }

        if (menuConf.addNew) {
            if (_.hasIn($scope, fnNameAdd = modelize('addNew' + vm.Domain)) || _.hasIn($scope, fnNameAdd = modelize('addNew'))) {
                vm.hasAdd = true;
            }
        }

        if (menuConf.reset) {
            if (_.hasIn($scope, fnNameResetSelect = modelize('resetSelect' + vm.Domain)) || _.hasIn($scope, fnNameResetSelect = modelize('resetSelect'))) {
                vm.hasResetSelect = true;
            }
        }

        if (menuConf.edit) {
            if (_.hasIn($scope, fnNameEdit = modelize('edit' + vm.Domain)) || _.hasIn($scope, fnNameEdit = modelize('edit'))) {
                vm.hasEdit = true;
            }
        }


        vm.enabled = vm.hasResetSelect || vm.hasAdd || vm.hasEdit || vm.hasReload;


        vm.reload = function () {
            _.get($scope, fnNameReload)();
        };

        vm.add = function () {
            _.get($scope, fnNameAdd)();
        };

        vm.resetSelect = function () {
            _.get($scope, fnNameResetSelect)();
        };

        vm.edit = function () {
            _.get($scope, fnNameEdit)();
        };

        vm.unlock = function () {
            vm.locked = false;
        };

        function modelize(prop) {
            return modelBase ? modelBase + '.' + prop : prop;
        }

    }

})(angular.module('ngApptolia'));