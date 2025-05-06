import { Body, Controller, Delete, Get, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Redirect, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { RecordService } from "./record.service";
import { EmployeeService } from "src/employees/employee.service";
import { CreateRecordDTO } from "./dto/create-record.dto";
import { DeleteRecordDTO } from "./dto/delete-record.dto";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";
import { UUID } from "crypto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "./excel-validator.pipe";
import { FlashError } from "src/flash-error";
import { UpdateReasonDTO } from "./dto/update-reason.dto";
import { CreateOneReasonDTO } from "./dto/create-one-reason.dto";

@Controller('records')
export class RecordController {
	constructor(
		private recordService: RecordService,
		private employeeService: EmployeeService
	) { }

	@Post('reason')
	@UseGuards(AuthenticatedGuard)
	async createOneReason(
		@Body() createReasonDTO: CreateOneReasonDTO,
		@Res() res,
		@Req() req
	) {

		await this.recordService.createOneReason(createReasonDTO)
		req.flash('success', `Tạo giải trinh thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect(`/employees/${createReasonDTO.employeeID}`)
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Get('all')
	async getAll() {
		const records = await this.recordService.getAll()
		return records
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Get('import')
	@Render('records/import')
	@UseInterceptors(StoreReturnToInterceptor)
	getImportForm() {
		return { currentYear: new Date().getFullYear() }
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Post('import')
	@UseInterceptors(FileInterceptor('formFile'))
	@Redirect('/records/day')
	async importFormFile(
		@UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
		@Body('year', ParseIntPipe) year: number,
		@Req() req
	) {
		const [addedCount, updatedCount] = await this.recordService.XLXSToDatabase(file, year)
		req.flash('success', `Nhập mới ${addedCount}, cập nhật ${updatedCount} chấm công từ file ${file.originalname}`)
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Post('checkout')
	async checkoutEmployeeNow(
		@Query('employeeID', ParseUUIDPipe) employeeID: UUID,
		@Query('date') date: string,
		@Req() req,
		@Res() res,

	) {
		await this.recordService.checkoutEmployee(employeeID, date)
		req.flash('success', `Checkout thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Post('checkin')
	async checkinEmployeeNow(
		@Query('employeeID', ParseUUIDPipe) employeeID: UUID,
		@Query('date') date: string,
		@Req() req,
		@Res() res,

	) {
		await this.recordService.checkinEmployee(employeeID, date)
		req.flash('success', `Checkin thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}

	@Get('day')
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('records/day')
	async getChamCongPage(
		@Query('date') date: string | undefined,
		@Query('employeeName') employeeName: string | undefined,
		@Query('filter') filter: string | undefined,
		@Query('filter2') filter2: string | undefined
	) {

		const todayDate = new Date(Date.now()).toISOString().split('T')[0];
		if (!date || date === '') {
			date = todayDate
		}
		const isToday = todayDate === date

		const employeeWithRecordList = await this.employeeService.getEmployeeWithRecords(date, employeeName)
		let lNum = 0, eNum = 0, bNum = 0
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

	@Get()
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Render('records/index')
	async getIndex(
		@Query('employeeID') employeeID: string,
		@Query('day') day: string,
		@Query('month') month: string,
		@Query('year') year: string,
	) {
		const employees = await this.employeeService.getAll();
		const renderEmployees = employees.map((e) => {
			const { name, id } = e.dataValues
			return { name, id }
		})

		const records = await this.recordService.filter(employeeID, day, month, year)
		const renderRecords = records.map((r) => {
			const { reason, date, employee, employeeID, startTime, endTime, isAtWorkLate, isLeaveEarly } = r.dataValues
			const { id, name } = employee.dataValues
			return {
				reason,
				date,
				startTime,
				endTime,
				employeeID,
				isAtWorkLate,
				isLeaveEarly,
				employee: { id, name },
			}
		})
		return {
			employees: renderEmployees,
			records: renderRecords,
			selectedDay: day,
			selectedMonth: month,
			selectedYear: year,
			selectedEmployeeID: employeeID
		}
	}

	@UseGuards(AuthenticatedGuard)
	@Get('new')
	@Render('records/new')
	// @UseInterceptors(StoreReturnToInterceptor)
	async getNewForm(
		@Query('date') date: string | undefined,
		@Query('employeeID') employeeID: string | undefined,
		@Req() req
	) {
		const isChecker = req.user.role === 'checker'
		const employees = await this.employeeService.getAll()
		return { date, employees, employeeID, isChecker }
	}

	@UseGuards(AuthenticatedGuard)
	@Get('edit')
	// @UseInterceptors(StoreReturnToInterceptor)
	@Render('records/edit')
	async getEditForm(
		@Query() getEditFormDTO,
		@Req() req
	) {
		const date = getEditFormDTO.date
		const employeeID = getEditFormDTO.employeeID
		const record = await this.recordService.findOne(date, employeeID)
		const { startTime, endTime, reason } = record.dataValues
		const isChecker = req.user.role === 'checker'
		return { isChecker, reason, date, employeeID, startTime, endTime, name: record.dataValues.employee.dataValues.name }
	}

	@Post()
	@UseGuards(AuthenticatedGuard)
	async createRecord(
		@Req() req,
		@Res() res,
		@Body() createRecordDTO: CreateRecordDTO,
	) {
		await this.recordService.createOne(createRecordDTO)
		req.flash('success', `Chấm công thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Delete()
	async deleteRecord(
		@Req() req,
		@Res() res,
		// @Body() deleleRecordDTO: DeleteRecordDTO) {
		@Query() deleleRecordDTO: DeleteRecordDTO) {
		await this.recordService.deleteOne(deleleRecordDTO)
		req.flash('success', `Xóa chấm công thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Put()
	async updateRecord(
		@Req() req,
		@Res() res,
		@Body() updateRecordDTO: CreateRecordDTO
	) {
		await this.recordService.updateOne(updateRecordDTO)
		req.flash('success', `Cập nhật chấm công thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}

	@UseGuards(AuthenticatedGuard)
	@Put('reason')
	async updateReasonOfRecord(
		@Req() req,
		@Res() res,
		@Query('employeeID', ParseUUIDPipe) employeeID: UUID,
		@Query('date') date: string | undefined,
		@Body() updateReasonDTO: UpdateReasonDTO
	) {

		if (!date || date === '' || ! /^\d{4}-\d{2}-\d{2}$/.test(date)) {
			throw new FlashError('date is not valid')
		}
		await this.recordService.updateOneReason(employeeID, date, updateReasonDTO)

		req.flash('success', `Cập nhật giải trình thành công`)
		const redirectUrl = req?.session?.returnTo
		if (redirectUrl) {
			return res.redirect(redirectUrl)
		}
		return res.redirect('/records/day')
	}
}
