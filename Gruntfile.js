module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
	  pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dist: {
				watch: true,
				keepAlive: true,
				files: {
					'dist/sdbscan.js': ['browser.js']
				}
			}
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015']
			},
			dist: {
				files: {
					'dist/sdbscan.js': 'dist/sdbscan.js'
				}
			}
		},
	  uglify: {
	    options: {
	      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    },
			dist : {
				files: {
					'dist/sdbscan.min.js' : ['dist/sdbscan.js']
				}
			}
	  },
		clean: ['dist/*.js','dist/*.map']
	});

	grunt.registerTask('default', ['browserify','babel','uglify']);
};
