import { Controller, Get, Redirect, Render, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "./auth/authenticated.guard";

@Controller()
export class AppController {
	constructor() { }
	@Get()
	@UseGuards(AuthenticatedGuard)
	@Render('index')
	index() { }
}