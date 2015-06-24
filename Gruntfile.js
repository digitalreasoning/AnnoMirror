module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            test: {
                src: 'js/*.js',
                options: {
                    vendor: [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
                        'bower_components/codemirror/lib/codemirror.js'
                    ],
                    specs: 'test/*.spec.js'
                }
            }
        },
        watch: {
            files: ['js/*.js', 'test/*.js'],
            tasks: ['jasmine']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
