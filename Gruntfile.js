'use strict';
const BROWSERS = ['chrome'];
const ENV = process.env.NODE_ENV;

function compressConfig() {
  let config = {};

  BROWSERS.forEach(browser => {
    config[browser] = {
      options: {
        archive: `packages/${browser}.zip`
      },
      expand: true,
      cwd: `dist/${browser}/extension/`,
      src: ['**/*']
    };
  });

  config.source = {
    options: {
      archive: `packages/source.zip`
    },
    files: [
      {expand: true, cwd: 'dist/', src: ['**/*'], dest: 'dist/'},
      {expand: true, cwd: 'src/', src: ['**/*'], dest: 'src/'},
      {expand: true, cwd: '.', src: ['*.js', '*.md', '*.json', '.eslintrc.js', '.gitignore']}
    ]
  };

  return config;
}

function copyConfig() {
  let config = {};

  BROWSERS.forEach(browser => {
    config[`${browser}_images`] = {
      expand: true,
      cwd: 'src/assets/images',
      src: '**',
      dest: `dist/${browser}/extension/assets/images/`
    };

    config[`${browser}_views`] = {
      expand: true,
      cwd: 'src/views',
      src: '**',
      dest: `dist/${browser}/extension/views/`
    };
  });

  return config;
}

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    compress: compressConfig(),
    copy: copyConfig(),
    watch: {
      assets: {
        files: ['src/assets/images/**/*', 'src/views/**/*'],
        tasks: ['copy']
      }
    }
  });

  grunt.registerTask('default', ['copy', 'watch']);
  grunt.registerTask('build', ['copy']);
  grunt.registerTask('package', ['build', 'compress']);
};