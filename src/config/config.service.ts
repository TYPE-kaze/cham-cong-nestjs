import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { readFileSync, writeFileSync } from "node:fs"
import { join } from 'node:path'
import { UpdateConfigDTO } from "./update-config.dto";

interface Config {
	maxReasonLimit: number
}
const path = join(__dirname, '../../settings.json')

@Injectable()
export class ConfigService {
	static config: Config
	static {
		const confBlob = readFileSync(path, 'utf-8')
		ConfigService.config = JSON.parse(confBlob)
	}
	config: Config
	constructor() {
		this.config = ConfigService.config
	}

	updateConfig(updateConfigDTO: UpdateConfigDTO) {
		const { maxReasonLimit } = updateConfigDTO
		if (maxReasonLimit) this.config.maxReasonLimit = parseInt(maxReasonLimit)
		this.updateJSONFile()
	}

	updateJSONFile() {
		const json = JSON.stringify(this.config)
		writeFileSync(path, json)
	}
}