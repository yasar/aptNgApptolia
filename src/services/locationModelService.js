(function (app) {
    app.factory('aptLocationModelService', ['Restangular',
        function (Restangular) {

            var rest = Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setRestangularFields({
                    id: 'location_id'
                });
            });

            return rest.service('common/location');
        }]);
})(angular.module('ngApptolia'));