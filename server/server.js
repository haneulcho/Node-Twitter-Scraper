const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const scraper = require('./scraper');
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.get('/download', (req, res) => {
	let filename = 'searchResult';
	let path = __dirname + "/files/" + filename + ".csv";
	res.status(200).download(path);
});

app.post('/scrape', async (req, res) => {
	let qstr = req.body.qstr;
	let startDate = req.body.startDate;
	let endDate = req.body.endDate;
	let chunk = 'day';

	let result = await scraper.run(qstr, startDate, endDate, chunk);

	if (result) {
		res.status(200).json(result);
	} else {
		res.status(500).send('조회 결과가 없습니다.');
	}
});

app.listen(port, () => {
	console.log(`listening on ${port}`);
});
