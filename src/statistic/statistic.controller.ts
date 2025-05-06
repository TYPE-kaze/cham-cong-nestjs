import { Controller, Get, ParseDatePipe, Post, Query, Redirect, Render, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { RecordService } from "src/records/record.service";
import { StatisticService } from "./statistic.service";
import { EmployeeService } from "src/employees/employee.service";
import { InjectModel } from "@nestjs/sequelize";
import { MonthStat } from "./month-stat.model";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";

@UseGuards(AuthenticatedGuard, CheckerGuard)
@Controller('stats')
export class StatisticController {
	constructor(
		private recordService: RecordService,
		private statService: StatisticService,
		private employeeService: EmployeeService,
		@InjectModel(MonthStat) private readonly monthStatModel: typeof MonthStat
	) { }
	@Get()
	getIndex() { return 'Hello World' }

	@Get('/date')
	@Render('stats/date')
	async getStatByDate(
		@Query('date') date: string | undefined,
		@Query('employeeID') employeeID: string | undefined,
		@Query('filter') filter: string | undefined,
	) {
		if (!date || date === '') {
			date = new Date(Date.now()).toISOString().split('T')[0];
		}

		const records = await this.recordService.findByDate(date, employeeID, filter)
		let lNum = 0, eNum = 0, bNum = 0
		const renderRecords = records.map((r) => {
			const { employee, startTime, endTime, date, employeeID, isAtWorkLate, isLeaveEarly } = r
			const { id, name } = employee
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
				startTime,
				endTime,
				date,
				employeeID,
				isAtWorkLate,
				isLeaveEarly,
				rowColorClass,
				employee: { id, name }
			}
		})

		const employees = await this.employeeService.getAll()
		return {
			records: renderRecords,
			date,
			employees,
			selectedEmployeeID: employeeID ? employeeID : '',
			selectedFilter: filter ? filter : '',
			lNum,
			eNum,
			bNum
		}
	}

	@Get('month')
	@Render('stats/month')
	@UseInterceptors(StoreReturnToInterceptor)
	async getStatByMonth(
		@Query('monthYear') monthYear: string | undefined,
	) {
		let month: string, year: string
		if (!monthYear || monthYear == '') {
			const now = new Date()
			month = String(now.getMonth() + 1)
			year = String(now.getFullYear())
		}
		else {
			const frags = monthYear.split('-')
			month = frags[0].replace(/^0/, '')
			year = frags[1]
		}

		const list = await this.statService.getStatOfMonth(month, year)
		return { month: month.replace(/^[1-9]$/, '0$&'), year, list }
	}

	@Post('month/update')
	async updateMonthStat(
		@Query('month') month: string | undefined,
		@Query('year') year: string | undefined,
		@Req() req,
		@Res() res
	) {
		const now = new Date()
		if (!month || month == '') {
			month = String(now.getMonth() + 1)
		}

		if (!year || year == '') {
			year = String(now.getFullYear())
		}

		await this.statService.updateMonthStatBaseOnRecord(month, year)
		req.flash('success', `Cập nhật thống kê tháng ${month} năm ${year}`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/stats/month')
	}
}
