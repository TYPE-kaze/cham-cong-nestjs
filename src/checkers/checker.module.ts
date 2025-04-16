import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Checker } from "./checker.model";
import { CheckerService } from "./checker.service";
import { CheckerController } from "./checker.controller";

@Module({
	imports: [SequelizeModule.forFeature([Checker])],
	controllers: [CheckerController],
	providers: [CheckerService],
	exports: [CheckerService]
})
export class CheckerModule { }