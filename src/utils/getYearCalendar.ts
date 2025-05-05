export function getYearCalendar(year: number): { [key: string]: string[] } {
	const calendar = {};

	for (let month = 0; month < 12; month++) {
		const date = new Date(year, month, 1);
		const monthName = date.toLocaleString('vi-VN', { month: 'long' }); // 🇻🇳 Vietnamese
		const days: string[] = [];

		while (date.getMonth() === month) {
			const yyyy = date.getFullYear();
			const mm = String(date.getMonth() + 1).padStart(2, '0');
			const dd = String(date.getDate()).padStart(2, '0');
			days.push(`${yyyy}-${mm}-${dd}`);
			date.setDate(date.getDate() + 1);
		}

		calendar[monthName] = days;
	}

	return calendar;
}