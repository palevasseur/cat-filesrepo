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

        availabletasks: {
            tasks: {
            }
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
        }
    });

    // Default task
    grunt.registerTask('default', ['availabletasks:tasks']);

    // deploy
    grunt.registerTask('deploy', 'Compile and create dist folder', [
        'ts:dev',
        'clean:dist',
        'copy:dist'
    ]);
};
