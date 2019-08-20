const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const scraper = require('./scraper');
const helpers = require('./helpers');
const writeFile = helpers.writeFile;
const toXLSX = helpers.toXLSX;
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.post('/download', (req, res) => {
	let searchResult = toXLSX(req.body.result, {
		fields: ['timestamp', 'user_id', 'user_name', 'hashtag', 'text', 'retweets', 'likes'],
		fieldsName: ['작성일', '아이디', '이름', '해시태그', '내용', '리트윗', '좋아요']
	});
	let folderPath = path.join(__dirname, '/public/files/');
	let filename = 'searchResult_' + req.body.filename + '.xlsx';
	let fileResPath = '/files/' + filename;
	let filePath = path.join(folderPath, filename);
	let result = writeFile(folderPath, filePath, searchResult, 'binary');

	if (result == 200) {
		console.log(`스크랩 결과 저장 완료! (파일명: ${filename})`);
		res.status(200).send(fileResPath);
	} else {
		res.status(500).send(`예기치 못한 오류가 발생했습니다. ${result}`);
	}
});

app.post('/scrape', async (req, res) => {
	let qstr = req.body.qstr;
	let startDate = req.body.startDate;
	let endDate = req.body.endDate;
	let result = await scraper.run(qstr, startDate, endDate);

	if (result) {
		res.status(200).json(result);
	} else {
		res.status(500).send('조회 결과가 없습니다.');
	}
});

app.listen(port, () => {
	console.log(`listening on ${port}`);
});
