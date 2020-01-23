module.exports = {
    sets: {
        desktop: {
            files: 'hermione/e2e'
        }
    },

    baseUrl: 'http://localhost:3000',
    gridUrl: 'http://0.0.0.0:4444/wd/hub',
    compositeImage: true,

    browsers: {
        chromeXL: {
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['--remote-debugging-port=9225'],
                },
            },
            windowSize: '1300x900',
        }
    },

    plugins: {
        'html-reporter/hermione': {
            enabled: true,
            path: 'hermione/hermione-reports',
            defaultView: 'all',
            baseHost: 'http://localhost:3000'
        }
    }
};
