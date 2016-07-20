module.exports = function(grunt) {

    grunt.initConfig({
        typings: {
            install: {}
        },
        ts: {
            options: {
                module: 'commonjs',
                target: 'es6'
            },
            default: {
                src: './src/**/*.ts',
                outDir: './build'
            }
        },
        concat: {
            basic: {
                src: ['./build/obsidian.js'],
                dest: './build/obsidian.js'
            },
            options: {
                banner: '#!/usr/bin/env node\r\n'
            }
        },
        clean: {
            build: ['build']
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-typings');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('build', [
        'clean:build',
        'typings',
        'ts',
        'concat'
    ]);

    grunt.registerTask('test', [
        'build',
        'mochaTest'
    ]);

};