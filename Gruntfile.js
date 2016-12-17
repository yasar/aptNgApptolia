module.exports = function (grunt) {

    var _ = require('lodash');

    // Load required Grunt tasks. These are installed based on the versions listed
    // * in 'package.json' when you do 'npm install' in this directory.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-html2js');


    /** ********************************************************************************* */
    /** **************************** File Config **************************************** */
    var fileConfig = {
        build_dir  : 'build',
        compile_dir: 'bin',

        /**
         * This is a collection of file patterns for our app code (the
         * stuff in 'src/'). These paths are used in the configuration of
         * build tasks. 'js' is all project javascript, except tests.
         * 'commonTemplates' contains our reusable components' ('src/common')
         * template HTML files, while 'appTemplates' contains the templates for
         * our app's code. 'html' is just our main HTML file. 'less' is our main
         * stylesheet, and 'unit' contains our app's unit tests.
         */
        app_files: {
            js          : [
                './src/**/*.module.js',
                './src/**/*.js',
                '!src/**/*.spec.js',
                '!src/assets/**/*.js'],
            appTemplates: ['src/**/*.tpl.html'],
            less        : ['src/less/main.less']
        },

        vendor_files: {
            js    : [
                /**
                 * load at top section before most others
                 */
                'vendor/jquery/dist/jquery.js',
                'vendor/lodash/lodash.js',
                'vendor/moment/moment.js',
                'vendor/moment/locale/tr.js',
                'vendor/angular/angular.js',
                'vendor/angular-i18n/angular-locale_en-us.js',
                'vendor/angular-i18n/angular-locale_tr-tr.js',
                'vendor/angular-animate/angular-animate.js',
                'vendor/angular-sanitize/angular-sanitize.js',
                'vendor/angular-bootstrap/ui-bootstrap-tpls.js',

                ////////////////////////////////


                // 'vendor/angular-route/angular-route.js',
                // 'vendor/angular-route-segment/build/angular-route-segment.js',
                'vendor/angular-ui-router/release/angular-ui-router.js',


                'vendor/screenfull/dist/screenfull.js',
                'vendor/angular-screenfull/dist/angular-screenfull.js',
                'vendor/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',

                // this module has dependency on angular-translate and does not comply with angular-gettext
                // basically, the `translate` filter of gettext is overriden by this module.
                // so, in common folder, we have a modified version of this module.
                // it will be automatically included in the project, and we comment out the following line.
                //'vendor/angular-dialog-service/dist/dialogs.js',

                /**
                 * see the patched version in patched folder
                 * note: not using the patched one now.
                 */
                // 'vendor/angular-eonasdan-datetimepicker/dist/angular-eonasdan-datetimepicker.js',

                /**
                 * markdown
                 */
                'vendor/marked/lib/marked.js',
                'vendor/angular-marked/dist/angular-marked.js',


                ///

                'vendor/angular-hotkeys/build/hotkeys.js',
                'vendor/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js',

                'vendor/d3/d3.js',
                'vendor/nvd3/build/nv.d3.js',
                'vendor/angular-nvd3/dist/angular-nvd3.js',

                'vendor/iso-currency/dist/isoCurrency.js',
                'vendor/switchery/dist/switchery.js',
                'vendor/sotos.crop-image/dist/sotos.crop-image.js',

                'vendor/angular-ui-calendar/src/calendar.js',
                'vendor/fullcalendar/dist/fullcalendar.js',
                'vendor/fullcalendar/dist/gcal.js',

                'vendor/angular-summernote/dist/angular-summernote.js',
                'vendor/summernote/dist/summernote.min.js',
                'vendor/angular-loading-overlay/dist/angular-loading-overlay.js',
                'vendor/angular-loading-bar/build/loading-bar.js',
                'vendor/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
                'vendor/angular-ui-select/dist/select.js',
                'vendor/ng-mfb/src/mfb-directive.js',
                'vendor/angular-smart-table/dist/smart-table.js',
                'vendor/restangular/dist/restangular.js',
                'vendor/ngstorage/ngStorage.js',
                'vendor/angular-moment/angular-moment.js',
                'vendor/angular-gravatar/build/angular-gravatar.js',

                'vendor/nz-toggle/dist/nz-toggle.js',


                'vendor/file-saver/FileSaver.js',

                'vendor/pivottable/dist/pivot.js',
                'vendor/jqueryui/jquery-ui.js',

            ],
            css   : [],
            assets: []
        }
    };

    /** ********************************************************************************* */
    /** **************************** Task Config **************************************** */
    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),

        /**
         * The banner is the comment that is placed at the top of our compiled
         * source files. It is first processed as a Grunt template, where the '<%='
         * pairs are evaluated based on this very configuration object.
         */
        meta: {
            banner: '/**\n' +
                    ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' *\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' */\n'
        },

        /**
         * The directories to delete when 'grunt clean' is executed.
         */
        clean: {
            all   : [
                '<%= build_dir %>',
                '<%= compile_dir %>'
            ],
            vendor: [
                '<%= build_dir %>/vendor/'
            ],
        },

        /**
         * The 'copy' task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * 'build_dir', and then to copy the assets to 'compile_dir'.
         */
        copy: {
            build_appjs        : {
                files: [
                    {
                        src   : ['<%= app_files.js %>'],
                        dest  : '<%= build_dir %>/',
                        cwd   : '.',
                        expand: true
                    }
                ]
            },
            build_app_assets   : {
                files: [
                    {
                        src   : ['**'],
                        dest  : '<%= build_dir %>/assets/',
                        cwd   : 'src/assets',
                        expand: true
                    }
                ]
            },
            build_vendor_assets: {
                files: [
                    {
                        src    : ['<%= vendor_files.assets %>'],
                        dest   : '<%= build_dir %>/assets/',
                        cwd    : '.',
                        expand : true,
                        flatten: true
                    }
                ]
            },
            build_vendorjs     : {
                files: [
                    {
                        src   : ['<%= vendor_files.js %>'],
                        dest  : '<%= build_dir %>/',
                        cwd   : '.',
                        expand: true
                    }
                ]
            },
            compile_assets     : {
                files: [
                    {
                        src   : ['**'],
                        dest  : '<%= compile_dir %>/assets',
                        cwd   : '<%= build_dir %>/assets',
                        expand: true
                    }
                ]
            }
        },

        /**
         * 'grunt concat' concatenates multiple source files into a single file.
         */
        concat: {
            build_css : {
                src : [
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ],
                dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
            },
            // The 'compile_js' target concatenates app and vendor js code together.
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src    : [
                    '<%= vendor_files.js %>',
                    'module.prefix',
                    '<%= build_dir %>/src/**/*.module.js',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.app.dest %>',
                    'module.suffix'
                ],
                dest   : '<%= compile_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        /**
         * Minify the sources!
         */
        uglify: {
            compile: {
                options: {
                    mangle  : true,
                    beautify: false,
                    banner  : '<%= meta.banner %>'
                },
                files  : {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
                }
            }
        },

        /**
         * `grunt-contrib-less` handles our LESS compilation and uglification automatically.
         * Only our 'main.less' file is included in compilation; all other files
         * must be imported from this file.
         */
        less: {
            build  : {
                files: {
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.less %>'
                }
            },
            compile: {
                files  : {
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= app_files.less %>'
                },
                options: {
                    cleancss: true,
                    compress: true
                }
            }
        },


        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            app: {
                options: {
                    base: 'src',
                    /*rename: function (moduleName) {
                     return taskConfig.pkg.name + '/' + moduleName;
                     }*/
                },
                src    : ['<%= app_files.appTemplates %>'],
                dest   : '<%= build_dir %>/templates-<%= pkg.name %>.js',
                module : '<%= pkg.name %>Templates'
            }
        },

        index: {

            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the '<head>' of 'index.html'. The
             * 'src' property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.module.js',
                    '<%= build_dir %>/src/**/*.js',
                    // '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ]
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
                ]
            }
        }
    };


    /** ********************************************************************************* */
    /** **************************** Project Configuration ****************************** */
    grunt.initConfig(_.extend(taskConfig, fileConfig));

    grunt.registerTask('default', ['build', 'compile']);
    grunt.registerTask('forDebug', ['build', 'compileReadable']);
    grunt.registerTask('build', ['clean:all', 'html2js', 'less:build', 'concat:build_css',
        'copy:build_app_assets', 'copy:build_vendor_assets',
        'copy:build_appjs', 'copy:build_vendorjs', 'index:build']);
    grunt.registerTask('compile', ['less:compile', 'copy:compile_assets', 'concat:compile_js', 'uglify', 'index:compile']);
    grunt.registerTask('compileReadable', ['less:compile', 'copy:compile_assets', 'concat:compile_js', 'index:compile']);


    function filterForJS(files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }

    // A utility function to get all app CSS sources.
    function filterForCSS(files) {
        return files.filter(function (file) {
            return file.match(/\.css$/);
        });
    }

    grunt.registerMultiTask('index', 'Process index.html template', function () {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');

        // this.fileSrc comes from either build:src, compile:src, or karmaconfig:src in the index config defined above
        // see - http://gruntjs.com/api/inside-tasks#this.filessrc for documentation
        var jsFiles  = filterForJS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });
        var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });

        // this.data.dir comes from either build:dir, compile:dir, or karmaconfig:dir in the index config defined above
        // see - http://gruntjs.com/api/inside-tasks#this.data for documentation
        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function (contents, path) {
                // These are the variables looped over in our index.html exposed as "scripts", "styles", and "version"
                return grunt.template.process(contents, {
                    data: {
                        scripts    : jsFiles,
                        styles     : cssFiles,
                        version    : grunt.config('pkg.version'),
                        buildnumber: grunt.config('pkg.buildnumber'),
                        author     : grunt.config('pkg.author'),
                        date       : grunt.template.today("yyyy")
                    }
                });
            }
        });
    });
};
