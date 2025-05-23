import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Redirect, Render, Req, Res, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";
import { Request, Response } from "express";

@Controller()
export class AuthController {
	@Post('login')
	@UseGuards(LocalAuthGuard)
	onSucessAuth(@Req() req, @Res() res: Response) {
		req.flash('success', 'Đăng nhập thành công')
		let defaultRoute
		if (req?.user?.role === 'checker') {
			defaultRoute = '/stats/month'
		}
		else if (req?.user?.role === 'employee') {
			defaultRoute = `/employees/${req.user.user.id}`
		}
		return res.redirect(req?.session?.returnTo ?? req?.session?.returnToOnError ?? defaultRoute)
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
}