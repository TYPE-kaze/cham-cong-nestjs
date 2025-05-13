import { Body, Controller, Delete, Get, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Redirect, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { RecordService } from "./record.service";
import { EmployeeService } from "src/employees/employee.service";
import { CreateRecordDTO } from "./dto/create-record.dto";
import { DeleteRecordDTO } from "./dto/delete-record.dto";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { UUID } from "crypto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "./excel-validator.pipe";
import { FlashError } from "src/flash-error";
import { UpdateReasonDTO } from "./dto/update-one-reason.dto";
import { CreateOneReasonDTO } from "./dto/create-one-reason.dto";
import { StoreReturnToInterceptor } from "src/store-return-to.interceptor";
import { renderDay } from "./renders/day";
import { StoreReturnToOnErrorInterceptor } from "src/store-return-to-on-error.interceptor";
import { StoreBaseUrlToReturnToInterceptor } from "src/store-url-to-return-to.interceptor";

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
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Get('import')
	@Render('records/import')
	getImportForm() {
		return { currentYear: new Date().getFullYear() }
	}

	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@Post('import')
	@UseInterceptors(FileInterceptor('formFile'))
	async importFormFile(
		@UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
		@Body('year', ParseIntPipe) year: number,
		@Req() req,
		@Res() res,
	) {
		const [addedCount, updatedCount] = await this.recordService.XLXSToDatabase(file, year)
		req.flash('success', `Nhập mới ${addedCount}, cập nhật ${updatedCount} chấm công từ file ${file.originalname}`)
		return res.redirect(req?.session?.returnTo ?? '/records/day')
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
		return res.redirect(req?.session?.returnTo ?? '/records/day')
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
		return res.redirect(req?.session?.returnTo ?? '/records/day')
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
		const employeeWithRecordList = await this.employeeService.getEmployeeWithRecords(date, employeeName)
		return renderDay(todayDate, date, employeeWithRecordList, filter, filter2, employeeName)
	}

	@Get()
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	@UseInterceptors(StoreBaseUrlToReturnToInterceptor)
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
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Get('new')
	@Render('records/new')
	async getNewForm(
		@Query('date') date: string | undefined,
		@Query('employeeID') employeeID: string | undefined,
		@Req() req
	) {
		const isChecker = req.user.role === 'checker'
		const employees = await this.employeeService.getAll()
		return { date, employees, employeeID, isChecker, returnTo: req.session.returnTo }
	}

	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Get('edit')
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
		const returnTo = req.session.returnTo
		return { returnTo, isChecker, reason, date, employeeID, startTime, endTime, name: record.dataValues.employee.dataValues.name }
	}

	@Post()
	@UseGuards(AuthenticatedGuard, CheckerGuard)
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
