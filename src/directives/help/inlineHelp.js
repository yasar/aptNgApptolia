/**
 * Created by yasar on 04.08.2016.
 */


(function (app) {

    app.directive('aptInlineHelp', Directive);

    Directive.$inject = ['gettextCatalog'];
    function Directive(gettextCatalog) {
        var directiveObject = {
            replace    : false,
            transclude : true,
            scope      : true,
            restrict   : 'EA',
            templateUrl: 'directives/help/inlineHelp.tpl.html',
            link       : linkFn
        };

        return directiveObject;

        function linkFn(scope, element, attrs, ctrl, transclude) {
            scope.content = '';
            transclude(scope, function (clone) {
                var content   = clone.html();
                scope.content = _.has(attrs, 'translate') ? gettextCatalog.getString(content) : content;
            });
        }
    }


})(angular.module('ngApptolia'));