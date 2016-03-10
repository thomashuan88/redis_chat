module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		jshint: {
			all: [
				'test/*.js',
				'index.js'
			]
		},
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					mask: '*.js',
					reportFormats: ['cobertura', 'html', 'lcovonly']
				}
			}
		},
		coveralls: {
			options: {
				src: 'coverage/lcov.info',
				force: false
			},
			app: {
				src: 'coverage/lcov.info'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-coveralls');
	grunt.loadNpmTasks('grunt-mocha-istanbul');

	grunt.registerTask('test', ['jshint', 'mocha_istanbul:coverage', 'coveralls']);
};