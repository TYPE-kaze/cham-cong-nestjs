import { Module } from "@nestjs/common";
import { StatisticController } from "./statistic.controller";
import { StatisticService } from "./statistic.service";
import { EmployeeModule } from "src/employees/employee.module";
import { RecordModule } from "src/records/record.module";
import { WorktimeRuleModule } from "src/worktime-rules/wtr.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { MonthStat } from "./month-stat.model";

@Module({
	imports: [SequelizeModule.forFeature([MonthStat]), EmployeeModule, RecordModule, WorktimeRuleModule],
	controllers: [StatisticController],
	providers: [StatisticService],
	exports: []
})
export class StatisticModule { }