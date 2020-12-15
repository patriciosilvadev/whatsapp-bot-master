const real = require("./subreddit");
class SRClientNSFW {
    constructor() {
        this.real = real;
    }
}
module.exports = {Client: SRClientNSFW};