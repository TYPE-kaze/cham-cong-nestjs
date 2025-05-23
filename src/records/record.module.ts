import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Record } from "./record.model";
import { RecordController } from "./record.controller";
import { RecordService } from "./record.service";
import { EmployeeModule } from "src/employees/employee.module";
import { WorktimeRuleModule } from "src/worktime-rules/wtr.module";
import { ConfigModule } from "src/config/config.module";

@Module({
	imports: [
		SequelizeModule.forFeature([Record]),
		EmployeeModule,
		WorktimeRuleModule,
		ConfigModule
	],
	controllers: [RecordController],
	providers: [RecordService],
	exports: [RecordService]
})
export class RecordModule { }