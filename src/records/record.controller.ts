import { Body, Controller, Delete, Get, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Redirect, Render, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { RecordService } from "./record.service";
import { EmployeeService } from "src/employees/employee.service";
import { CreateRecordDTO } from "./dto/create-record.dto";
import { DeleteRecordDTO } from "./dto/delete-record.dto";
import { Request } from "express";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";
import { UUID } from "crypto";

@Controller('records')
@UseGuards(AuthenticatedGuard, CheckerGuard)
export class RecordController {
	constructor(
		private recordService: RecordService,
		private employeeService: EmployeeService
	) { }

	@Get('all')
	async getAll() {
		const records = await this.recordService.getAll()
		return records
	}

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
		return res.redirect('/records/multi-check')
	}

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
		return res.redirect('/records/multi-check')
	}

	@Get('multi-check')
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('records/multi-check')
	async getChamCongPage(
		@Query('date') date: string | undefined,
		@Query('employeeName') employeeName: string | undefined,
		@Query('filter') filter: string | undefined,
	) {
		if (!date || date === '') {
			date = new Date(Date.now()).toISOString().split('T')[0];
		}

		const employeeWithRecordList = await this.employeeService.getEmployeeWithRecords(date, employeeName)
		let lNum = 0, eNum = 0, bNum = 0
		let renderRecords = employeeWithRecordList.map((e) => {
			let startTime, endTime, isAtWorkLate, isLeaveEarly
			if (e.records.length === 1) { // has not yet been checked that day
				const r = e.records[0]
				startTime = r.startTime
				endTime = r.endTime
				isAtWorkLate = r.isAtWorkLate
				isLeaveEarly = r.isLeaveEarly
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
				startTime,
				endTime,
				date,
				isAtWorkLate,
				isLeaveEarly,
				rowColorClass,
				employee: e,
				isCheckin,
				isCheckout
			}
		})

		//Filter
		if (filter === '1') {
			renderRecords = renderRecords.filter((r) => !r.isCheckin)
		} else if (filter === '2') {
			renderRecords = renderRecords.filter((r) => r.isCheckin)
		}

		return {
			records: renderRecords,
			filter,
			date,
			employeeName,
			lNum,
			eNum,
			bNum
		}
	}

	@Get()
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
			const { date, employee, employeeID, startTime, endTime, isAtWorkLate, isLeaveEarly } = r.dataValues
			const { id, name } = employee.dataValues
			return {
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

	@Get('new')
	@Render('records/new')
	@UseInterceptors(StoreReturnToInterceptor)
	async getNewForm() {
		const now = new Date();

		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
		const day = String(now.getDate()).padStart(2, '0');
		const date = `${year}-${month}-${day}`;

		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const time = `${hours}:${minutes}:${seconds}`;

		const employees = await this.employeeService.getAll()

		return { date, time, employees }
	}

	@Get('edit')
	// @UseInterceptors(StoreReturnToInterceptor)
	@Render('records/edit')
	async getEditForm(@Query() getEditFormDTO) {
		const date = getEditFormDTO.date
		const employeeID = getEditFormDTO.employeeID
		const record = await this.recordService.findOne(date, employeeID)
		const { startTime, endTime } = record.dataValues
		return { date, employeeID, startTime, endTime, name: record.dataValues.employee.dataValues.name }
	}

	@Post()
	async createRecord(
		@Req() req,
		@Res() res,
		@Body() createRecordDTO: CreateRecordDTO,
	) {
		try {
			const employeeID = createRecordDTO.employeeID
			const employee = await this.employeeService.findOne(employeeID)
			const startTime = createRecordDTO.startTime
			const endTime = createRecordDTO.endTime
			const date = createRecordDTO.date
			const record = await this.recordService.createOne(date, employee.dataValues.id, startTime, endTime)
			req.flash('success', `Checkout thành công`)
			const redirectUrl = req?.session?.returnTo
			if (redirectUrl) {
				return res.redirect(redirectUrl)
			}
			return res.redirect('/records/multi-check')
		}
		catch (error) {
			let msg: string;
			if (error instanceof Error) {
				msg = error.message
			}
			else {
				msg = 'Something wrong happen'
			}
			req.flash('error', msg)
		}
	}

	@Delete()
	async deleteRecord(
		@Req() req,
		@Res() res,
		@Body() deleleRecordDTO: DeleteRecordDTO) {
		try {
			const date = deleleRecordDTO.date
			const employeeID = deleleRecordDTO.employeeID
			await this.recordService.deleteOne(date, employeeID)
			req.flash('success', `Xóa chấm công thành công`)
			const redirectUrl = req?.session?.returnTo
			if (redirectUrl) {
				return res.redirect(redirectUrl)
			}
			return res.redirect('/records/multi-check')
		}
		catch (error) {
			let msg: string;
			if (error instanceof Error) {
				msg = error.message
			}
			else {
				msg = 'Something wrong happen'
			}
			req.flash('error', msg)
		}
	}

	@Put()
	async updateRecord(
		@Req() req,
		@Res() res,
		@Body() updateRecordDTO: CreateRecordDTO
	) {
		try {
			const date = updateRecordDTO.date
			const employeeID = updateRecordDTO.employeeID
			const startTime = updateRecordDTO.startTime
			const endTime = updateRecordDTO.endTime
			const record = await this.recordService.updateOne(date, employeeID, startTime, endTime)
			req.flash('success', `Cập nhật chấm công thành công`)
			const redirectUrl = req?.session?.returnTo
			if (redirectUrl) {
				return res.redirect(redirectUrl)
			}
			return res.redirect('/records/multi-check')
		}
		catch (error) {
			let msg: string;
			if (error instanceof Error) {
				msg = error.message
			}
			else {
				msg = 'Something wrong happen'
			}
			req.flash('error', msg)
		}

	}
}
