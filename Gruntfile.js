var generateCommonJSModule = require('./bower_components/bootstrap/grunt/bs-commonjs-generator.js');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    bspkg: grunt.file.readJSON('bower_components/bootstrap/package.json'),
    bspath: 'bower_components/bootstrap',
    banner: '/*!\n' +
    ' * Bootstrap v<%= bspkg.version %> (<%= bspkg.homepage %>)\n' +
    ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= bspkg.author %>\n' +
    ' * Licensed under <%= bspkg.license.type %> (<%= bspkg.license.url %>)\n' +
    ' */\n',
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'client',
          src: ['*.jsx'],
          dest: 'public/js/',
          ext: '.js',
        }]
      }
    },
    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'bootstrap.css.map',
          sourceMapFilename: 'public/css/bootstrap.css.map',
          paths: '<%= bspath %>/less'
        },
        files: {
          'public/css/bootstrap.css': 'less/site.less'
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'bower_components/jquery/dist',
          src: 'jquery.js',
          dest: 'public/js'
        },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/fonts',
            src: '*',
            dest: 'public/fonts'
          },
          {
            expand: true,
            cwd: 'bower_components/react',
            src: ['react.js', 'react-dom.js'],
            dest: 'public/js'
          },
          {
            expand: true,
            cwd: 'bower_components/underscore',
            src: 'underscore.js',
            dest: 'public/js'
          },
          {
            expand: true,
            cwd: 'bower_components/socket.io-client/',
            src: ['socket.io.js'],
            dest: 'public/js/'
          },
          {
            expand: true,
            cwd: 'bower_components/ircng/dist/',
            src: ['ircng.js'],
            dest: 'public/js/'
          },
          {
            expand: true,
            cwd: 'bower_components/moment/',
            src: ['moment.js'],
            dest: 'public/js/'
          }]
      }
    },
    watch: {
      jsx: {
        files: 'client/**/*.jsx',
        tasks: ['babel']
      },
      less: {
        files: 'less/**/*.less',
        tasks: 'less'
      }
    },
    concat: {
      bootstrap: {
        src: [
          'bower_components/bootstrap/js/transition.js',
          'bower_components/bootstrap/js/alert.js',
          'bower_components/bootstrap/js/button.js',
          'bower_components/bootstrap/js/carousel.js',
          'bower_components/bootstrap/js/collapse.js',
          'bower_components/bootstrap/js/dropdown.js',
          'bower_components/bootstrap/js/modal.js',
          'bower_components/bootstrap/js/tooltip.js',
          'bower_components/bootstrap/js/popover.js',
          'bower_components/bootstrap/js/scrollspy.js',
          'bower_components/bootstrap/js/tab.js',
          'bower_components/bootstrap/js/affix.js'
        ],
        dest: 'public/js/bootstrap.js',
        jqueryCheck: 'if (typeof jQuery === "undefined") { throw new Error("Bootstrap requires jQuery") }\n\n'
      },
      // options: {
      //   banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>',
      //   stripBanners: false
      // },
    },
    uglify: {
      options: {
        compress: {
          warnings: false
        },
        mangle: true,
        preserveComments: 'some'
      },
      core: {
        src: '<%= concat.bootstrap.dest %>',
        dest: 'public/js/bootstrap.min.js'
      }
    },
    autoprefixer: {
      options: {
        browsers: [
          'Android 2.3',
          'Android >= 4',
          'Chrome >= 20',
          'Firefox >= 24', // Firefox 24 is the latest ESR
          'Explorer >= 8',
          'iOS >= 6',
          'Opera >= 12',
          'Safari >= 6'
        ]
      },
      core: {
        options: {
          map: true
        },
        src: 'public/css/bootstrap.css'
      }
    },
    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        noAdvanced: true
      },
      core: {
        files: {
          'public/css/bootstrap.min.css': 'public/css/bootstrap.css'
        }
      }
    },
    usebanner: {
      options: {
        position: 'top',
        banner: '<%= banner %>'
      },
      files: {
        src: 'public/css/bootstrap.css'
      }
    }
  });

  // CSS distribution task.
  grunt.registerTask('dist-css', ['less:compileCore', 'autoprefixer', 'usebanner', 'cssmin']);
  grunt.registerTask('dist-js', ['babel', 'concat', 'uglify:core', 'copy']);
};
