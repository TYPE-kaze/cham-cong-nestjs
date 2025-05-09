export function renderDay(todayDate, date, employeeWithRecordList, filter, filter2, employeeName) {
	let lNum = 0, eNum = 0, bNum = 0
	const isToday = todayDate === date
	let renderRecords = employeeWithRecordList.map((e) => {
		let startTime, endTime, isAtWorkLate, isLeaveEarly, reason
		let isNoRecord = true
		if (e.records.length === 1) { // has not yet been checked that day
			const r = e.records[0]
			startTime = r.startTime
			endTime = r.endTime
			isAtWorkLate = r.isAtWorkLate
			isLeaveEarly = r.isLeaveEarly
			isNoRecord = false
			reason = r.reason
		}
		const isCheckin = startTime ? true : false
		const isCheckout = endTime ? true : false

		let rowColorClass = ''
		if (isAtWorkLate && isLeaveEarly) {
			lNum++
			eNum++
			bNum++
			rowColorClass = 'table-danger'
		}
		else if (isAtWorkLate && !isLeaveEarly) {
			lNum++
			rowColorClass = 'table-warning'
		}
		else if (!isAtWorkLate && isLeaveEarly) {
			eNum++
			rowColorClass = 'table-secondary'
		}
		return {
			reason,
			startTime,
			endTime,
			date,
			isAtWorkLate,
			isLeaveEarly,
			rowColorClass,
			employee: e,
			isCheckin,
			isCheckout,
			isNoRecord
		}
	})

	//Filter 1
	switch (filter) {
		case '1':
			renderRecords = renderRecords.filter((r) => !r.isCheckin)
			break;
		case '2':
			renderRecords = renderRecords.filter((r) => r.isCheckin)
			break;
	}

	switch (filter2) {
		case '1':
			renderRecords = renderRecords.filter((r) => r.isAtWorkLate)
			break;
		case '2':
			renderRecords = renderRecords.filter((r) => r.isLeaveEarly)
			break;
		case '3':
			renderRecords = renderRecords.filter((r) => r.isLeaveEarly && r.isAtWorkLate)
			break;
		case '4':
			renderRecords = renderRecords.filter((r) => r.isLeaveEarly || r.isAtWorkLate)
			break;
	}

	return {
		records: renderRecords,
		filter,
		filter2,
		date,
		employeeName,
		lNum,
		eNum,
		bNum,
		isToday
	}
}