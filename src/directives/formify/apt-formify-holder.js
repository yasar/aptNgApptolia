/**
 * Created by yasar on 03.12.2015.
 */



(function (app) {

    /**
     * ex:
     *
     * <div apt-formify-holder data-layout="ver" data-label-width="3,6">
     *  <div class="row">
     *      <div class="col-md-5">
     *          <apt-field field="first_name" model-base="vmPersonForm.form.data"></apt-field>
     *      </div>
     *      <div class="col-md-7">
     *          <apt-field field="last_name" model-base="vmPersonForm.form.data"></apt-field>
     *      </div>
     *  </div>
     * </div>
     */
    app.directive('aptFormifyHolder', ['$compile', '$timeout', function ($compile, $timeout) {
        var directiveObject = {
            scope     : false,
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