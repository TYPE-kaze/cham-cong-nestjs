import { UUID } from "node:crypto";
import { Record } from "src/records/record.model";

export function renderYearCalendar(year: number, records: Record[], employeeID: UUID) {
	const calendar = {
		year,
		months: [] as any[]
	};

	let isFuture = false
	let r_count = 0
	for (let month = 0; month < 12; month++) {
		const date = new Date(year, month, 1, 0, 0, 0);
		const monthName = date.toLocaleString('vi-VN', { month: 'long' });
		const monthObj = {
			monthNo: String(date.getMonth() + 1).padStart(2, '0'),
			monthName,
			firstDayOffset: 0,
			days: [] as any[]
		}

		while (date.getMonth() === month) {
			isFuture = date.getTime() > new Date().getTime()
			const yyyy = date.getFullYear();
			const mm = monthObj.monthNo
			const dd = String(date.getDate()).padStart(2, '0');
			const dateStr = `${yyyy}-${mm}-${dd}`
			const dayOfWeek = date.getDay()

			if (date.getDate() === 1) {
				// Sunday = 0, and so on
				if (dayOfWeek === 0) {
					monthObj.firstDayOffset = 7
				}
				else {
					monthObj.firstDayOffset = dayOfWeek;
				}
			}

			let record: Record | undefined, recordLink: string | undefined
			let classStr
			if (isFuture) {
				classStr = 'disabled'
			}
			else {
				if (records.length > 0 && r_count < records.length && records[r_count].date === dateStr) {
					recordLink = `/records/edit?date=${dateStr}&employeeID=${employeeID}`
					record = records[r_count]
					r_count++
				} else {
					record = new Record({ date: dateStr, employeeID })
					recordLink = `/records/new?date=${dateStr}&employeeID=${employeeID}`
				}
				classStr = 'has-tooltip' + ' ' + `s_${record.status}`
			}

			monthObj.days.push({
				dateStr,
				dayNo: date.getDate(),
				record,
				classStr,
				recordLink,
				tooltip: record?.statusText ?? ''
			});
			date.setDate(date.getDate() + 1);
		}
		calendar.months.push(monthObj)
	}
	return calendar;
}