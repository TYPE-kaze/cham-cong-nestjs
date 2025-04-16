import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Redirect, Render, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDTO } from "./dto/create-employee.dto";
import { UUID } from "node:crypto";
import { Request, Response } from "express";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";
import { ChangePassWDDTO } from "./dto/change-passwd.dto";

@Controller('employees')
@UseGuards(AuthenticatedGuard)
export class EmployeeController {
	constructor(private employeeService: EmployeeService) { }
	@Get()
	@UseGuards(CheckerGuard)
	@Render('employees/index')
	async getIndex() {
		const employees = await this.employeeService.getAll()
		return { employees }
	}

	@Get('new')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('employees/new')
	async getNewForm() { }

	@Get(':id')
	@Render('employees/show')
	async showOne(@Param('id', ParseUUIDPipe) id: UUID) {
		return { employee: (await this.employeeService.getOneWithRecords(id)) }
	}

	@Get('edit/:id')
	@UseGuards(CheckerGuard)
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('employees/edit')
	async getEditForm(@Param('id', ParseUUIDPipe) id: UUID) {
		return { employee: await this.employeeService.findOne(id) }
	}

	@Get('editpasswd/:id')
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('employees/editpasswd')
	async getEditPassWDForm(@Param('id', ParseUUIDPipe) id: UUID) {
		const employee = await this.employeeService.findOne(id)
		return { employee: { id: employee.dataValues.id } }
	}

	@Put(':id/password')
	async employeeChangePassWD(
		@Req() req,
		@Res() res: Response,
		@Param('id', ParseUUIDPipe) id: UUID,
		@Body() body: ChangePassWDDTO
		// @Body('passwordOld') oldP: string,
		// @Body('password') newP: string,
	) {
		console.log(req.session)
		const { password, passwordOld } = body
		try {
			await this.employeeService.changePassWD(id, passwordOld, password)
			req.flash('suceess', 'Đổi mật khẩu thành công')
			return res.redirect(`/employees/${id}`)
		} catch (error) {
			req.flash('error', error.message)
			return res.redirect(req.session.returnTo)
		}
	}

	@Post()
	@UseGuards(CheckerGuard)
	@Redirect('/employees')
	async createOne(@Body() createEmployeeDTO: CreateEmployeeDTO, @Req() req: Request) {
		try {
			const employee = await this.employeeService.createOne(createEmployeeDTO)
			req.flash('success', `Thêm nhân viên ${employee.dataValues.name} thành công`)
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

	@Put(':id')
	@UseGuards(CheckerGuard)
	@Redirect('/employees')
	async updateOne(@Param('id', ParseUUIDPipe) id: UUID, @Body() updateEmployeeDTO: CreateEmployeeDTO, @Req() req: Request) {
		try {
			const employee = await this.employeeService.updateOne(id, updateEmployeeDTO)
			req.flash('success', `Sửa thông tin nhân viên ${employee.dataValues.name} thành công`)
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

	@Delete(':id')
	@UseGuards(CheckerGuard)
	@Redirect('/employees')
	async deleteOne(@Param('id', ParseUUIDPipe) id: UUID, @Req() req: Request) {
		try {
			await this.employeeService.deleteOne(id)
			req.flash('success', `Xóa thông tin nhân viên thành công`)
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