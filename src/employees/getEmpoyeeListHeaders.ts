export function getEmpoyeeListHeaders() {
	return [
		{ title: '#', classStr: '', type: 'index' },
		{ title: 'Tên', classStr: 'sort', type: 'name' },
		{ title: 'Email', classStr: 'sort', type: 'email' },
		{ title: 'SĐT', classStr: 'sort', type: 'phone' },
		{ title: 'Giờ đi làm', classStr: 'sort', type: 'startWorkTime' },
		{ title: 'Giờ tan làm', classStr: 'sort', type: 'endWorkTime' },
	]
}