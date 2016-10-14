/**
 * Created by yasar on 21.12.2015.
 */


(function (app) {

    app.directive('aptDatatable', fn);

    var path = 'directives/datatable';

    fn.$inject = ['$templateRequest', '$compile', '$parse', '$interpolate', 'gettextCatalog', '$rootScope', '$injector'];
    function fn($templateRequest, $compile, $parse, $interpolate, gettextCatalog, $rootScope, $injector) {
        return {
            restrict: 'EA',
            compile : compileFn,
        };
        function compileFn(element, attrs) {
            var $q                      = $injector.get('$q');
            var clone                   = element.clone();
            var placeholder             = angular.element('<!-- placeholder -->');
            var datasource              = null;
            // var datasourcePipe          = null;
            var datasourceFilter        = null;
            var modelBase               = null;
            var aptAuthorizationService = null;
            var itemData                = 'row';
            var rowSpan                 = 1;
            var options                 = {
                /**
                 * authorize is used for menu actions.
                 * if set to false then authorization is by-passed.
                 * otherwise, we can provide a string for the module-domain
                 * or an object containing required privileges for individual parts.
                 *
                 * ex:
                 *
                 * No authorization
                 *      <apt-datatable table-options={authorize:false, ..} ..
                 *
                 * Authorize with module-domain
                 *      <apt-datatable table-options={authorize:'mast', ..} ..
                 *
                 * Authorize with required privileges
                 *      <apt-datatable table-options={authorize: {
                 *          create: 'create_mast_module',
                 *          read: 'read_mast_module',
                 *          // for now only create and read is used
                 *          // edit and delete should be set in rowMenu outside.
                 *          edit: 'update_mast_module',
                 *          delete:'delete_mast_module'}, ..} ..
                 */
                authorize           : false,
                addRowIndex         : true,
                addRowMenu          : true,
                enableSorting       : true,
                showAddNewButton    : true,
                showFullscreenButton: true,
                showHeader          : true,
                showPageSizeSelector: true,
                showPaginator       : true,
                showReloadButton    : true,
                showSearchBox       : true,
                showTitle           : true,
                showTotals          : true,
                /**
                 * title is auto-generated in aptCreateListDirective
                 * however, we can manually set it at where we call the list-directive
                 * by providing the table-options attribute.
                 */
                title               : null
            };

            // var promise = $templateRequest(path + '/datatable.tpl.html');

            // var headerTpl = '';
            // var promise   = $templateRequest(path + '/header-navbar.tpl.html');
            // promise.then(function (data) {
            //     headerTpl = data;
            //     promise   = $templateRequest(path + '/datatable.tpl.html');
            // });

            var deferred = $q.defer();
            var promise  = deferred.promise;
            $templateRequest(path + '/header-navbar.tpl.html').then(function (header) {
                $templateRequest(path + '/datatable.tpl.html').then(function (template) {
                    template = template.replace(/\<tr header\>\<\/tr\>/g, '<tr><th colspan="100%" class="no-border p-5">' + header + '</th></tr>');
                    deferred.resolve(template);
                });
            });

            element.replaceWith(placeholder);
            return link;

            function link(scope, element, attrs) {
                if (attrs.datasource) {
                    datasource = attrs.datasource;
                }

                if (attrs.datasourceFilter) {
                    datasourceFilter = $parse(attrs.datasourceFilter)(scope)
                }

                if (attrs.modelBase) {
                    modelBase = attrs.modelBase;
                }

                if (attrs.options) {
                    var _options = $parse(attrs.options)(scope);

                    /**
                     * check if aptCreateListDirective has the options defined in its vm
                     */
                    if (_.isUndefined(_options) && scope.$parent) {
                        _options = $parse(attrs.options)(scope.$parent);
                    }

                    options = _.defaults(_options, options);
                }

                if (attrs.authorize) {
                    options.authorize = attrs.authorize;
                }

                if (options.authorize !== false) {
                    aptAuthorizationService = $injector.get('aptAuthorizationService');

                    /**
                     * if options.authorize is a string
                     * then we assume it is the module domain.
                     */
                    if (_.isString(options.authorize)) {
                        var domain  = options.authorize;
                        var builder = _.has(window, domain + 'Builder') ? _.get(window, domain + 'Builder') : null;
                        if (builder) {
                            options.authorize = {
                                create: [builder.permission('create', 'module')],
                                read  : [builder.permission('read', 'module')],
                                edit  : [builder.permission('update', 'module')],
                                delete: [builder.permission('delete', 'module')],
                                // create: ['create_' + domain + '_module'],
                                // read  : ['read_' + domain + '_module'],
                                // edit  : ['update_' + domain + '_module'],
                                // delete: ['delete_' + domain + '_module'],
                            };
                        }
                    }

                    if (!aptAuthorizationService.isAuthorized(options.authorize.read)) {
                        // var unauthorizedMessage = '<apt-inline-help translate>You are not authorized to view the content of this table. Please consult your system administrator.</apt-inline-help>';
                        /**
                         * the `builder` above is not same as aptBuilder
                         * builder is the specific one for the module.
                         * aptBuilder is generic.
                         */
                        var unauthorizedMessage = aptBuilder.directiveObject.notAuthorized;
                        element.replaceWith($compile($(unauthorizedMessage))(scope));
                        return;
                    }
                }

                promise.then(function (templateString) {

                    element.removeAttr('apt-datatable');
                    element.find('apt-datatable').remove();
                    delete attrs.aptDatatable;

                    var parsers   = {
                        header: function ($el, $template) {
                            $el.find('th').addClass('no-border-top');
                            $template.find('thead > [inject]').replaceWith($el.html());
                            $template.find('thead > tr:last').addClass('border-double');
                        },
                        body  : function ($el, $template) {
                            var $tr = $el.find('tr');
                            rowSpan = $tr.length;

                            // var ngRepeatStr = itemData + ' in ' + $template.attr('st-table') + ' track by $index';
                            var ngRepeatStr = itemData + ' in ' + $template.attr('st-table') + (datasourceFilter ? ' | filter:' + datasourceFilter : '') + ' track by $index';

                            if ($tr.length == 1) {
                                $tr.attr('ng-repeat', ngRepeatStr);
                            } else {
                                $tr.first().attr('ng-repeat-start', ngRepeatStr);
                                $tr.last().attr('ng-repeat-end', '');
                            }
                            $template.find('tbody').empty().append($tr);
                        },
                        footer: function ($el, $template) {
                            $template.find('tfoot').empty().append($el.html());
                        }
                    };
                    var $template = angular.element(templateString);

                    /**
                     * if the <apt-datatable> element has any class,
                     * then we should transfer it into new template
                     */
                    if (clone.attr('class')) {
                        $template.addClass(clone.attr('class'));
                    }

                    // $template.addClass('table table-compressed table-striped table-bordered no-border apt-datatable');
                    // $template.addClass('table table-compressed table-bordered no-border apt-datatable');
                    $template.addClass('table table-compressed apt-datatable');
                    $template.attr('st-table', vm(datasource) + '_Virtual');
                    $template.attr('st-safe-src', vm(datasource));
                    //$template.attr('st-pipe', 'vmDatatable.getFilteredRowCount');

                    angular.forEach(clone.children(), function (el) {
                        var $el = angular.element(el);

                        var tagName = $el.prop('tagName');
                        if (tagName) {
                            switch (tagName.toLowerCase()) {
                                case 'thead':
                                    parsers.header($el, $template);
                                    break;
                                case 'tbody':
                                    parsers.body($el, $template);
                                    break;
                                case 'tfoot':
                                    parsers.footer($el, $template);
                                    break;
                            }
                        }
                    });

                    if (!options.showHeader) {
                        $template.find('thead>tr:first-child').remove();
                    } else {
                        showSearchBox();
                        showPageSizeSelector();
                        showReloadButton();
                        showAddNewButton();
                        showTotals();
                    }
                    showPaginator();
                    addRowIndex();
                    addRowMenu();
                    addFullScreen();
                    processSorting();
                    showTitle();

                    return $template;

                    function addFullScreen() {
                        var btn = $template.find('[apt-fullscreen-button]');

                        if (!options.showFullscreenButton) {
                            btn.remove();
                            return;
                        }

                        if (btn.length) {
                            btn.removeAttr('apt-fullscreen-button').attr('ngsf-toggle-fullscreen', '');
                            $template.attr('ngsf-fullscreen', '');
                        }
                    }

                    function showSearchBox() {
                        var searchBoxHolder = $template.find('[apt-search-box-holder]');
                        var searchBox       = $template.find('input[apt-search-box]');

                        if (!options.showSearchBox) {
                            searchBoxHolder.remove();
                            searchBox.remove();
                            return;
                        }

                        if (searchBox.length) {
                            searchBoxHolder.removeAttr('apt-search-box-holder');
                            searchBox.removeAttr('apt-search-box')
                                .attr('st-search', '')
                                .attr('placeholder', gettextCatalog.getString('search in the list'));
                        }
                    }

                    function showTitle() {
                        var titleEl = $template.find('[apt-title]');

                        if (!options.showTitle) {
                            titleEl.remove();
                            return;
                        }

                        if (titleEl.length) {
                            titleEl.removeAttr('apt-title').html(options.title);
                        }
                    }

                    function showPageSizeSelector() {
                        var pageSize = $template.find('[apt-page-size]');

                        if (!options.showPageSizeSelector) {
                            pageSize.remove();
                            return;
                        }

                        if (pageSize.length) {
                            pageSize.removeAttr('apt-page-size').attr('ng-model', vm('pageSize'));
                            $interpolate(vm('pageSize') + '=defaults.pageSize')($rootScope);
                        }
                    }

                    function showReloadButton() {
                        var reloadBtn = $template.find('[apt-reload-button]');

                        if (!options.showReloadButton) {
                            reloadBtn.remove();
                            return;
                        }

                        if (reloadBtn.length) {
                            reloadBtn.removeAttr('apt-reload-button').attr('ng-click', vm('reload') + '()');
                        }
                    }

                    function showAddNewButton() {

                        var addNewBtn = $template.find('[apt-addnew-button]');

                        if (!options.showAddNewButton || (options.authorize && !aptAuthorizationService.isAuthorized(options.authorize.create))) {
                            addNewBtn.remove();
                            return;
                        }

                        if (addNewBtn.length) {
                            addNewBtn.removeAttr('apt-addnew-button').attr('ng-click', vm('addNew') + '()');
                        }
                    }

                    function showTotals() {
                        var rowCount = $template.find('[apt-row-count]');

                        if (!options.showTotals) {
                            rowCount.remove();
                            return;
                        }

                        if (rowCount.length) {
                            rowCount.removeAttr('apt-row-count').attr('ng-bind', vm(datasource) + '.length');
                        }
                    }

                    function showPaginator() {
                        var hasCustomFooter = false;
                        var footer          = $template.find('tfoot');

                        if (footer.children().length > 0) {
                            hasCustomFooter = true;
                        }

                        if (!options.showPaginator && !hasCustomFooter) {
                            footer.remove();
                            return;
                        }

                        var tplPagination = $('<tr><td colspan="100%" class="text-center" ' +
                                              'st-items-by-page="' + vm('pageSize') + '" ' +
                                              'st-pagination ' +
                                              'st-template="directives/smartTable/pagination.tpl.html"></td></tr>');

                        footer.append(tplPagination);

                        var targetEl = null;
                        if (hasCustomFooter) {
                            targetEl = tplPagination;
                        } else {
                            targetEl = footer;
                        }
                        targetEl.attr('ng-show', vm(datasource) + '.length>' + vm('pageSize'));
                    }

                    function addRowIndex() {
                        return false;
                        if (!options.addRowIndex) {
                            return;
                        }
                        var th = addColumnTo('thead', 'left');
                        th.html('<span uib-tooltip="{{\'Row Number\'|translate}}">#</span>');
                        th.css('width', '80px');
                        th.css('text-align', 'right');

                        var td = addColumnTo('tbody', 'left');
                        td.html('{{$index+1}}');
                        td.css('text-align', 'right');
                    }

                    function addRowMenu() {
                        if (!options.addRowMenu) {
                            return;
                        }
                        var header = addColumnTo('thead');
                        header.addClass('text-right td-menu no-border-top');
                        header.css('width', '20px');

                        _.set(scope, vm('rowMenuConfig'), _.defaults(_.get(scope, vm('rowMenuConfig')), {
                            translate       : true,
                            ulIsSubMenuClass: ''
                        }));

                        var menu = addColumnTo('tbody');
                        menu.html('<div apt-menu-builder ' +
                                  'menu-type="table-row-menu" ' +
                                  'ng-model="' + vm('rowMenu') + '" ' +
                                  'item-data="' + itemData + '" ' +
                                  'watch-item-data="true"' +
                                  'data-config="' + vm('rowMenuConfig') + '" ' +
                                  'btn-size="xs"></div>');
                        // menu.addClass('text-right td-menu bg-grey-300');
                        menu.addClass('text-right td-menu');
                    }

                    function processSorting() {

                        process('apt-sort');
                        process('apt-sort-date');

                        function process(type) {
                            /**
                             * find all elements having apt-sort
                             */
                            var sortableEls = $template.find('[' + type + ']');

                            /**
                             * if sorting is not enabled then,
                             * remove elements having apt-sort attribute
                             */
                            if (!options.enableSorting) {
                                sortableEls.remove();
                                return;
                            }

                            /**
                             * convert apt-sort into st-sort
                             */
                            angular.forEach(sortableEls, function (el) {
                                var sortBy = $(el).attr(type);
                                switch (type) {
                                    case 'apt-sort':
                                        $(el).attr('st-sort', sortBy);
                                        break;
                                    case 'apt-sort-date':
                                        $(el).attr('st-sort', 'getters.' + sortBy);
                                        _.set(scope, 'getters.' + sortBy, function (row) {
                                            if (!_.isDate(row[sortBy]) && (_.isNull(row[sortBy]) || _.isUndefined(row[sortBy]) || _.isEmpty(row[sortBy]))) {
                                                return row[sortBy];
                                            }
                                            return row[sortBy].getTime();
                                        });
                                        break;
                                }
                                $(el).removeAttr(type);
                            });
                        }
                    }

                    function addColumnTo(where, side) {
                        var col, find;
                        side = side || 'right';

                        switch (where) {
                            case 'thead':
                                col  = $('<th></th>');
                                find = 'tr:last-child:not(:first-child)';
                                break;
                            default:
                                col  = $('<td rowspan="' + rowSpan + '"></td>');
                                find = 'tr:first-child'
                        }

                        if (side == 'right') {
                            $template.find(where).find(find).append(col);
                        } else {
                            $template.find(where).find(find).prepend(col);
                        }
                        return col;
                    }
                })

                //----------------------

                    .then(function (template) {
                        if (attrs.responsive == 'true') {
                            template = $('<div class="table-responsive"></div>').append(template);
                        }
                        var replacement = $compile(template)(scope);
                        element.replaceWith(replacement);
                    });

                scope.$on('$destroy', function () {
                    // Put everything back to normal
                    element.replaceWith(clone);
                });

            }

            function vm(prop) {
                return modelBase ? modelBase + '.' + prop : prop;
            }

        }

    }

})(angular.module('ngApptolia'));