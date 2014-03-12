'use strict';

module.exports = function (grunt) {

    grunt.util.linefeed = '\n';

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        twister_win_bundle: 'twister-0.9.19-win32-bundle',
        nsis_path: (process.arch === 'x64' ? '%ProgramFiles(x86)%' : '%ProgramFiles%') + '\\NSIS\\',

        // Task configuration.
        clean: {
            webkit: ['build'],
            nsis: ['build-win/source', 'build-win/*.exe']
        },
        copy: {
            app: {
                files: [
                    {
                        cwd: 'app/',
                        src: ['**'],
                        dest: 'build/source/',
                        expand: true
                    }
                ]
            },
            theme_default: {
                files: [
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/releases/twister/win/twister/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/releases/twister/mac/twister.app/Contents/Resources/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/releases/twister/linux32/twister/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/releases/twister/linux64/twister/html/default/',
                        expand: true
                    }
                ]
            },
            theme_calm: {
                files: [
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/releases/twister/win/twister/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/releases/twister/mac/twister.app/Contents/Resources/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/releases/twister/linux32/twister/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/releases/twister/linux64/twister/html/calm/',
                        expand: true
                    }
                ]
            },
            nsis: {
                files: [
                    {
                        cwd: 'build/releases/twister/win/twister/',
                        src: ['**'],
                        dest: 'build-win/source',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build-win/source/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build-win/source/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/<%= twister_win_bundle %>/twister-win32-bundle/',
                        src: ['twisterd.exe', '*.dll'],
                        dest: 'build-win/source/bin',
                        expand: true
                    }
                ]
            }
        },
        nodewebkit: {
            src: ['build/source/**/*'],
            options: {
                build_dir: 'build',
                version: '0.9.2',
                win: true,
                mac: true,
                linux32: true,
                linux64: true,
                credits: 'build-mac/credits.html',
                mac_icns: 'build-mac/nw.icns',
                keep_nw: true
            }
        },
        compress: {
            twister_win: {
                options: {
                    archive: 'build/twister_win.zip',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/releases/twister/win/twister',
                        src: ['**'],
                        expand: true
                    }
                ]
            },
            twister_mac: {
                options: {
                    archive: 'build/twister_mac.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/releases/twister/mac/',
                        src: ['**'],
                        expand: true
                    }
                ]
            },
            twister_linux32: {
                options: {
                    archive: 'build/twister_linux32.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/releases/twister/linux32/',
                        src: ['**'],
                        expand: true
                    }
                ]
            },
            twister_linux64: {
                options: {
                    archive: 'build/twister_linux64.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/releases/twister/linux64/',
                        src: ['**'],
                        expand: true
                    }
                ]
            }
        },
        wget: {
            twister_themes: {
                options: {
                    overwrite: true
                },
                files: {
                    'build/download/twister-theme-default.zip': 'https://codeload.github.com/miguelfreitas/twister-html/zip/master',
                    'build/download/twister-theme-calm.zip': 'https://codeload.github.com/iHedgehog/twister-calm/zip/master'
                }
            },
            twister_win: {
                src: 'http://twister.net.co/wp-content/uploads/<%= twister_win_bundle %>.zip',
                dest: 'build/download/<%= twister_win_bundle %>.zip'
            }
        },
        unzip: {
            twister_default: {
                src: 'build/download/twister-theme-default.zip',
                dest: 'build/themes'
            },
            twister_calm: {
                src: 'build/download/twister-theme-calm.zip',
                dest: 'build/themes'
            },
            twister_win: {
                src: 'build/download/<%= twister_win_bundle %>.zip',
                dest: 'build/<%= twister_win_bundle %>'
            }
        },
        exec: {
            nsis: {
                cwd: 'build-win',
                command: '"<%= nsis_path %>makensis" setup.nsi'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-wget');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('default', [
        'copy:app',
        'nodewebkit',
        'wget:twister_themes',
        'unzip:twister_default',
        'unzip:twister_calm',
        'copy:theme_default',
        'copy:theme_calm',
        'compress'
    ]);
    grunt.registerTask('nsis', [
        'wget:twister_win',
        'unzip:twister_win',
        'copy:nsis',
        'exec:nsis'
    ]);
    //grunt.registerTask('nsis', ['clean']); // just a note that clean task exists

};
