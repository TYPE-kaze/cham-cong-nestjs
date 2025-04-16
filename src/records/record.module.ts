import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Record } from "./record.model";
import { RecordController } from "./record.controller";
import { RecordService } from "./record.service";
import { EmployeeModule } from "src/employees/employee.module";

@Module({
	imports: [SequelizeModule.forFeature([Record]), EmployeeModule],
	controllers: [RecordController],
	providers: [RecordService]
})
export class RecordModule { }