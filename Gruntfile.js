'use strict';

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadTasks('tasks');

    // Define the configuration for all the tasks
    grunt.initConfig({
        appConfig: {
            fullDist: __dirname + '\\dist\\'
        },

        clean: {
            dist: ['dist']
        },

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dest: 'dist',
                        src: [
                            'src/**/*.{js,json}',
                            'filesrepo.js',
                            'config.json',
                            'package.json'
                        ]
                    }, {
                        expand: true,
                        dest: 'dist/',
                        src: '**',
                        cwd: 'web'
                    }
                ]
            }
        },

        ts: {
            options: {                                         // use to override the default options, http://gruntjs.com/configuring-tasks#options
                target:      'es5',                            // 'es3' (default) | 'es5'
                module:      'commonjs',                       // 'amd' (default) | 'commonjs'
                sourcemap:   true,                             // true  (default) | false
                declaration: false,                            // true | false  (default)
                comments:    true,                             // true | false (default)
                fast:        'always'
            },
            dev: {
                src: ['src/**/*.ts', 'filesrepo.ts']
            }
        },

        shell: {                                // Task
            listFolders: {                      // Target
                options: {                      // Options
                    stderr: false
                },
                command: 'ls'
            },
            copy_dist2DS: {
                options: {
                    stdout: true
                },
                command: 'powershell tasks/copy_dist2DS.ps1'
            }
        }

    });

    // deploy
    grunt.registerTask('deploy2DS', 'Compile, create dist folder, npm inst and copy to DS', [
        'ts:dev',
        'clean:dist',
        'copy:dist',
        'shell:copy_dist2DS'
    ]);
};
