const nodeExcel = require('excel-export');

module.exports = {
	"toXLSX": function(json, config) {
		let conf = prepareJson(json, config);
		let result = nodeExcel.execute(conf);

		return result;

		function getType(obj, type) {
			if (type) {
				return type;
			}
			var t = typeof obj;
			switch (t) {
				case 'string':
				case 'number':
					return t;
				case 'boolean':
					return 'bool';
				default:
					return 'string';
			}
		}

		function getByString(object, path) {
			path = path.replace(/\[(\w+)\]/g, '.$1');
			path = path.replace(/^\./, '');
			var a = path.split('.');
			while (a.length) {
				var n = a.shift();
				if (n in object) {
					object = (object[n]==undefined) ? null : object[n];
				} else {
					return null;
				}
			}
			return object;
		}

		function prepareJson(json, config) {
			var res = {};
			var conf = config || {};
			var jsonArr = [].concat(json);
			var fields = conf.fields || Object.keys(jsonArr[0] || {});
			var types = [];
			if (!(fields instanceof Array)) {
				types = Object.keys(fields).map(function(key) {
					return fields[key];
				});
				fields = Object.keys(fields);
			}

			res.cols = fields.map(function(key, i) {
				return {
					caption: conf.fieldsName[i] || key,
					type: getType(jsonArr[0][key], types[i]),
					beforeCellWrite: function(row, cellData, eOpt){
						eOpt.cellType = getType(cellData, types[i]);
						return cellData;
					}
				};
			});

			res.rows = jsonArr.map(function(row) {
				return fields.map(function(key) {
					var value = getByString(row, key);
					if(value && value.constructor == Object) value = JSON.stringify(value);
					if (typeof value === 'string') {
						value = value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g,'');
					}
					return value;
				});
			});
			return res;
		};
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