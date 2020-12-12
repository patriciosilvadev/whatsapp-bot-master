const { default: got } = require('got/dist/source');
const fetch = require('node-fetch')
const { getBase64 } = require("./fetcher")
const request = require('request')
const emoji = require('emoji-regex')
const fs = require('fs-extra')


const liriklagu = async (lagu) => {
    const response = await fetch(`http://scrap.terhambar.com/lirik?word=${lagu}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status === true) return `Letra da Musica ${lagu}\n\n${json.result.lirik}`
    return `[ Error ] No lyrics for ${lagu} were found!`
}


const quotemaker = async (quotes, author = 'EmditorBerkelas', type = 'random') => {
    var q = quotes.replace(/ /g, '%20').replace('\n','%5Cn')
    const response = await fetch(`https://terhambar.com/aw/qts/?kata=${q}&author=${author}&tipe=${type}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    const json = await response.json()
    if (json.status) {
        if (json.result !== '') {
            const base64 = await getBase64(json.result)
            return base64
        }
    }
}

const emojiStrip = (string) => {
    return string.replace(emoji, '')
}
const fb = async (url) => {
    const response = await fetch(`http://scrap.terhambar.com/fb?link=${url}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    const json = await response.json()
    if (json.status === true) return {
        'capt': json.result.title, 'exts': '.mp4', 'url': json.result.linkVideo.sdQuality
    }
    return {
        'capt': '[ ERROR ] Not found!', 'exts': '.jpg', 'url': 'https://c4.wallpaperflare.com/wallpaper/976/117/318/anime-girls-404-not-found-glowing-eyes-girls-frontline-wallpaper-preview.jpg'
    }
}

const ss = async(query) => {
    request({
        url: "https://api.apiflash.com/v1/urltoimage",
        encoding: "binary",
        qs: {
            access_key: "2fc9726e595d40eebdf6792f0dd07380",
            url: query
        }
    }, (error, response, body) => {
        if (error) {
            console.log(error);
        } else {
            fs.writeFile("./media/img/screenshot.jpeg", body, "binary", error => {
                console.log(error);
            })
        }
    })
}

const randomNimek = async (type) => {
    switch(type) {
        case 'nsfw':
            const nsfw = await fetch('https://api.computerfreaker.cf/v1/nsfwneko',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!nsfw.ok) throw new Error(`unexpected response ${nsfw.statusText}`)
            const resultNsfw = await nsfw.json()
            return resultNsfw.url
            break
        case 'hentai':
            const hentai = await fetch('https://api.computerfreaker.cf/v1/hentai',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!hentai.ok) throw new Error(`unexpected response ${hentai.statusText}`)
            const resultHentai = await hentai.json()
            return resultHentai.url
            break
        case 'anime':
            let anime = await fetch('https://api.computerfreaker.cf/v1/anime',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!anime.ok) throw new Error(`unexpected response ${anime.statusText}`)
            const resultNime = await anime.json()
            return resultNime.url
            break
        case 'neko':
            let neko = await fetch('https://api.computerfreaker.cf/v1/neko',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!neko.ok) throw new Error(`unexpected response ${neko.statusText}`)
            const resultNeko = await neko.json()
            return resultNeko.url
            break
		case 'dva':
            let dva = await fetch('https://api.computerfreaker.cf/v1/dva',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!dva.ok) throw new Error(`unexpected response ${dva.statusText}`)
            const resultDva = await dva.json()
            return resultDva.url
            break
		case 'macaco':
            let macaco = await fetch('https://www.placemonkeys.com/1000/800?random',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
            if (!macaco.ok) throw new Error(`unexpected response ${dva.statusText}`)
            const resultMacaco = await macaco.json()
            return resultMacaco.url
            break
    }
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


exports.liriklagu = liriklagu;
exports.quotemaker = quotemaker;
exports.randomNimek = randomNimek
exports.fb = fb
exports.emojiStrip = emojiStrip
exports.sleep = sleep
exports.ss = ss