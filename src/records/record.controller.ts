import { Body, Controller, Delete, Get, ParseIntPipe, Post, Put, Query, Redirect, Render, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { RecordService } from "./record.service";
import { EmployeeService } from "src/employees/employee.service";
import { CreateRecordDTO } from "./dto/create-record.dto";
import { DeleteRecordDTO } from "./dto/delete-record.dto";
import { Request } from "express";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { literal, Op } from "sequelize";
import { CheckerGuard } from "src/auth/checker.guard";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";

@Controller('records')
@UseGuards(AuthenticatedGuard, CheckerGuard)
export class RecordController {
	constructor(private recordService: RecordService, private employeeService: EmployeeService) { }
	@Get('all')
	async getAll() {
		const records = await this.recordService.getAll()
		return records
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
			const { date, time, employee, employeeID } = r.dataValues
			const { id, name } = employee.dataValues
			return {
				date,
				time,
				employeeID,
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
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('records/edit')
	async getEditForm(@Query() getEditFormDTO) {
		const date = getEditFormDTO.date
		const employeeID = getEditFormDTO.employeeID
		const record = await this.recordService.findOne(date, employeeID)
		return { date, employeeID, time: record.dataValues.time, name: record.dataValues.employee.dataValues.name }
	}

	@Post()
	@Redirect('/records/new')
	async createRecord(@Req() req: Request, @Body() createRecordDTO: CreateRecordDTO) {
		try {
			const employeeID = createRecordDTO.employeeID
			const employee = await this.employeeService.findOne(employeeID)
			const time = createRecordDTO.time
			const date = createRecordDTO.date
			const record = await this.recordService.createOne(date, employee.dataValues.id, time)
			req.flash('success', `Thêm chấm công nhân viên ${employee.dataValues.name}`)
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
	@Redirect('/records')
	async deleteRecord(@Req() req: Request, @Body() deleleRecordDTO: DeleteRecordDTO) {
		try {
			const date = deleleRecordDTO.date
			const employeeID = deleleRecordDTO.employeeID
			await this.recordService.deleteOne(date, employeeID)
			req.flash('success', `Xóa chấm công thành công`)
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
	@Redirect('/records')
	async updateRecord(@Req() req: Request, @Body() updateRecordDTO: CreateRecordDTO) {
		try {
			const date = updateRecordDTO.date
			const employeeID = updateRecordDTO.employeeID
			const time = updateRecordDTO.time
			const record = await this.recordService.updateOne(date, employeeID, time)
			req.flash('success', `Cập nhật chấm công thành công`)
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
