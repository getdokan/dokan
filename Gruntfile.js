'use strict';
module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        // setting folder templates
        dirs: {
            css: 'assets/css',
            js: 'assets/js',
            images: 'assets/images',
            vendors: 'assets/vendors',
            devLessSrc: 'assets/src/less',
            devJsSrc: 'assets/src/js'
        },

        // Compile all .less files.
        less: {

            // one to one
            core: {
                options: {
                    sourceMap: false,
                    sourceMapFilename: '<%= dirs.css %>/style.css.map',
                    sourceMapURL: 'style.css.map',
                    sourceMapRootpath: '../../'
                },
                files: {
                    '<%= dirs.css %>/style.css': '<%= dirs.devLessSrc %>/style.less',
                    '<%= dirs.css %>/rtl.css': '<%= dirs.devLessSrc %>/rtl.less'
                }
            },

            admin: {
                files: {
                    '<%= dirs.css %>/admin.css': ['<%= dirs.devLessSrc %>/admin.less' ],
                    '<%= dirs.css %>/setup.css': ['<%= dirs.devLessSrc %>/setup.less' ],
                    '<%= dirs.css %>/setup-no-wc.css': ['<%= dirs.devLessSrc %>/setup-no-wc.less' ]
                }
            }
        },

        uglify: {
            minify: {
                expand: true,
                cwd: '<%= dirs.js %>',
                src: [ 'all.js' ],
                dest: '<%= dirs.js %>/',
                ext: '.min.js'
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= dirs.js %>/*.js',
                '!<%= dirs.js %>/*.min.js'
            ]
        },

        concat: {
            all_js: {
                files: {
                    '<%= dirs.js %>/dokan.js': [
                        '<%= dirs.devJsSrc %>/*.js',
                        '!<%= dirs.devJsSrc %>/admin.js',
                        '!<%= dirs.devJsSrc %>/login-form-popup.js',
                        '!<%= dirs.devJsSrc %>/dokan-maps-compat.js',
                        '!<%= dirs.devJsSrc %>/setup-no-wc.js'
                    ],
                    '<%= dirs.js %>/login-form-popup.js': [
                        '<%= dirs.devJsSrc %>/login-form-popup.js'
                    ],
                    '<%= dirs.js %>/dokan-maps-compat.js': [
                        '<%= dirs.devJsSrc %>/dokan-maps-compat.js'
                    ],
                }
            },

            backend_js: {
                files: {
                    '<%= dirs.js %>/dokan-admin.js': [
                        '<%= dirs.devJsSrc %>/admin.js'
                    ],
                    '<%= dirs.js %>/dokan-setup-no-wc.js': [
                        '<%= dirs.devJsSrc %>/setup-no-wc.js'
                    ]
                }
            },

            flot: {
                files: {
                    '<%= dirs.js %>/flot-all.min.js': '<%= dirs.vendors %>/flot/*.js'
                }
            }
        },

        addtextdomain: {
            options: {
                textdomain: 'dokan-lite',
            },
            update_all_domains: {
                options: {
                    updateDomains: true
                },
                src: [ '*.php', '**/*.php', '!node_modules/**', '!src/**', '!php-tests/**', '!bin/**', '!build/**', '!assets/**' ]
            }
        },

        // Generate POT files.
        makepot: {
            target: {
                options: {
                    exclude: ['build/.*', 'node_modules/*', 'assets/*', 'tests/*', 'bin/*'],
                    mainFile: 'dokan.php',
                    domainPath: '/languages/',
                    potFilename: 'dokan-lite.pot',
                    type: 'wp-plugin',
                    updateTimestamp: true,
                    potHeaders: {
                        'report-msgid-bugs-to': 'https://wedevs.com/contact/',
                        'language-team': 'LANGUAGE <EMAIL@ADDRESS>',
                        poedit: true,
                        'x-poedit-keywordslist': true
                    }
                }
            }
        },

        watch: {
            less: {
                files: '<%= dirs.devLessSrc %>/*.less',
                tasks: ['less:core', 'less:admin']
            },

            js: {
                files: '<%= dirs.devJsSrc %>/*.js',
                tasks: [ 'concat:all_js', 'concat:backend_js' ]
            }
        },

        wp_readme_to_markdown: {
            your_target: {
                files: {
                    'README.md': 'readme.txt'
                }
            },
        },

        // Clean up build directory
        clean: {
            main: ['build/']
        },

        // Copy the plugin into the build directory
        copy: {
            main: {
                src: [
                    '**',
                    '!node_modules/**',
                    '!build/**',
                    '!vendor/**',
                    '!bin/**',
                    '!.git/**',
                    '!Gruntfile.js',
                    '!CONTRIBUTING.md',
                    '!package.json',
                    '!package-lock.json',
                    '!composer.json',
                    '!composer.lock',
                    '!config.json',
                    '!phpcs.xml.dist',
                    '!webpack.config.js',
                    '!debug.log',
                    '!phpunit.xml',
                    '!.gitignore',
                    '!.gitmodules',
                    '!npm-debug.log',
                    '!secret.json',
                    '!plugin-deploy.sh',
                    '!assets/src/**',
                    '!src/**',
                    '!assets/css/style.css.map',
                    '!tests/**',
                    '!**/Gruntfile.js',
                    '!**/package.json',
                    '!**/README.md',
                    '!**/*~'
                ],
                dest: 'build/'
            }
        },

        //Compress build directory into <name>.zip and <name>-<version>.zip
        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: './build/dokan-lite-v' + pkg.version + '.zip'
                },
                expand: true,
                cwd: 'build/',
                src: ['**/*'],
                dest: 'dokan-lite'
            }
        },

        //secret: grunt.file.readJSON('secret.json'),
        sshconfig: {
            "myhost": {
                host: '<%= secret.host %>',
                username: '<%= secret.username %>',
                agent: process.env.SSH_AUTH_SOCK,
                agentForward: true
            }
        },
        sftp: {
            upload: {
                files: {
                    "./": 'build/dokan-plugin-v' + pkg.version + '.zip'
                },
                options: {
                    path: '<%= secret.path %>',
                    config: 'myhost',
                    showProgress: true,
                    srcBasePath: "build/"
                }
            }
        },
        sshexec: {
            updateVersion: {
                command: '<%= secret.updateFiles %> ' + pkg.version + ' --allow-root',
                options: {
                    config: 'myhost'
                }
            },

            uptime: {
                command: 'uptime',
                options: {
                    config: 'myhost'
                }
            },
        }
    });

    // Load NPM tasks to be used here
    grunt.loadNpmTasks( 'grunt-contrib-less' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-wpvue-i18n' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-compress' );
    grunt.loadNpmTasks( 'grunt-ssh' );
    grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );

    grunt.registerTask( 'default', [
        'less',
        'concat'
    ]);

    // file auto generation
    // grunt.registerTask('i18n', ['addtextdomain', 'makepot']);
    grunt.registerTask('i18n', [ 'makepot'] );
    grunt.registerTask('readme', ['wp_readme_to_markdown']);

    grunt.registerTask('release', [
        'i18n',
        'readme',
        'less',
        'concat'
    ]);

    grunt.registerTask( 'zip', [
        'clean',
        'copy',
        'compress'
    ])

    grunt.registerTask( 'deploy', [
        'sftp:upload', 'sshexec:updateVersion'
    ]);
};
