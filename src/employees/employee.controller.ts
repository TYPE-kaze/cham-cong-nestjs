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

@Controller('employees')
@UseGuards(AuthenticatedGuard)
export class EmployeeController {
	constructor(private employeeService: EmployeeService) { }
	@Get()
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreBaseUrlToReturnToInterceptor)
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
		return { employees, query, defaultOrder, sort, order, headers, numOfRowPerPage, count, pageNo }
	}

	@Get('new')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Render('employees/new')
	async getNewForm() {
		return { startWorkTime: '08:30', endWorkTime: '17:30' }
	}

	@Get(':id')
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('employees/show')
	async showOne(
		@Req() req,
		@Param('id', ParseUUIDPipe) id: UUID,
		@Query('year') year?: string,
	) {
		const currentYear = new Date().getFullYear()
		let yearNum = currentYear
		if (year && year !== '') {
			yearNum = parseInt(year)
		}
		if (yearNum > currentYear || yearNum < 2000) {
			throw new Error('year is from future')
		}
		const employee = await this.employeeService.getOneWithRecords(id, yearNum)
		const calendar = renderYearCalendar(yearNum, employee.records, id)
		return { returnTo: req.session.returnTo, employee, calendar, year: yearNum, id, currentYear }
	}

	@Get('edit/:id')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToOnErrorInterceptor)
	@Render('employees/edit')
	async getEditForm(@Param('id', ParseUUIDPipe) id: UUID) {
		const employee = await this.employeeService.findOne(id)
		return { employee }
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
		// return res.redirect(req?.session?.returnTo ?? `/employees/${employee.id}`)
		return res.redirect(`/employees/${employee.id}`)
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