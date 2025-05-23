import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { readFileSync, writeFileSync } from "node:fs"
import { join } from 'node:path'
import { UpdateConfigDTO } from "./update-config.dto";
import { ShiftRecord } from "./shift.model";

export interface ShiftsObject {
	[kind: string]: {
		id: number,
		startTime: `${number}:${number}`,
		endTime: `${number}:${number}`
	}
}

export interface Shift {
	id: number,
	kind: string,
	startTime: `${number}:${number}`,
	endTime: `${number}:${number}`,
}

export interface Config {
	maxReasonLimit: number,
	shifts: Shift[]
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
	constructor(
		@InjectModel(ShiftRecord) private readonly shiftRecordModel: typeof ShiftRecord,
	) {
		this.config = ConfigService.config
		this.initilaze()
	}

	async initilaze() {
		//db is empty, write from settings.json file to it
		const shiftRecords = await this.shiftRecordModel.findAll()
		if (shiftRecords.length === 0) {
			for (const sh of this.config.shifts) {
				const { endTime, startTime, kind } = sh
				const shr = await this.shiftRecordModel.create({ endTime, startTime, kind })
				sh.id = shr.id
			}
			this.updateJSONFile()
		}
	}

	getShiftsObject(): ShiftsObject {
		const obj = {}
		for (const sh of this.config.shifts) {
			obj[sh.kind] = {
				id: sh.id,
				startTime: sh.startTime,
				endTime: sh.endTime,
			}
		}
		return obj
	}
	async updateConfig(updateConfigDTO: UpdateConfigDTO) {
		const { maxReasonLimit, shifts } = updateConfigDTO
		if (maxReasonLimit) this.config.maxReasonLimit = parseInt(maxReasonLimit)
		//should ???
		if (shifts) {
			for (const sh in shifts) {
				for (const shift of this.config.shifts) {
					if (sh === shift.kind) {
						if (
							shift.startTime !== shifts[sh].startTime
							|| shift.endTime !== shifts[sh].endTime
						) {
							shift.startTime = shifts[sh].startTime
							shift.endTime = shifts[sh].endTime
							const last_shr = await this.shiftRecordModel.findOne({
								where: { id: shift.id },
							})
							if (last_shr) {
								const now = new Date()
								last_shr.update({ endDate: now })
							}
							const shr = await this.shiftRecordModel.create({
								startTime: shift.startTime,
								endTime: shift.endTime,
								kind: shift.kind
							})

							shift.id = shr.id
						}

					}
				}
			}
		}
		this.updateJSONFile()
	}

	updateJSONFile() {
		const json = JSON.stringify(this.config)
		writeFileSync(path, json)
	}
}