import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { EmployeeModule } from "./employees/employee.module";
import { RecordModule } from "./records/record.module";
import { CheckerModule } from "./checkers/checker.module";
import { AuthModule } from "./auth/auth.module";
import { WorktimeRuleModule } from "./worktime-rules/wtr.module";

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: 'mariadb',
			host: 'localhost',
			port: 10001,
			username: 'root',
			password: 'root',
			database: 'test',
			autoLoadModels: true,
			synchronize: true,
		}),
		EmployeeModule,
		RecordModule,
		CheckerModule,
		AuthModule,
		WorktimeRuleModule
	],
	controllers: [AppController],
})
export class AppModule { }
