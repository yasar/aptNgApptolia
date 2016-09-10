/**
 * Created by yasar on 03.12.2015.
 */



(function (app) {


    app.directive('aptFormifyHolder', ['$compile', '$timeout', function ($compile, $timeout) {
        var directiveObject = {
            scope: false,
            controller: [
                '$attrs',
                '$element', '$scope',
                function ($attrs, $element, $scope) {

                    if ($attrs.layout) {
                        this.layout = $attrs.layout;
                    }

                    if ($attrs.labelWidth) {
                        this.labelWidth = $attrs.labelWidth.split(',');
                    }

                    if ($attrs.layout && $attrs.layout == 'hor') {
                        var els = $element.find('[apt-formify]').detach();
                        $element.empty();
                        $element.removeAttr('aptFormifyHolder');
                        $element.closest('form').addClass('form-horizontal');
                        $timeout(function () {
                            $compile($element.append(els))($scope);
                        });
                    }

                }]
        };

        return directiveObject;
    }]);

})(angular.module('ngApptolia'));