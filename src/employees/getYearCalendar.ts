import { UUID } from "node:crypto";
import { Record } from "src/records/record.model";

export function renderYearCalendar(year: number, records: Record[], employeeID: UUID) {
	const calendar = {
		year,
		months: [] as any[]
	};
	let recordC = 0

	for (let month = 0; month < 12; month++) {
		const date = new Date(year, month, 1, 0, 0, 0);
		const isFuture = date > new Date()
		const monthName = date.toLocaleString('vi-VN', { month: 'long' });
		const monthObj = {
			monthNo: String(date.getMonth() + 1).padStart(2, '0'),
			monthName,
			firstDayOffset: 0,
			days: [] as any[]
		}

		while (date.getMonth() === month) {
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

			// process records to style calendar
			let classStr = ''
			let isHasRecord = false
			let recordLink
			if (!isFuture) {
				if ( // has a record
					recordC < records.length
					&& new Date(dateStr).getTime() === new Date(records[recordC].date).getTime()
				) {
					isHasRecord = true
					const { isAtWorkLate, isLeaveEarly, startTime, endTime } = records[recordC]
					recordLink = `/records/edit?date=${dateStr}&employeeID=${employeeID}`

					if (isAtWorkLate && isLeaveEarly) {
						classStr = classStr + 'bg-danger bg-opacity-75'
					} else if (isAtWorkLate) {
						classStr = classStr + 'bg-warning bg-opacity-50'
					} else if (isLeaveEarly) {
						classStr = classStr + 'bg-danger bg-opacity-50'
					} else if (
						dayOfWeek !== 0 && dayOfWeek !== 6
						&& startTime
					) {
						classStr = classStr + 'bg-success bg-opacity-50'
					}
					recordC++
				} else { // not has record
					recordLink = `/records/new?date=${dateStr}&employeeID=${employeeID}`
				}
				if (month == 8) {
					console.log(dateStr + ', ' + dayOfWeek)
				}

				if (classStr === '' && (dayOfWeek !== 0 && dayOfWeek !== 6)) {
					classStr = classStr + 'bg-secondary bg-opacity-50'
				}

			} else { // date is in future
				classStr = classStr + 'disabled'
			}

			monthObj.days.push({
				dateStr,
				dayNo: date.getDate(),
				classStr: classStr,
				recordLink

			});
			date.setDate(date.getDate() + 1);
		}
		calendar.months.push(monthObj)
	}
	return calendar;
}