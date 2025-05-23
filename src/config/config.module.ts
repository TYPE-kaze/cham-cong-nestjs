import { Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";
import { ConfigService } from "./config.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { ShiftRecord } from "./shift.model";

@Module({
	imports: [SequelizeModule.forFeature([ShiftRecord])],
	controllers: [ConfigController],
	providers: [ConfigService],
	exports: [ConfigService, SequelizeModule.forFeature([ShiftRecord])]
})
export class ConfigModule { }