import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Redirect, Render, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDTO } from "./dto/create-employee.dto";
import { UUID } from "node:crypto";
import { Request, Response } from "express";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { ChangePasswordDTO } from "./dto/change-password.dto";
import { renderYearCalendar } from "src/employees/getYearCalendar";
import { StoreReturnToInterceptor } from "src/store-return-to.interceptor";
import { StoreReturnToOnErrorInterceptor } from "src/store-return-to-on-error.interceptor";
import { SameEmployeeGuard } from "src/auth/same-employee.guard";
import { GetIndexQueryDTO } from "./dto/get-index-query.dto";
import { StoreBaseUrlToReturnToInterceptor } from "src/store-url-to-return-to.interceptor";
import { getEmpoyeeListHeaders } from "./getEmpoyeeListHeaders";
import { workShifts } from "src/constants/work-shift";
import { ShowRecordsDTO } from "./dto/show-records.dto";
import { showRecordsHeaders } from "src/employees/constants/show-records-table-headers.const";
import { StoreBaseUrlToReturnToOnErrorInterceptor } from "src/store-base-url-to-return-to-on-error.interceptor";
import { ShowHeatMapDTO } from "./dto/show-heat-map.dto";

@Controller('employees')
@UseGuards(AuthenticatedGuard)
export class EmployeeController {
	constructor(private employeeService: EmployeeService) { }
	@Get()
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreBaseUrlToReturnToOnErrorInterceptor, StoreReturnToInterceptor)
	@Render('employees/index')
	async getIndex(
		@Query() getIndexQueryDTO: GetIndexQueryDTO
	) {
		const { query, sort, order } = getIndexQueryDTO
		const numOfRowPerPage = getIndexQueryDTO.numOfRowPerPage
			? parseInt(getIndexQueryDTO.numOfRowPerPage)
			: 30
		const pageNo = getIndexQueryDTO.pageNo
			? parseInt(getIndexQueryDTO.pageNo)
			: 1

		const { rows: employees, count } = await this.employeeService.getEmployeeForIndexPage(getIndexQueryDTO)
		const headers = getEmpoyeeListHeaders()
		const defaultOrder = 'ASC'
		return { employees, query, defaultOrder, sort, order, headers, numOfRowPerPage, count, pageNo, workShifts }
	}

	@Get('new')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Render('employees/new')
	async getNewForm() {
		return { workShifts }
	}

	@Get(':id/heat-map')
	@UseInterceptors(StoreBaseUrlToReturnToOnErrorInterceptor, StoreReturnToInterceptor)
	@Render('employees/show')
	async showEmployeeHeatMapTab(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Query() showHeatMapDTO: ShowHeatMapDTO
	) {
		const now = new Date()
		const currentYear = now.getFullYear()
		const currentMonth = now.getMonth() + 1
		let yearNum = currentYear
		const { year, r_filter, r_monthYear, r_order, r_sort } = showHeatMapDTO
		if (year && year !== '') {
			yearNum = parseInt(year)
		}
		const employee = await this.employeeService.getOneWithRecords(id, yearNum)
		const calendar = renderYearCalendar(yearNum, employee.records, id)
		return {
			tab: 'heat-map',
			employee,
			calendar,
			year: yearNum,
			id,
			currentYear,
			currentMonth,
			r_filter: r_filter ?? '0',
			r_monthYear: r_monthYear ?? '',
			r_order: r_order ?? 'ASC',
			r_sort: r_sort ?? 'date'
		}
	}

	@Get(':id/records')
	@UseInterceptors(StoreBaseUrlToReturnToOnErrorInterceptor, StoreReturnToInterceptor)
	@Render('employees/show')
	async showEmployeeRecordTab(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Query() showRecordsDTO: ShowRecordsDTO
	) {
		const { monthYear, order, sort, filter, h_year } = showRecordsDTO
		const now = new Date()
		const curMonth = now.getMonth() + 1
		const curYear = now.getFullYear()
		let month: number, year: number
		if (monthYear) {
			[month, year] = monthYear.split('-').map((e) => parseInt(e))
		} else {
			month = curMonth
			year = curYear
		}
		const [employee, stat] = await this.employeeService.getOneWithRecordsInOneMonth(id, month, year, sort, order, filter)
		const defaultOrder = 'ASC'
		return {
			tab: 'records', employee, month, year, curMonth, curYear, headers: showRecordsHeaders,
			h_year: h_year ?? String(curYear),
			order: order ?? defaultOrder,
			sort: sort ?? 'date',
			defaultOrder,
			filter: filter ?? '0',
			stat
		}
	}

	@Get(':id')
	showOne(
		@Res() res: Response,
		@Param('id', ParseUUIDPipe) id: UUID
	) {
		res.redirect(`/employees/${id}/records`)
	}

	@Get('edit/:id')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Render('employees/edit')
	async getEditForm(@Param('id', ParseUUIDPipe) id: UUID) {
		const employee = await this.employeeService.findOne(id)
		return { employee, workShifts }
	}

	@Get('password/:id')
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Render('employees/edit-password')
	async getEditPasswordForm(@Param('id', ParseUUIDPipe) id: UUID) {
		const employee = await this.employeeService.findOne(id)
		return { employee: { id: employee.dataValues.id } }
	}

	@Put(':id/password')
	@UseGuards(AuthenticatedGuard, SameEmployeeGuard)
	async employeeChangePassword(
		@Req() req,
		@Res() res: Response,
		@Param('id', ParseUUIDPipe) id: UUID,
		@Body() body: ChangePasswordDTO
	) {
		const { password, passwordOld } = body
		await this.employeeService.changePassword(id, passwordOld, password)
		req.flash('suceess', 'Đổi mật khẩu thành công')
		return res.redirect(req?.session?.returnTo ?? `/employees/${id}`)
	}

	@Post()
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	async createOne(
		@Body() createEmployeeDTO: CreateEmployeeDTO,
		@Req() req,
		@Res() res
	) {
		const employee = await this.employeeService.createOne(createEmployeeDTO)
		req.flash('success', `Thêm nhân viên ${employee.name} thành công`)
		// return res.redirect(`/employees/${employee.id}`)
		return res.redirect(req?.session?.returnTo ?? `/employees/${employee.id}`)
	}

	@Put(':id')
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	async updateOne(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Body() updateEmployeeDTO: CreateEmployeeDTO,
		@Req() req,
		@Res() res
	) {
		const employee = await this.employeeService.updateOne(id, updateEmployeeDTO)
		req.flash('success', `Sửa thông tin nhân viên ${employee.name} thành công`)
		return res.redirect(req?.session?.returnTo ?? `/employees/${employee.id}`)
	}

	@Delete(':id')
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	async deleteOne(
		@Param('id', ParseUUIDPipe) id: UUID,
		@Req() req,
		@Res() res
	) {
		await this.employeeService.deleteOne(id)
		req.flash('success', `Xóa nhân viên thành công`)
		return res.redirect(req?.session?.returnTo ?? `/employees`)
	}
}