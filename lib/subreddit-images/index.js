const real = require("./subreddit");
class SRClientNSFW {
    constructor() {
		
        this.real = new RandomPic();
    }
}
class SRClient {
    constructor() {
        this.nsfw = new SRClientNSFW();
    }
}
module.exports = {Client: SRClientNSFW};