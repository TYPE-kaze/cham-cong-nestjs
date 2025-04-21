import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Redirect, Render, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { CheckerGuard } from "src/auth/checker.guard";
import { WorktimeRuleService } from "./wtr.service";
import { NewWorktimeRuleDTO } from "./dto/new-worktime-rule.dto";
import { StoreReturnToInterceptor } from "src/store-returnto.interceptor";

@Controller('worktime-rules')
@UseGuards(AuthenticatedGuard, CheckerGuard)
export class WorktimeRuleController {
	constructor(private worktimeRuleService: WorktimeRuleService) { }

	@Get()
	@Render('worktime-rules/index')
	async getIndex() {
		const rules = await this.worktimeRuleService.getAll()
		// const renderRules = rules.map((r) => {
		// 	const { id, startTime, endTime, deltaMins, fromDate } = r.dataValues
		// 	return {
		// 		id,
		// 		startTime,
		// 		endTime,
		// 		deltaMins,
		// 		fromDate
		// 	}
		// })

		const currentRule = await this.worktimeRuleService.getCurrentAppliedRule()
		return { rules, currentRule }
	}

	@Post()
	@Redirect('/worktime-rules')
	async makeNewWorktimeRule(@Body() newWorkTimeRuleDTO: NewWorktimeRuleDTO) {
		const { fromDate, startTime, endTime, deltaMins } = newWorkTimeRuleDTO
		await this.worktimeRuleService.createOne(fromDate, startTime, endTime, deltaMins)
	}

	@Delete(':id')
	@Redirect('/worktime-rules')
	async deleteOne(@Param('id', ParseIntPipe) id: number) {
		await this.worktimeRuleService.deleteOne(id)
	}

	@Get('new')
	@UseInterceptors(StoreReturnToInterceptor)
	@Render('worktime-rules/new')
	getNewForm() { }
}