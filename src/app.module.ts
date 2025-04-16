import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { EmployeeModule } from "./employees/employee.module";
import { APP_FILTER } from "@nestjs/core";
import { LogExceptionsFilter } from "./log-error.filter";
import { RecordModule } from "./records/record.module";
import { CheckerModule } from "./checkers/checker.module";
import { AuthModule } from "./auth/auth.module";

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
		AuthModule
	],
	controllers: [AppController],
})
export class AppModule { }
