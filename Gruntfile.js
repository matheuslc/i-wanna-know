module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),

        connect: {
          server: {
            options: {
              port: 9001,
              hostname: 'localhost',
              open: true,
              keepalive: true
            }
          }
        }

    });

      grunt.loadNpmTasks('grunt-contrib-connect');
       
      grunt.registerTask('server', ['connect']);
};

