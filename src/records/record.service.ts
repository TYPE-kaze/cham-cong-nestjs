import { Injectable } from "@nestjs/common";
import { EmployeeService } from "src/employees/employee.service";
import { Record } from "./record.model";
import { UUID } from "crypto";
import { Employee } from "src/employees/employee.model";
import { InjectModel } from "@nestjs/sequelize";
import { literal, Op } from "sequelize";

@Injectable()
export class RecordService {
	constructor(private employeeService: EmployeeService, @InjectModel(Record) private readonly recordModel: typeof Record) { }

	async findOne(date: string, employeeID: UUID) {
		const record = await this.recordModel.findOne({ where: { employeeID, date }, include: [Employee] })
		if (record === null) throw new Error('No record matched date and employeeID')
		return record;
	}

	async getAll() {
		const records = await this.recordModel.findAll({ include: [{ model: Employee, right: false }] })
		return records
	}

	async filter(employeeID: string, day: string, month: string, year: string) {
		const conditions: any[] = []
		const where: any = {}
		if (employeeID && employeeID !== '') {
			where.employeeID = employeeID
		}

		if (day && day !== '') {
			const d = parseInt(day);
			conditions.push(literal(`DAY(date) = ${day}`))
		}

		if (month && month !== '') {
			const d = parseInt(month);
			conditions.push(literal(`MONTH(date) = ${month}`))
		}

		if (year && year !== '') {
			const d = parseInt(year);
			conditions.push(literal(`YEAR(date) = ${year}`))
		}

		const finalWhere = {
			...where,
			...{ [Op.and]: conditions },
		}

		const records = this.recordModel.findAll({ where: finalWhere, include: [Employee] })
		return records
	}

	async createOne(date: string, employeeID: UUID, startTime: string | undefined, endTime: string | undefined) {
		const employee = await this.employeeService.findOne(employeeID)
		if (employee === null) {
			throw new Error('id matches no employee')
		}
		const dup = await this.recordModel.findOne({ where: { date, employeeID } })
		if (dup !== null) {
			throw new Error(`Đã chấm công nhân viên ${employee.dataValues.name} ngày ${date}`)
		}
		const record = await (new this.recordModel({ date, startTime, endTime, employeeID })).save()
		return record
	}

	async updateOne(date: string, employeeID: UUID, startTime: string | undefined, endTime: string | undefined) {
		let record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null) {
			throw new Error('No record matched date and employeeID')
		}
		record = await record.update({ startTime, endTime })
		return record
	}

	async deleteOne(date: string, employeeID: UUID) {
		const record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null) {
			throw new Error('No record matched date and employeeID')
		}
		return await record.destroy()
	}
}