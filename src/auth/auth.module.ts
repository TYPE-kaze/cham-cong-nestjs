import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CheckerModule } from "src/checkers/checker.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { SessionSerializer } from "./session.serialize";
import { EmployeeModule } from "src/employees/employee.module";

@Module({
	imports: [EmployeeModule, CheckerModule, PassportModule.register({ session: true })],
	providers: [AuthService, LocalStrategy, SessionSerializer],
	controllers: [AuthController]
})
export class AuthModule { }