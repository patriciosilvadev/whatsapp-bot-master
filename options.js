module.exports = options = (headless, start) => {
    const options = {
        sessionId: 'BarBar',
        headless: headless,
        qrTimeout: 0,
        authTimeout: 0,
        restartOnCrash: start,
        cacheEnabled: false,
        useChrome: false,
        killProcessOnBrowserClose: true,
        throwErrorOnTosBlock: false,
        args: [
            '--no-sandbox',
        ],
    }
    return options
}
