/**
 * Vietnamese translation for bootstrap-datepicker
 * An Vo <https://github.com/anvoz/>
 */
; (function ($) {
	$.fn.datepicker.dates['vi'] = {
		days: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
		daysShort: ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
		daysMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
		months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
		monthsShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
		today: "Hôm nay",
		clear: "Xóa",
		format: "dd/mm/yyyy"
	};
}(jQuery));

$(document).ready(function () {
	$('.month-picker').datepicker({
		format: "mm-yyyy",
		startView: "months",
		minViewMode: "months",
		// format: 'mm',
		// viewMode: 'months',
		// minViewMode: 'months',
		language: 'vi',
		endDate: new Date()
	});

	$(".year-picker").datepicker({
		format: "yyyy",
		viewMode: "years",
		startView: "years",
		minViewMode: "years",
		language: 'vi',
		endDate: new Date(),
		startDate: new Date(2000, 0, 1)
	});
});

// enable app tooltips on the page
const tooltipTriggerList = document.querySelectorAll('.has-tooltip')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))