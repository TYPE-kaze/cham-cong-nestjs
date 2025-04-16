import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UUID } from "node:crypto";
import { Checker } from "./checker.model";

@Injectable()
export class CheckerService {
	constructor(@InjectModel(Checker) private readonly checkerModel: typeof Checker) { }
	getAll() {
		return this.checkerModel.findAll()
	}

	async findOneByUsername(username: string) {
		return await this.checkerModel.findOne({ where: { username } })
	}
}