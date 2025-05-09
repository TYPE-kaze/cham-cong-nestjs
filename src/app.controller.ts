import { Controller, Get, Redirect, Render, Req, Res, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "./auth/authenticated.guard";

@Controller()
export class AppController {
	constructor() { }
	@Get()
	@UseGuards(AuthenticatedGuard)
	@Render('index')
	index() { }

	@Get('back')
	returnToPreviousPage(
		@Req() req,
		@Res() res
	) {
		if (!req.session) {
			throw new Error('Has no session')
		}

		if (!req.session.returnTo || req.session.returnTo.length === 0) {
			throw new Error('returnTo stack is empty')
		}

		// TODO: infinity undo/returnTo of any depth
		// Block: browser native back button cant be detected (yet) to pop from returnTo stack
	}
}