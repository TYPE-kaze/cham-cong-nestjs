export function getEmpoyeeListHeaders() {
	return [
		{ title: '#', classStr: '', type: 'index' },
		{ title: 'Tên', classStr: 'sort', type: 'name' },
		{ title: 'Email', classStr: 'sort', type: 'email' },
		{ title: 'SĐT', classStr: 'sort', type: 'phone' },
		{ title: 'Ca làm', classStr: 'sort', type: 'shift' },
	]
}