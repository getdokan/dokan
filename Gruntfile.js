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
                    '<%= dirs.css %>/admin.css': ['<%= dirs.devLessSrc %>/admin.less' ]
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
                        '!<%= dirs.devJsSrc %>/admin.js'
                    ]
                }
            },

            backend_js: {
                files: {
                    '<%= dirs.js %>/dokan-admin.js': [
                        '<%= dirs.devJsSrc %>/admin.js'
                    ]
                }
            },

            flot: {
                files: {
                    '<%= dirs.js %>/flot-all.min.js': '<%= dirs.vendors %>/flot/*.js'
                }
            }
        },

        // Generate POT files.
        makepot: {
            target: {
                options: {
                    exclude: ['build/.*'],
                    domainPath: '/languages/', // Where to save the POT file.
                    potFilename: 'dokan-lite.pot', // Name of the POT file.
                    type: 'wp-plugin', // Type of project (wp-plugin or wp-theme).
                    potHeaders: {
                        'report-msgid-bugs-to': 'http://wedevs.com/support/forum/theme-support/dokan/',
                        'language-team': 'LANGUAGE <EMAIL@ADDRESS>'
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
                    '!bin/**',
                    '!.git/**',
                    '!Gruntfile.js',
                    '!package.json',
                    '!debug.log',
                    '!phpunit.xml',
                    '!.gitignore',
                    '!.gitmodules',
                    '!npm-debug.log',
                    '!secret.json',
                    '!plugin-deploy.sh',
                    '!assets/src/**',
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
    grunt.loadNpmTasks( 'grunt-wp-i18n' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-compress' );
    grunt.loadNpmTasks( 'grunt-ssh' );

    grunt.registerTask( 'default', [
        'less',
        'concat'
    ]);

    grunt.registerTask('release', [
        'makepot',
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