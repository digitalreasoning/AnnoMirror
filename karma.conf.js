module.exports = function(config) {
    var settings = {
        preprocessors: {
            'js/**/*.js': 'coverage',
            'test/**/*.spec.js': 'coverage'
        },
        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/codemirror/lib/codemirror.js',
            'js/annomirror.js',
            'test/**/*.spec.js',
            {
                pattern: 'test/fixtures/**/*.html',
                included: false, served: true
            },
            {
                pattern: 'bower_components/codemirror/lib/codemirror.css',
                included: false, served: true
            },
            {
                pattern: 'css/annomirror.css',
                included: false, served: true
            }
        ],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: ['Chrome', 'Firefox'],
        reporters: ['spec', 'coverage', 'coveralls'],
        specReporter: { maxLogLines: 5 },
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-spec-reporter',
            'karma-jasmine',
            'karma-coverage',
            'karma-coveralls'
        ],
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        }
    };
    if (process.env.TRAVIS)
        settings.browsers = ['Chrome_travis_ci', 'Firefox'];
    config.set(settings);
};
