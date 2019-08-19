import chunk from 'chunk-date-range'
import dateformat from 'dateformat'

const splitDateRange = function(startDate, endDate, chunks) {
	let start = new Date(startDate)
	let end = new Date(endDate)
	let ret = chunk(start, end, chunks)
	return ret.map((dateRange) => {
		return {
			'start': dateformat(dateRange.start, "yyyy-mm-dd"),
			'end': dateformat(dateRange.end, "yyyy-mm-dd")
		}
	})
}

export { splitDateRange, dateformat }