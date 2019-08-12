const chunk = require('chunk-date-range');
const dateformat = require('dateformat');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = {
	"toCSV": function(tweets, path) {
		const csvWriter = createCsvWriter({
			path: path,
			header: [{
				id: "timestamp",
				title: "작성일"
			}, {
				id: "user_id",
				title: "아이디"
			}, {
				id: "user_name",
				title: "이름"
			}, {
				id: "hashtag",
				title: "해시태그"
			}, {
				id: "text",
				title: "내용"
			}, {
				id: "retweets",
				title: "리트윗"
			}, {
				id: "likes",
				title: "좋아요"
			}]
		});

		csvWriter.writeRecords(tweets)
			.then(() => {
				console.log(`스크랩 결과 저장 완료! (파일명: ${path})`);
			});
	},
	"splitDateRange": function(startDate, endDate, chunks) {
		let start = new Date(startDate);
		let end = new Date(endDate);
		let ret = chunk(start, end, chunks);
		return ret.map(function(dateRange) {
			return {
				'start': dateformat(dateRange.start, "yyyy-mm-dd"),
				'end': dateformat(dateRange.end, "yyyy-mm-dd")
			};
		});
	},
	"isHidden": function(el) {
		return (el.offsetParent === null);
	},
	"autoScroll": function(page) {
		return page.evaluate(function() {
			return new Promise(function(resolve, reject) {
				let isInViewport = function (el) {
					let bounding = el.getBoundingClientRect();
					return (
						bounding.top >= 0 &&
						bounding.left >= 0 &&
						bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
						bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
					);
				};
				let totalHeight = 0;
				let distance = 2000;
				let timer = setInterval(function() {
					let scrollHeight = document.body.scrollHeight;

					window.scrollBy(0, distance);
					totalHeight += distance;

					// 검색 결과가 없거나 맨 마지막까지 스크롤 했을 때, 위로 가기가 보이면 0.6초 후 다시 체크
					if (document.querySelector('.SearchEmptyTimeline-emptyDescription')) {
						clearInterval(timer);
						resolve();
					} else if (totalHeight >= scrollHeight && isInViewport(document.querySelector('.back-to-top'))) {
						let waitTimer = setTimeout(function () {
							if (isInViewport(document.querySelector('.back-to-top'))) {
								clearTimeout(waitTimer);
								clearInterval(timer);
								resolve();
							}
						}, 550);
					}
				}, 50);
			});
		});
	}
};