import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { WorktimeRule } from "./wtr.model";
import { WorktimeRuleController } from "./wtr.controller";
import { WorktimeRuleService } from "./wtr.service";

@Module({
	imports: [SequelizeModule.forFeature([WorktimeRule])],
	controllers: [WorktimeRuleController],
	providers: [WorktimeRuleService]
})
export class WorktimeRuleModule { }