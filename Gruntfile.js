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
        wget: {
            twister_html: {
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
            twister_html: {
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
        copy: {
            html: {
                files: [
                    {
                        cwd: 'app/',
                        src: ['**'],
                        dest: 'build/source/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/source/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/source/html/calm/',
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
        zip: {
            twister_win: {
                src: 'build/releases/twister/win/**',
                dest: 'build/twister_win.zip'
            },
            twister_mac: {
                src: 'build/releases/twister/mac/**',
                dest: 'build/twister_mac.zip'
            },
            twister_linux32: {
                src: 'build/releases/twister/linux32/**',
                dest: 'build/twister_linux32.zip'
            },
            twister_linux64: {
                src: 'build/releases/twister/linux64/**',
                dest: 'build/twister_linux64.zip'
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
        'wget:twister_html',
        'unzip:twister_html',
        'unzip:twister_calm',
        'copy:html',
        'nodewebkit',
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
