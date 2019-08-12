const puppeteer = require('puppeteer');
const helpers = require('./helpers');
const toCSV = helpers.toCSV;
const splitDateRange = helpers.splitDateRange;
const autoScroll = helpers.autoScroll;

async function run(query, startDate, endDate, chunks) {
	let ret = [];
	let browser = await puppeteer.launch({
		headless: true,
		ignoreHTTPSErrors: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--mute-audio', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gl-drawing-for-tests', '--disable-gpu', '--disable-infobars', '--disable-breakpad', '--window-size=1280,1024', "--proxy-server='direct://'", '--proxy-bypass-list=*']
	});

	try {
		let dateChunks = splitDateRange(startDate, endDate, chunks);
		let urls = [];

		const blockedResourceTypes = [
			'image',
			'media',
			'font',
			'texttrack',
			'object',
			'beacon',
			'csp_report',
			'imageset'
		];

		const skippedResources = [
			'quantserve',
			'adzerk',
			'doubleclick',
			'adition',
			'exelator',
			'sharethrough',
			'cdn.api.twitter',
			'google-analytics',
			'googletagmanager',
			'google',
			'fontawesome',
			'facebook',
			'analytics',
			'optimizely',
			'clicktale',
			'mixpanel',
			'zedo',
			'clicksor',
			'tiqcdn'
		];

		for (var i = 0; i < dateChunks.length; i += 1) {
			urls.push(`https://twitter.com/search?f=tweets&q=${query}%20since%3A${dateChunks[i].start}%20until%3A${dateChunks[i].end}`);
		}
	
		for (i = 0; i < urls.length; i += 1) {
			let page = await browser.newPage();

			console.log("스크랩 하는 중: " + urls[i]);
			const start = Date.now();

			await page.setRequestInterception(true);
			await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
			await page.setViewport({
				width: 1280,
				height: 1024
			});

			page.on('request', (req) => {
				const requestUrl = req._url.split('?')[0].split('#')[0];
				if (blockedResourceTypes.indexOf(req.resourceType()) !== -1 || skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)) {
					req.abort();
				} else {
					req.continue();
				}
			});

			await page.goto(urls[i], {
				waitUntil: 'networkidle2',
				setDefaultNavigationTimeout: 0
			});

			await autoScroll(page);
	
			const tweets = await page.evaluate(function() {
				const TWEET_SELECTOR = '.js-stream-tweet';
				let elements = Array.from(document.querySelectorAll(TWEET_SELECTOR));

				if (elements.length) {
					let ret = [];
					for (var i = 0; i < elements.length; i += 1) {
						let tweet = {};
		
						const TWEET_TEXT_SELECTOR = ".tweet-text";
						tweet.text = elements[i].querySelector(TWEET_TEXT_SELECTOR).textContent;
		
						const TWEET_TIMESTAMP_SELECTOR = '.js-short-timestamp';
						let originDate = parseInt(elements[i].querySelector(TWEET_TIMESTAMP_SELECTOR).getAttribute('data-time-ms'));
						let newDate = new Date(originDate);
						let year = newDate.getFullYear().toString().slice(2);
						let month = (newDate.getMonth() + 1 < 10) ? 0 + parseInt(newDate.getMonth() + 1).toString() : newDate.getMonth() + 1;
						let date = (newDate.getDate() < 10) ? 0 + newDate.getDate().toString() : newDate.getDate().toString();
						let hours = (newDate.getHours() < 10) ? 0 + newDate.getHours().toString() : newDate.getHours().toString();
						let minutes = (newDate.getMinutes() < 10) ? 0 + newDate.getMinutes().toString() : newDate.getMinutes().toString();
						let seconds = (newDate.getSeconds() < 10) ? 0 + newDate.getSeconds().toString() : newDate.getSeconds().toString();
						let newTimeStamp = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
						tweet.timestamp = newTimeStamp;
		
						const TWEET_ID_SELECTOR = 'data-tweet-id';
						tweet.id = elements[i].getAttribute(TWEET_ID_SELECTOR);
		
						const TWEET_USERID_SELECTOR = '.username';
						tweet.user_id = elements[i].querySelector(TWEET_USERID_SELECTOR).textContent;
		
						const TWEET_USERDESC_SELECTOR = '.fullname';
						tweet.user_name = elements[i].querySelector(TWEET_USERDESC_SELECTOR).textContent;
		
						const TWEET_USERIMG_SELECTOR = '.js-action-profile-avatar';
						tweet.user_img = elements[i].querySelector(TWEET_USERIMG_SELECTOR).getAttribute('src');
		
						const TWEET_HASHTAG_SELECTOR = '.twitter-hashtag';
						let hashtags = elements[i].querySelectorAll(TWEET_HASHTAG_SELECTOR);
						let hashtag = [];
		
						for (var k = 0; k < hashtags.length; k += 1) {
							hashtag.push(hashtags[k].textContent ? hashtags[k].textContent : null);
						}
						tweet.hashtag = hashtag.join(' ');
		
						const ACTIONS_SELECTOR = ".ProfileTweet-actionCountForPresentation";
						let actions = elements[i].querySelectorAll(ACTIONS_SELECTOR);
		
						for (var j = 0; j < actions.length; j += 1) {
							tweet.retweets = actions[1].innerHTML ? parseInt(actions[1].innerHTML.replace(',', '')) : 0;
							tweet.likes = actions[3].innerHTML ? parseInt(actions[3].innerHTML.replace(',', '')) : 0;
						}
		
						ret.push(tweet);
					}
					return ret;
				}
			});

			if (tweets) {
				console.log('스크랩 완료! 긁어오는 데 걸린 시간: ', Date.now() - start, 'ms');
				ret.push(tweets);
			}

			await page.close();
		}
	} catch (e) {
		console.error(e);
	} finally {
		await browser.close();
		if (ret.length) {
			let result = [].concat.apply([], ret);
			path = './files/searchResult.csv';
			toCSV(result, path);
			return result;
		} else {
			console.error('스크랩 실패! 조회 결과가 없어요.');
			return false;
		}
	}
}

module.exports.run = run;