'use strict';

module.exports = function (grunt) {

    grunt.util.linefeed = '\n';

    // Platforms
    var inputPlatforms = (grunt.cli.tasks.length === 1 && ['win','nsis','osx','mac','linux32','linux64'].indexOf(grunt.cli.tasks[0]) !== -1)
            ? grunt.cli.tasks[0] : 'all',
        buildPlatforms = {
            mac: /mac|osx|all/.test(inputPlatforms),
            win: /win|nsis|all/.test(inputPlatforms),
            linux32: /linux32|all/.test(inputPlatforms),
            linux64: /linux64|all/.test(inputPlatforms)
        };

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        app: grunt.file.readJSON('app/package.json'),
        twister_win_ia32_url: 'http://twisterd.net/webkit/twister-0.9.26-win32.zip',
        twister_mac_x64_url: 'http://twisterd.net/osx_bin.zip',
        twister_bootstrap_db48_url: 'http://twisterd.net/webkit/bootstrap48.zip',
        nsis_path: process.platform === 'win32' ? (process.arch === 'x64' ? '%ProgramFiles(x86)%' : '%ProgramFiles%') + '\\NSIS\\' : '',

        // Task configuration.
        clean: {
            webkit: ['build'],
            nsis: ['build-win/source/**/*', 'build-win/*.exe']
        },
        copy: {
            nodewebkit_locales: {
                files: [
                    {
                        cwd: 'build/cache/<%= nodewebkit.options.version %>/win',
                        src: ['locales/**'],
                        dest: 'build/twister/win/',
                        expand: true
                    },
                    {
                        cwd: 'build/cache/<%= nodewebkit.options.version %>/linux32',
                        src: ['locales/**'],
                        dest: 'build/twister/linux32/',
                        expand: true
                    },
                    {
                        cwd: 'build/cache/<%= nodewebkit.options.version %>/linux64',
                        src: ['locales/**'],
                        dest: 'build/twister/linux64/',
                        expand: true
                    }
                ]
            },
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
                        dest: 'build/twister/win/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/twister/osx/twister.app/Contents/Resources/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/twister/linux32/html/default/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-html-master',
                        src: ['**'],
                        dest: 'build/twister/linux64/html/default/',
                        expand: true
                    }
                ]
            },
            theme_calm: {
                files: [
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/twister/win/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/twister/osx/twister.app/Contents/Resources/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/twister/linux32/html/calm/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-calm-master',
                        src: ['**'],
                        dest: 'build/twister/linux64/html/calm/',
                        expand: true
                    }
                ]
            },
            theme_nin: {
                files: [
                    {
                        cwd: 'build/themes/twister-nin-master',
                        src: ['**'],
                        dest: 'build/twister/win/html/nin/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-nin-master',
                        src: ['**'],
                        dest: 'build/twister/osx/twister.app/Contents/Resources/html/nin/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-nin-master',
                        src: ['**'],
                        dest: 'build/twister/linux32/html/nin/',
                        expand: true
                    },
                    {
                        cwd: 'build/themes/twister-nin-master',
                        src: ['**'],
                        dest: 'build/twister/linux64/html/nin/',
                        expand: true
                    }
                ]
            },
            empty: {
                files: {
                    'build/twister/win/html/': 'empty.html',
                    'build/twister/osx/twister.app/Contents/Resources/html/': 'empty.html',
                    'build/twister/linux32/html/': 'empty.html',
                    'build/twister/linux64/html/': 'empty.html'
                }
            },
            bootstrap: {
                files: [
                    {
                        cwd: 'build/bootstrap/db48',
                        src: ['**'],
                        dest: 'build/twister/win/bootstrap/',
                        expand: true
                    }/*,
                    {
                        cwd: 'build/bootstrap',
                        src: ['**'],
                        dest: 'build/twister/osx/twister.app/Contents/Resources/bootstrap/',
                        expand: true
                    },
                    {
                        cwd: 'build/bootstrap',
                        src: ['**'],
                        dest: 'build/twister/linux32/bootstrap/',
                        expand: true
                    },
                    {
                        cwd: 'build/bootstrap',
                        src: ['**'],
                        dest: 'build/twister/linux64/bootstrap/',
                        expand: true
                    }*/
                ]
            },
            twister_win_ia32: {
                files: [
                    {
                        cwd: 'build/twister-win32-bundle',
                        src: ['**'],
                        dest: 'build/twister/win/bin/',
                        expand: true
                    }
                ]
            },
            twister_osx_x64: {
                files: [
                    {
                        cwd: 'build/download/twister-osx-bundle/bin',
                        src: ['**'],
                        dest: 'build/twister/osx/twister.app/Contents/Resources/bin/',
                        mode: 511, // =0777
                        expand: true
                    }
                ]
            },        
            nsis: {
                files: [
                    {
                        cwd: 'build/twister/win/',
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
                        cwd: 'build/themes/twister-nin-master',
                        src: ['**'],
                        dest: 'build-win/source/html/nin/',
                        expand: true
                    },
                    {
                        cwd: 'build/twister-win32-bundle/',
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
                buildDir: 'build',
                cacheDir: 'build/cache',
                version: '0.10.5',
                win: buildPlatforms.win,
                mac: buildPlatforms.mac,
                linux32: buildPlatforms.linux32,
                linux64: buildPlatforms.linux64,
                macCredits: 'build-mac/credits.html',
                macIcns: 'build-mac/nw.icns',
//                winIco: 'build-win/twister.ico'
            }
        },
        compress: {
            twister_win_ia32: {
                options: {
                    archive: 'build/twister_win_ia32.zip',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/twister/win',
                        src: ['**'],
                        expand: true
                    }
                ]
            },
            twister_osx_x64: {
                options: {
                    archive: 'build/twister_osx_x64.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/twister/osx/',
                        src: ['**'],
                        mode: 484, // = 0744
                        expand: true
                    }/*,
                    {
                        cwd: 'build-mac/',
                        src: ['build-twister.sh'],
                        mode: 484, // = 0744
                        expand: true
                    }*/
                ]
            },
            twister_linux_ia32: {
                options: {
                    archive: 'build/twister_linux_ia32.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/twister/linux32/',
                        src: ['html/**', 'nw.pak', 'icudtl.dat', 'libffmpegsumo.so', 'locales/**'],
                        expand: true
                    },
                    {
                        cwd: 'build/twister/linux32/',
                        src: ['twister'],
                        mode: 484, // = 0744
                        expand: true
                    },
                    {
                        cwd: 'build-linux/',
                        src: ['twister.sh', 'build-twister.sh'],
//                        dest: 'twister/',
                        mode: 484, // = 0744
                        expand: true
                    },
                    {
                        cwd: 'build-linux/',
                        src: ['*.png'],
//                        dest: 'twister/',
                        expand: true
                    }
                ]
            },
            twister_linux_x64: {
                options: {
                    archive: 'build/twister_linux_x64.tar.gz',
                    pretty: true
                },
                files: [
                    {
                        cwd: 'build/twister/linux64/',
                        src: ['html/**', 'nw.pak', 'icudtl.dat', 'libffmpegsumo.so', 'locales/**'],
                        expand: true
                    },
                    {
                        cwd: 'build/twister/linux64/',
                        src: ['twister'],
                        mode: 484, // = 0744
                        expand: true
                    },
                    {
                        cwd: 'build-linux/',
                        src: ['twister.sh', 'build-twister.sh'],
//                        dest: 'twister/',
                        mode: 484, // = 0744
                        expand: true
                    },
                    {
                        cwd: 'build-linux/',
                        src: ['*.png'],
//                        dest: 'twister/',
                        expand: true
                    }
                ]
            }
        },
        curl: {
            twister_theme_default: {
                files: {
                    'build/download/twister-theme-default.zip': 'https://codeload.github.com/miguelfreitas/twister-html/zip/master'
                }
            },
            twister_theme_calm: {
                files: {
                    'build/download/twister-theme-calm.zip': 'https://codeload.github.com/iHedgehog/twister-calm/zip/master'
                }
            },
            twister_theme_nin: {
                files: {
                    'build/download/twister-theme-nin.zip': 'https://codeload.github.com/myleneb/twister-nin/zip/master'
                }
            },
            bootstrap_db48: {
                src: '<%= twister_bootstrap_db48_url %>',
                dest: 'build/download/bootstrap48.zip'
            },
            twister_win_ia32: {
                src: '<%= twister_win_ia32_url %>',
                dest: 'build/download/twister-win32-bundle.zip'
            },
            twister_osx_x64: {
                src: '<%= twister_mac_x64_url %>',
                dest: 'build/download/twister-osx-bundle.zip'
            },
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
            twister_nin: {
                src: 'build/download/twister-theme-nin.zip',
                dest: 'build/themes'
            },
            bootstrap_db48: {
                src: 'build/download/bootstrap48.zip',
                dest: 'build/bootstrap/db48'
            },
            twister_win_ia32: {
                src: 'build/download/twister-win32-bundle.zip',
                dest: 'build/twister-win32-bundle'
            },
            twister_osx_x64: {
                src: 'build/download/twister-osx-bundle.zip',
                dest: 'build/download/twister-osx-bundle'
            }
        },
        exec: {
            nsis: {
                cwd: 'build-win',
                command: '"<%= nsis_path %>makensis" /DVersion="<%= app.version %>" setup.nsi'
            }
        }
    });

    grunt.log.ok('Twister-Webkit ver. ' + grunt.config('app.version'));

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('default', [
        // make node-webkit app
        'copy:app',
        'nodewebkit',
        'copy:nodewebkit_locales',
        // add themes
        'curl:twister_theme_default',
        'curl:twister_theme_calm',
        'curl:twister_theme_nin',
        'unzip:twister_default',
        'unzip:twister_calm',
        'unzip:twister_nin',
        'copy:theme_default',
        'copy:theme_calm',
        'copy:theme_nin',
        'copy:empty',
        // add blockchain bootstrap
        'curl:bootstrap_db48',
        'unzip:bootstrap_db48',
        'copy:bootstrap',
        // add binaries
        'curl:twister_win_ia32',
        'curl:twister_osx_x64',
        'unzip:twister_win_ia32',
        'unzip:twister_osx_x64',
        'copy:twister_win_ia32',
        'copy:twister_osx_x64',
        // final compressing
        'compress'
    ]);
    // Win32
    grunt.registerTask('win', [
        // make node-webkit app
        'copy:app',
        'nodewebkit',
        'copy:nodewebkit_locales',
        // add themes
        'curl:twister_theme_default',
        'curl:twister_theme_calm',
        'curl:twister_theme_nin',
        'unzip:twister_default',
        'unzip:twister_calm',
        'unzip:twister_nin',
        'copy:theme_default',
        'copy:theme_calm',
        'copy:theme_nin',
        'copy:empty',
        // add blockchain bootstrap
        'curl:bootstrap_db48',
        'unzip:bootstrap_db48',
        'copy:bootstrap',
        // add binaries
        'curl:twister_win_ia32',
        'unzip:twister_win_ia32',
        'copy:twister_win_ia32',
        // final compressing
        'compress:twister_win_ia32'
    ]);
    // Mac OSX
    grunt.registerTask('osx', [
        // make node-webkit app
        'copy:app',
        'nodewebkit',
        // add themes
        'curl:twister_theme_default',
        'curl:twister_theme_calm',
        'curl:twister_theme_nin',
        'unzip:twister_default',
        'unzip:twister_calm',
        'unzip:twister_nin',
        'copy:theme_default',
        'copy:theme_calm',
        'copy:theme_nin',
        'copy:empty',
        // add blockchain bootstrap
//        'curl:bootstrap_db48',
//        'unzip:bootstrap_db48',
        'copy:bootstrap',
        // add binaries
        'curl:twister_osx_x64',
        'unzip:twister_osx_x64',
        'copy:twister_osx_x64',
        // final compressing
        'compress:twister_osx_x64'
    ]);
    // Linux32
    grunt.registerTask('linux32', [
        // make node-webkit app
        'copy:app',
        'nodewebkit',
        'copy:nodewebkit_locales',
        // add themes
        'curl:twister_theme_default',
        'curl:twister_theme_calm',
        'curl:twister_theme_nin',
        'unzip:twister_default',
        'unzip:twister_calm',
        'unzip:twister_nin',
        'copy:theme_default',
        'copy:theme_calm',
        'copy:theme_nin',
        'copy:empty',
        // add blockchain bootstrap
//        'curl:bootstrap_db48',
//        'unzip:bootstrap_db48',
        'copy:bootstrap',
        // add binaries
        // final compressing
        'compress:twister_linux_ia32'
    ]);
    // Linux64
    grunt.registerTask('linux64', [
        // make node-webkit app
        'copy:app',
        'nodewebkit',
        'copy:nodewebkit_locales',
        // add themes
        'curl:twister_theme_default',
        'curl:twister_theme_calm',
        'curl:twister_theme_nin',
        'unzip:twister_default',
        'unzip:twister_calm',
        'unzip:twister_nin',
        'copy:theme_default',
        'copy:theme_calm',
        'copy:theme_nin',
        'copy:empty',
        // add blockchain bootstrap
//        'curl:bootstrap_db48',
//        'unzip:bootstrap_db48',
        'copy:bootstrap',
        // add binaries
        // final compressing
        'compress:twister_linux_x64'
    ]);
    // Win32 - NSIS
    grunt.registerTask('nsis', [
        'win',
        'copy:nsis',
        'exec:nsis'
    ]);
    //grunt.registerTask('nsis', ['clean']); // just a note that clean task exists

};
