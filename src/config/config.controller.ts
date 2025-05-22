import { Body, Controller, Get, Post, Put, Render, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { ConfigService } from "./config.service";
import { UpdateConfigDTO } from "./update-config.dto";
import { StoreReturnToInterceptor } from "src/store-return-to.interceptor";
import { StoreReturnToOnErrorInterceptor } from "src/store-return-to-on-error.interceptor";

@Controller('config')
@UseGuards(AuthenticatedGuard, CheckerGuard)
export class ConfigController {
	constructor(
		private configService: ConfigService
	) { }

	@Get()
	@UseInterceptors(StoreReturnToInterceptor, StoreReturnToOnErrorInterceptor)
	@Render('config')
	getConfigPage() {
		return { ...this.configService.config }
	}

	@Post()
	updateConfig(
		@Body() updateConfigDTO: UpdateConfigDTO,
		@Req() req,
		@Res() res
	) {
		this.configService.updateConfig(updateConfigDTO)
		req.flash('success', 'Cập nhật cài đặt thành công')
		return res.redirect(req?.session?.returnTo ?? `/config`)
	}

}