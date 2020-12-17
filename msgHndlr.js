const { decryptMedia } = require('@open-wa/wa-decrypt');
const fs = require('fs-extra');
const axios = require('axios');
const get = require('got');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const color = require('./lib/color');
const { spawn, exec } = require('child_process');
const { sleep, is } = require('./lib/functions');
const { help, readme } = require('./lib/help');
const { stdout } = require('process');
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg');

const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')

const SRImages = require('./lib/subreddit-images');
const SRImagesClient = new SRImages.Client();

const rpgDiceRoller = require('rpg-dice-roller');
const { getStickerMaker } = require('./lib/ttp');
const youtubedl = require('youtube-dl');
const Downloader = require('./lib/downloader');
var m3u8ToMp4 = require("m3u8-to-mp4");

const listMedia = require('./lib/4chan-list-media')

const lottery = require('loterias-caixa-scraper')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('!')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }
        const mess = {
            wait: '[WAIT] In progress⏳ please wait a moment',
            error: {
                St: '[❗] Send the image with the caption *! Sticker * or the image tag that has been sent',
                Qm: '[❗] An error occurred, maybe the theme is not available!',
                Yt3: '[❗] An error occurred, unable to convert to mp3!',
                Yt4: '[❗] An error occurred, maybe the error was caused by the system.',
                Ig: '[❗] An error occurred, maybe because the account is private',
                Ki: '[❗] Bot cant take out the group admin!',
                Ad: '[❗] Cannot add target, maybe because its private',
                Iv: '[❗] The link you submitted is invalid!'
            }
        }
		const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["556299313132@c.us","556299313132"] // replace with your whatsapp number
        const isOwner = ownerNumber.includes(sender.id)
        const isBlocked = blockNumber.includes(sender.id)
		const bakaNumber = ['556281313310@c.us']
		const isBaka = bakaNumber.includes(sender.id)
        //const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        //if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        //if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        if (!isOwner) return
        switch(command) {
			
// ######################################################################################################
// ######################################################################################################
// #################################     STICKER FUNCTIONS    ###########################################
// ######################################################################################################
// ######################################################################################################			
			case '!sticker':
			case '!stiker':
			case '!s':
				if (isMedia && type === 'image' ) {
					const mediaData = await decryptMedia(message, uaOverride)
					const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
					await client.sendImageAsSticker(from, imageBase64)
				} else if (quotedMsg && quotedMsg.type == 'image') {
					const mediaData = await decryptMedia(quotedMsg, uaOverride)
					const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
					await client.sendImageAsSticker(from, imageBase64)
				} else if (args.length === 2) {
					const url = args[1]
					if (url.match(isUrl)) {
						await client.sendStickerfromUrl(from, url, { method: 'get' })
							.catch(err => console.log('Caught exception: ', err))
					} else {
						client.reply(from, mess.error.Iv, id)
					}
				} else {
						client.reply(from, mess.error.St, id)
				}
				break
			case '!stickergif':
			case '!stikergif':
			case '!sgif':
				if (isMedia) {
					if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
						const mediaData = await decryptMedia(message, uaOverride)
						client.reply(from, '[WAIT] In progress⏳ please wait ± 1 min!', id)
						const filename = `./media/aswu.${mimetype.split('/')[1]}`
						await fs.writeFileSync(filename, mediaData)
						await exec(`gify ${filename} ./media/output.gif --fps=30 --scale=240:240 --time 6`, async function (error, stdout, stderr) {
							const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
							await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
						})
					} else (
						client.reply(from, '[❗] Send a video with the caption *!stickergif * max 06 sec!', id)
					)
				}
				break
			case '!giphy2sticker':
			case '!g2s':
				if (args.length === 1) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
				if (args.length === 2) {
					const url = body.split(' ')[1];
					if (is.Giphy(url)) {
						const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
						if (!getGiphyCode) { return client.reply(from, 'Failed to retrieve the giphy code', id) }
						const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
						const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
						client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
							client.reply(from, 'Here\'s your sticker')
						}).catch((err) => console.log(err))
					} else if (is.MediaGiphy(url)) {
						const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
						if (!gifUrl) { return client.reply(from, 'Failed to retrieve the giphy code', id) }
						const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
						client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
							client.reply(from, 'Here\'s your sticker')
						}).catch((err) => console.log(err))
					} else {
						await client.reply(from, 'sorry, for now gif stickers can only use the link from giphy  [Giphy Only]', id)
					}
				}
				break
			case '!vid2sticker':
			case '!v2s':
				if (args.length === 1) return client.reply(from, 'Sorry, the message format is wrong, please check the menu. [Wrong Format]', id)
				if (args.length === 2) {
					const download = new Downloader();
					const url = body.split(' ')[1];
					axios.get(url, {responseType: "stream"}).then(response => {
										//console.log(response.headers['content-type']);
										//console.log(response);
										const fileType = response.headers['content-type'];
										const ext = fileType ? fileType.split('/').pop() : undefined;
										//console.log(ext);
										if(ext === 'webm' || ext === 'gif' || ext === 'mp4'){
											const dest = './media/';
											
											download.get(url,dest);
										}else return client.reply(from,'wrong video format');
										});
					 download.on('done', (dst) => {
						let fileName = './'+dst;
						exec(`gify ${fileName} ./media/output.gif --fps=30 --scale=240:240 --time 6`, async function (error, stdout, stderr) {
											const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" });
											await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`).catch((err) => console.log(err));
											});
						
					}); 
				}
				break
			case '!stickernobg':
			case '!stikernobg':
			case '!snobg':
			if (isMedia && type === 'image' ) {
					try {
						var mediaData = await decryptMedia(message, uaOverride)
						var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
						var base64img = imageBase64
						var outFile = './media/img/noBg.png'
						// for the api key you can get it on the website remove.bg
						var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'jStop5xAeABgDDC5Lx6Nv9EZ', size: 'auto', type: 'auto', outFile })
						await fs.writeFile(outFile, result.base64img)
						await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
					} catch(err) {
						console.log(err)
					}
				} else if (quotedMsg && quotedMsg.type == 'image') {
					try {
						var mediaData = await decryptMedia(quotedMsg, uaOverride)
						var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
						var base64img = imageBase64
						var outFile = './media/img/noBg.png'
						var result = await removeBackgroundFromImageBase64({ base64img, apiKey: 'jStop5xAeABgDDC5Lx6Nv9EZ', size: 'auto', type: 'auto', outFile })
						await fs.writeFile(outFile, result.base64img)
						await client.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
					} catch(err) {
						console.log(err)
					}
				}
				break
			case '!ttp':
					if (!isGroupMsg) return client.reply(from, 'This command can only be used in groups!', message.id)
					try
					{
						const string = body.toLowerCase().includes('!ttp') ? body.slice(5) : body.slice(5)
						if(args)
						{
							if(quotedMsgObj == null)
							{
								const gasMake = await getStickerMaker(string)
								if(gasMake.status == true)
								{
									try{
										await client.sendImageAsSticker(from, gasMake.base64)
									}catch(err) {
										await client.reply(from, 'Failed to create.', id)
									} 
								}else{
									await client.reply(from, gasMake.reason, id)
								}
							}else if(quotedMsgObj != null){
								const gasMake = await getStickerMaker(quotedMsgObj.body)
								if(gasMake.status == true)
								{
									try{
										await client.sendImageAsSticker(from, gasMake.base64)
									}catch(err) {
										await client.reply(from, 'Failed to create.', id)
									} 
								}else{
									await client.reply(from, gasMake.reason, id)
								}
							}
						   
						}else{
							await client.reply(from, 'Can not be empty.', id)
						}
					}catch(error)
					{!
						console.log(error)
					}
				break;
				
// ######################################################################################################
// ######################################################################################################
// #################################        BAKA ONLY         ###########################################
// ######################################################################################################
// ######################################################################################################		
			case '!sexta':
				if (!isBaka) return client.reply(from, 'Você não é o Baka!', id)
				client.sendFile(from, './media/videos/sexta.mp4', 'sexta.mp4', '*HOJE É SEXTA FEIRA!!*', id)
				break
			case '!sextaespecial':
				if (!isBaka) return client.reply(from, 'Você não é o Baka, nem o dono!', id)
				client.sendFile(from, './media/videos/sextaespecial.mp4', id)
				const amaroneto = await fs.readFileSync('./media/videos/amaroneto.gif', { encoding: "base64" })
				await client.sendImageAsSticker(from, `data:image/gif;base64,${amaroneto.toString('base64')}`)
				const groupMek = await client.getGroupMembers(groupId)
				let heho = '╔═✪〘 *HOJE É SEXTA FEIRA* 〙\n'
				for (let i = 0; i < groupMek.length; i++) {
					heho += '╠➥'
					heho += ` @${groupMek[i].id.replace(/@c.us/g, '')}\n`
				}
				heho += '╚═〘 *E SEGUNDA É FERIADO!!* 〙'
				await sleep(1000)
				await client.sendTextWithMentions(from, heho)
				break
		
				
// ######################################################################################################
// ######################################################################################################
// #################################     RPG ROLL    ####################################################
// ######################################################################################################
// ######################################################################################################						
				
				
			case '!roll':
				if (args.length == 1) return client.reply(from, 'Send command *!roll [dice] *, example *!roll 1d20 *', id)
				if (args.length === 2) {
					const dice = body.split(' ')[1]
					const roller = new rpgDiceRoller.DiceRoller();
					roller.roll(dice);
					client.reply(from, `You rolled: ${roller}`, id);
				}
				break
				
// ######################################################################################################
// ######################################################################################################
// #################################     YOUTUBE E TWITTER VIDEO DOWNLOADER    ##########################
// ######################################################################################################
// ######################################################################################################		
			case '!tw':
				if (args.length === 1) return client.reply(from, 'Send command *!yt [link] *, example *!yt https://twitter.com/i/status/1337276001546432513 *', id)
				if (args.length === 2) {
				   const twlink = body.split(' ')[1]
				   const video = youtubedl(twlink
					  // Optional arguments passed to youtube-dl.
					  //['--format=18'],
					  // Additional options can be given for calling `child_process.execFile()`.
					  //{ cwd: __dirname }
					  );
				   video.on('info', function(info) {
										  console.log('Download started')
										  console.log('filename: ' + info._filename)
										  console.log('size: ' + info.size)
										  
										}
							);
					video.pipe(fs.createWriteStream('./media/twoutput.mp4'));
					video.on('end', function() {
											client.sendFile(from,'./media/twoutput.mp4','twoutput.mp4','=]',id);
										}
							);
				}
				break	
			case '!yt':
				if (args.length === 1) return client.reply(from, 'Send command *!yt [link] *, example *!yt http://www.youtube.com/watch?v=HVqCQLtgk04 *', id)
				if (args.length === 2) {
				   const ytlink = body.split(' ')[1]
				   const video = youtubedl(ytlink
					  // Optional arguments passed to youtube-dl.
					  //['--format=18'],
					  // Additional options can be given for calling `child_process.execFile()`.
					  //{ cwd: __dirname }
					  );
				   video.on('info', function(info) {
										  console.log('Download started')
										  console.log('filename: ' + info._filename)
										  console.log('size: ' + info.size)
										  
										}
							);
					video.pipe(fs.createWriteStream('./media/ytoutput.mp4'));
					try{
						video.on('end', function() {
											client.sendFile(from,'./media/ytoutput.mp4','ytoutput.mp4','=]',id);
										}
							);
					}catch{
							client.reply(from,'Desculpe, não foi possível enviar. Falha Catastrófica.',id);
							console.log(error);
					};
				}
				break
			case '!wait':
				if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
					if (isMedia) {
						var mediaData = await decryptMedia(message, uaOverride)
					} else {
						var mediaData = await decryptMedia(quotedMsg, uaOverride)
					}
					const fetch = require('node-fetch')
					const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
					client.reply(from, 'Searching....', id)
					fetch('https://trace.moe/api/search', {
						method: 'POST',
						body: JSON.stringify({ image: imgBS4 }),
						headers: { "Content-Type": "application/json" }
					})
					.then(respon => respon.json())
					.then(resolt => {
						if (resolt.docs && resolt.docs.length <= 0) {
							client.reply(from, 'Sorry, I don\'t know what anime this is', id)
						}
						const { is_adult, title, title_chinese, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
						teks = ''
						if (similarity < 0.92) {
							teks = '*I have low faith in this* :\n\n'
						}
						teks += `➸ *Title Japanese* : ${title}\n➸ *Title chinese* : ${title_chinese}\n➸ *Title Romaji* : ${title_romaji}\n➸ *Title English* : ${title_english}\n`
						teks += `➸ *Ecchi* : ${is_adult}\n`
						teks += `➸ *Eps* : ${episode.toString()}\n`
						teks += `➸ *Kesamaan* : ${(similarity * 100).toFixed(1)}%\n`
						var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
						client.sendFileFromUrl(from, video, 'nimek.mp4', teks, id).catch(() => {
							client.reply(from, teks, id)
						})
					})
					.catch(() => {
						client.reply(from, 'Error !', id)
					})
				} else {
					client.sendFile(from, './media/img/tutod.jpg', 'Tutor.jpg', 'Here\'s an example!', id)
				}
				break
			case '!letra':
				if (args.length == 1) return client.reply(from, 'Send command *!letra [optional] *, example *!letra Evidencias *', id)
				const lagu = body.slice(7)
				const lirik = await liriklagu(lagu)
				client.reply(from, lirik, id)
				break
				
// ######################################################################################################				
// ######################################################################################################
// #################################     RANDOM IMAGE E MEMES        ####################################
// ######################################################################################################
// ######################################################################################################							
			case '!cao':
				const dog = await fetch('https://random.dog/woof.json',{ headers: { 'User-Agent': 'meu pau de binoculo' } })
				const resultDog = await dog.json()
				client.sendFileFromUrl(from, resultDog.url)
				//client.reply(from, dog.url)
				break
			case '!gato':
				q2 = Math.floor(Math.random() * 900) + 300;
				q3 = Math.floor(Math.random() * 900) + 300;
				client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'neko.png')
				break
			case '!macaco':
				q2 = Math.floor(Math.random() * 1500) + 200;
				q3 = Math.floor(Math.random() * 1500) + 200;
				client.sendFileFromUrl(from, 'https://www.placemonkeys.com/'+q3+'/'+q2+'?random')
				break
			case '!meme':
				const subreddits = ['dankmemes', 'wholesomeanimemes', 'wholesomememes', 'AdviceAnimals', 'MemeEconomy', 'memes', 'terriblefacebookmemes', 'teenagers', 'historymemes']
				const randSub = subreddits[Math.random() * subreddits.length | 0]
				const response = await axios.get('https://meme-api.herokuapp.com/gimme/' + randSub);
				const { postlink, title, subreddit, url, nsfw, spoiler } = response.data
				client.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
				break
			case '!ramador':
				client.sendFile(from, './media/img/amador.png', 'M.Amador.png', 'NSFW', id);
				break
						case '!cu':
				client.sendFile(from, './media/img/hello.jpg', 'Goatsie.jpg', 'NSFW', id)
				break
			case '!tts':
				if (!isGroupMsg) return client.reply(from, 'This command can only be used in group!', id)
				try {
					if (args.length === 1) return client.reply(from, 'Send command *!tts [Language] [Text]*, for example *!tts pt-br oi como vai voce*')
					var dataBhs = args[1]      
					const ttsHZ = require('node-gtts')(dataBhs)
					var dataText = body.slice(8)
					if (dataText === '') return client.reply(from, 'Enter the text', id)
					if (dataText.length > 500) return client.reply(from, 'Text is too long!', id)
					var dataBhs = body.slice(5, 7)
					ttsHZ.save('./media/tts.mp3', dataText, function () {
					client.sendPtt(from, './media/tts.mp3', id)
					})
				} catch (err){
					console.log(err)
					client.reply(from, bahasa_list, id)
				}
				break

				
// ######################################################################################################				
// ######################################################################################################
// #################################     JOIN VIA LINK        ###########################################
// ######################################################################################################
// ######################################################################################################				
			
			
			case '!join':
				//return client.reply(from, 'Jika ingin meng-invite bot ke group anda, silahkan izin ke wa.me/6285892766102', id)
				if (args.length < 2) return client.reply(from, 'Send the command *!join linkgroup key * \ n \ nEx: \ n!join https://chat.whatsapp.com/blablablablablabla abcde \ nfor the key you can get it for only 5k donations', id)
				const link = args[1]
				const key = args[2]
				const tGr = await client.getAllGroups()
				//const minMem = 30
				const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
				//if (key !== 'lGjYt4zA5SQlTDx9z9Ca') return client.reply(from, '* key * is wrong! please chat the bot owner to get a valid key', id)
				const check = await client.inviteInfo(link)
				if (!isLink) return client.reply(from, 'Ini link? 👊🤬', id)
				//if (tGr.length > 3) return client.reply(from, 'Sorry the number of groups is maximal!', id)
				//if (check.size < minMem) return client.reply(from, 'Member group tidak melebihi 30, bot tidak bisa masuk', id)
				if (check.status === 200) {
					await client.joinGroupViaLink(link).then(() => client.reply(from, 'The bot will be in soon!'))
				} else {
					client.reply(from, 'Invalid group link!', id)
				}
				break
			
// ######################################################################################################				
// ######################################################################################################
// #################################     4CHAN        ###################################################
// ######################################################################################################
// ######################################################################################################				
			case '!4chan':
				if (args.length === 1) return client.reply(from, 'Send command *!4chan [link] *', id)
				if (args.length === 2) {
					   const url4chan = body.split(' ')[1]
					try {
							const data = await listMedia(url4chan)
							//console.log('4chan thread: ' + data.media.subject + ' ( '+data.media.length+' files)');
							client.sendText(from,'4chan thread: ' + data.media.subject + ' ( '+data.media.length+' Images)');
							for (let i = 0; i < data.media.length; i++) {
								await client.sendFileFromUrl(from, data.media[i].url, data.media[i].filename, '')
								//console.log(i + ' | ' + data.media[i].filename + ' | ' + data.media[i].url);
								await sleep(400);
							}
							client.sendText(from,'*END OF THREAD*'); 
							
						} catch (err) {
							console.error('Whoa! 404! :c', err)
						}
				}
				break
			case '!teste':
				if (args.length === 1) return client.reply(from, 'Send command *!4chan [link]*', id)
				if (args.length === 2) {
					   const urlteste = body.split(' ')[1]
					   client.sendFileFromUrl(from, urlteste, 'video.webm', '')
				}
				break
// ######################################################################################################				
// ######################################################################################################
// #################################     LOTERIAS     ###################################################
// ######################################################################################################
// ######################################################################################################
			case '!megasena':
				if (args.length === 1) {
					lottery
						  .resultByNumber('megasena')
						  .then((result) => {
								let resultado = '';
								resultado +='*RESULTADO MEGA-SENA*\n'; 
								resultado +='*Concurso nº:* '+ result.numberRaffle+'\n'; 
								resultado +='*Números Sorteados:* '+ result.unorNumbers+'\n'; 
								resultado +='*Valor total:* R$'+result.totalCollection+'\n';
								resultado +='*Data do sorteio:* '+ result.date+'\n';
								resultado +='*Ganhadores:*\n';
								resultado +='*Sena*: '+result.sena.winers+' *Ganho por Jogador:* R$'+result.sena.prizeByWinner+'\n';
								resultado +='*Quina*: '+result.quina.winers+' *Ganho por Jogador:* R$'+result.quina.prizeByWinner+'\n';
								resultado +='*Quadra*: '+result.quadra.winers+' *Ganho por Jogador:* R$'+result.quadra.prizeByWinner+'\n';
								if (result.isAccumulated){
									resultado +='*Acumulado p/ próximo concurso*: R$'+ result.nextRaffle.accumulated+'\n';
								} else resultado +='Sem acúmulo.\n';
								resultado +='*Data próximo concurso*: '+ result.nextRaffle.date+'\n';
								resultado +='*MEGA DA VIRADA*: R$'+ result.accumulatedMegavirada+'\n';
								client.sendText(from,resultado);
							//console.log(result)
						  }).catch((e) => {
								console.log(e)
								})
				}
				if (args.length === 2) {
					lottery
						  .resultByNumber('megasena',body.split(' ')[1])
						  .then((result) => {
								let resultado = '';
								resultado +='*RESULTADO MEGA-SENA*\n'; 
								resultado +='*Concurso nº:* '+ result.numberRaffle+'\n'; 
								resultado +='*Números Sorteados:* '+ result.unorNumbers+'\n'; 
								resultado +='*Valor total:* R$'+result.totalCollection+'\n';
								resultado +='*Data do sorteio:* '+ result.date+'\n';
								resultado +='*Ganhadores:*\n';
								resultado +='*Sena*: '+result.sena.winers+' *Ganho por Jogador:* R$'+result.sena.prizeByWinner+'\n';
								resultado +='*Quina*: '+result.quina.winers+' *Ganho por Jogador:* R$'+result.quina.prizeByWinner+'\n';
								resultado +='*Quadra*: '+result.quadra.winers+' *Ganho por Jogador:* R$'+result.quadra.prizeByWinner+'\n';
								if (result.isAccumulated){
									resultado +='*Acumulado p/ próximo concurso*: R$'+ result.nextRaffle.accumulated+'\n';
								} else resultado +='Sem acúmulo.\n';
								resultado +='*Data próximo concurso*: '+ result.nextRaffle.date+'\n';
								resultado +='*MEGA DA VIRADA*: R$'+ result.accumulatedMegavirada+'\n';
								client.sendText(from,resultado);
							//console.log(result)
						  }).catch((e) => {
								console.log(e)
								})
				}
				break
				case '!quina':
				if (args.length === 1) {
					lottery
						  .resultByNumber('quina')
						  .then((result) => {
								let resultado = '';
								resultado +='*RESULTADO QUINA*\n'; 
								resultado +='*Concurso nº:* '+ result.numberRaffle+'\n'; 
								resultado +='*Números Sorteados:* '+ result.unorNumbers+'\n'; 
								resultado +='*Valor total:* R$'+result.totalCollection+'\n';
								resultado +='*Data do sorteio:* '+ result.date+'\n';
								resultado +='*Ganhadores:*\n';
								resultado +='*Quina*: '+result.quina.winers+' *Ganho por Jogador:* R$'+result.quina.prizeByWinner+'\n';
								resultado +='*Quadra*: '+result.quadra.winers+' *Ganho por Jogador:* R$'+result.quadra.prizeByWinner+'\n';
								resultado +='*Terno*: '+result.terno.winers+' *Ganho por Jogador:* R$'+result.terno.prizeByWinner+'\n';
								resultado +='*Duque*: '+result.duque.winers+' *Ganho por Jogador:* R$'+result.duque.prizeByWinner+'\n';
								if (result.isAccumulated){
									resultado +='*Acumulado p/ próximo concurso*: R$'+ result.nextRaffle.accumulated+'\n';
								} else resultado +='Sem acúmulo.\n';
								resultado +='*Data próximo concurso*: '+ result.nextRaffle.date+'\n';
								resultado +='*QUINA DE SÃO JOÃO*: R$'+ result.accumulatedSaoJoao+'\n';
								client.sendText(from,resultado);
							//console.log(result)
						  }).catch((e) => {
								console.log(e)
								})
				}
				if (args.length === 2) {
					lottery
						  .resultByNumber('quina',body.split(' ')[1])
						  .then((result) => {
								let resultado = '';
								resultado +='*RESULTADO QUINA*\n'; 
								resultado +='*Concurso nº:* '+ result.numberRaffle+'\n'; 
								resultado +='*Números Sorteados:* '+ result.unorNumbers+'\n'; 
								resultado +='*Valor total:* R$'+result.totalCollection+'\n';
								resultado +='*Data do sorteio:* '+ result.date+'\n';
								resultado +='*Ganhadores:*\n';
								resultado +='*Quina*: '+result.quina.winers+' *Ganho por Jogador:* R$'+result.quina.prizeByWinner+'\n';
								resultado +='*Quadra*: '+result.quadra.winers+' *Ganho por Jogador:* R$'+result.quadra.prizeByWinner+'\n';
								resultado +='*Terno*: '+result.terno.winers+' *Ganho por Jogador:* R$'+result.terno.prizeByWinner+'\n';
								resultado +='*Duque*: '+result.duque.winers+' *Ganho por Jogador:* R$'+result.duque.prizeByWinner+'\n';
								if (result.isAccumulated){
									resultado +='*Acumulado p/ próximo concurso*: R$'+ result.nextRaffle.accumulated+'\n';
								} else resultado +='Sem acúmulo.\n';
								resultado +='*Data próximo concurso*: '+ result.nextRaffle.date+'\n';
								resultado +='*QUINA DE SÃO JOÃO*: R$'+ result.accumulatedSaoJoao+'\n';
								client.sendText(from,resultado);
							//console.log(result)
						  }).catch((e) => {
								console.log(e)
								})
				}
				break
// ######################################################################################################				
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ############################################## NSFW SECTION ##########################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

			case '!nh':
				//if (isGroupMsg) return client.reply(from, 'Sorry this command for private chat only!', id)
				if (args.length === 2) {
					const nuklir = body.split(' ')[1]
					client.reply(from, mess.wait, id)
					const cek = await nhentai.exists(nuklir)
					if (cek === true)  {
						try {
							const api = new API()
							const pic = await api.getBook(nuklir).then(book => {
								return api.getImageURL(book.cover)
							})
							const dojin = await nhentai.getDoujin(nuklir)
							const { title, details, link } = dojin
							const { parodies, tags, artists, groups, languages, categories } = await details
							var teks = `*Title* : ${title}\n\n*Parodies* : ${parodies}\n\n*Tags* : ${tags.join(', ')}\n\n*Artists* : ${artists.join(', ')}\n\n*Groups* : ${groups.join(', ')}\n\n*Languages* : ${languages.join(', ')}\n\n*Categories* : ${categories}\n\n*Link* : ${link}`
							//exec('nhentai --id=' + nuklir + ` -P mantap.pdf -o ./hentong/${nuklir}.pdf --format `+ `${nuklir}.pdf`, (error, stdout, stderr) => {
							client.sendFileFromUrl(from, pic, 'hentod.jpg', teks, id)
								//client.sendFile(from, `./hentong/${nuklir}.pdf/${nuklir}.pdf.pdf`, then(() => `${title}.pdf`, '', id)).catch(() => 
								//client.sendFile(from, `./hentong/${nuklir}.pdf/${nuklir}.pdf.pdf`, `${title}.pdf`, '', id))
								/*if (error) {
									console.log('error : '+ error.message)
									return
								}
								if (stderr) {
									console.log('stderr : '+ stderr)
									return
								}
								console.log('stdout : '+ stdout)*/
								//})
						} catch (err) {
							client.reply(from, '[❗] Something went wrong, maybe the nuclear code is wrong', id)
						}
					} else {
						
						client.reply(from, '[❗] NuClear Code Incorrect!')
					}
				} else {
						/* const response =  axios.get('https://nhentai.net/random/').then(function(response){
						//var nuklir1 = response.request.path.substring(3, response.request.path.length - 1);
						//const nuklir = nuklir1.toString();
						const nuklir = "5970";
						client.reply(from, mess.wait, id)
						
						const cek = nhentai.exists(nuklir)
						if (cek === true)  {
							try {
								const api = new API()
								const pic = api.getBook(nuklir).then(book => {
									return api.getImageURL(book.cover)
								});
								const dojin = nhentai.getDoujin(nuklir)
								const { title, details, link } = dojin
								const { parodies, tags, artists, groups, languages, categories } = details
								var teks = `*Title* : ${title}\n\n*Parodies* : ${parodies}\n\n*Tags* : ${tags.join(', ')}\n\n*Artists* : ${artists.join(', ')}\n\n*Groups* : ${groups.join(', ')}\n\n*Languages* : ${languages.join(', ')}\n\n*Categories* : ${categories}\n\n*Link* : ${link}`
								client.sendFileFromUrl(from, pic, 'hentod.jpg', teks, id)
								
							} catch (err) {
								client.reply(from, '[❗] Something went wrong, maybe the nuclear code is wrong', id)
							}
						} else {
							
							client.reply(from, '[❗] NuClear Code Incorrect!')
						}
					client.reply(from, '*[ NH ] RANDOM!*')  
					}); */
					client.reply(from, '[ WRONG ] Digite *!nh [nuClear]*')
				}
				break
			case '!rpussy':
				SRImagesClient.real.pussy().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!ramateurs':
				SRImagesClient.real.amateurs().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!rgonewild':
			case '!rgw':
				SRImagesClient.real.gonewild().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!rblowjob':
			case '!rbj':
				SRImagesClient.real.blowjob().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break 
			case '!rasshole':
				SRImagesClient.real.asshole().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break 
			case '!rboobs':
				SRImagesClient.real.boobs().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!rr':
				SRImagesClient.real.random().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!rthighs':
				SRImagesClient.real.thighs().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
			case '!rpanties':
				SRImagesClient.real.panties().then(json => {
														//console.log(json);
														client.sendFileFromUrl(from, json.url);
														// outputs data with image url, possible source and other stuff
													}).catch(error => {
														client.reply(from,'Desculpe, não foi possível enviar a imagem. Repita o comando',id);
														console.log(error);
														// outputs error
													});
				break
// ######################################################################################################				
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
			case '!help':
				client.sendText(from, help)
				break
			case '!fuckyou':
				client.reply(from,'No. Fuck you!',id);
				break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //client.kill().then(a => console.log(a))
    }
}
