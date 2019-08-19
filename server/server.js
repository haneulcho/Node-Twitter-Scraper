const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const scraper = require('./scraper');
const helpers = require('./helpers');
const toCSV = helpers.toCSV;
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.post('/download', (req, res) => {
	let result = req.body.result;
	let filename = 'searchResult_' + req.body.filename;
	let path = '/files/' + filename + '.csv';
	let csvWriter = toCSV(__dirname + '/public' + path);

	csvWriter.writeRecords(result)
	.then(() => {
		console.log(`스크랩 결과 저장 완료! (파일명: ${filename}.csv)`);
		res.status(200).send(path);
	})
	.catch(err => {
		res.status(500).send(`예기치 못한 오류가 발생했습니다. ${err}`);
	});

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
