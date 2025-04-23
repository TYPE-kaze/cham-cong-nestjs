import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Redirect, Render, Req, Res, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";
import { Request, Response } from "express";
import { CheckerGuard } from "./checker.guard";

@Controller()
export class AuthController {
	@Post('login')
	@UseGuards(LocalAuthGuard)
	onSucessAuth(@Req() req, @Res() res: Response) {
		req.flash('success', 'Đăng nhập thành công')
		if (req?.user?.role === 'checker') {
			return res.redirect('/records/multi-check')
		}
		else if (req?.user?.role === 'employee') {
			return res.redirect(`/employees/${req.user.user.id}`)
		}
		throw new Error('Successful logined but with unknown role')
	}

	@Get('login')
	@Render('auth/login')
	getLoginForm() { }

	@Get('/logout')
	@UseGuards(AuthenticatedGuard)
	@Redirect('/login')
	logout(@Req() req: Request) {
		return new Promise((resolve, reject) => {
			req.logout((err) => resolve(err))
		})
	}

	@Get('checker') // DEBUG
	@UseGuards(AuthenticatedGuard, CheckerGuard)
	testGuard() {
		return 'Hello from checker'
	}
}