import { Controller, Get, Redirect, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "./auth/authenticated.guard";

@Controller()
export class AppController {
	constructor() { }
	@Get()
	@UseGuards(AuthenticatedGuard)
	@Redirect('/stats/month')
	homepage() { }
}