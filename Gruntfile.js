module.exports = function(grunt) {

    grunt.initConfig({
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
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build', [
        'clean:build',
        'ts',
        'concat'
    ]);

};