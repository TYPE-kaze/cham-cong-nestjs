import { Injectable } from "@nestjs/common";
import { EmployeeService } from "src/employees/employee.service";
import { Record } from "./record.model";
import { UUID } from "crypto";
import { Employee } from "src/employees/employee.model";
import { InjectModel } from "@nestjs/sequelize";
import { literal, Op, where } from "sequelize";
import { WorktimeRuleService } from "src/worktime-rules/wtr.service";
import { FlashError } from "src/flash-error";

@Injectable()
export class RecordService {
	constructor(
		private employeeService: EmployeeService,
		private worktimeRuleService: WorktimeRuleService,
		@InjectModel(Record) private readonly recordModel: typeof Record
	) { }

	async checkoutEmployee(employeeID: UUID, date: string) {
		const record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null || !record.startTime) {
			throw new FlashError('Không thể checkout nhân viên chưa check in')
		}
		const now = new Date()
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const endTime = `${hours}:${minutes}:${seconds}`;
		const startTime = record.startTime

		const isLeaveEarly = await this.worktimeRuleService.isLeaveEarly(endTime, startTime)

		return await record.update({ endTime, isLeaveEarly })
	}

	async checkinEmployee(employeeID: UUID, date: string) {
		const [record, _] = await this.recordModel.findOrCreate({ where: { employeeID, date } })
		const now = new Date()
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const startTime = `${hours}:${minutes}:${seconds}`;
		const isAtWorkLate = await this.worktimeRuleService.isStartLate(startTime)

		return await record.update({ startTime, isAtWorkLate })
	}
	async findOne(date: string, employeeID: UUID) {
		const record = await this.recordModel.findOne({ where: { employeeID, date }, include: [Employee] })
		if (record === null) throw new Error('No record matched date and employeeID')
		return record;
	}

	async getAll() {
		const records = await this.recordModel.findAll({ include: [{ model: Employee, right: false }] })
		return records
	}

	async findByDate(date: string, employeeID?: string, filter?: string) {
		const where: any = { date }
		if (employeeID && employeeID !== '') {
			where.employeeID = employeeID
		}

		if (filter === '1') {
			where.isAtWorkLate = true
		}
		else if (filter === '2') {
			where.isLeaveEarly = true
		}
		else if (filter === '3') {
			where.isAtWorkLate = true
			where.isLeaveEarly = true
		}
		else if (filter === '4') {
			where[Op.or] = [
				{ isAtWorkLate: true },
				{ isLeaveEarly: true }
			]
		}

		const records = await this.recordModel.findAll({
			where,
			include: [Employee],
		})
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
		let isAtWorkLate, isLeaveEarly
		if (startTime) {
			isAtWorkLate = await this.worktimeRuleService.isStartLate(startTime)
		}

		if (endTime && startTime) {
			isLeaveEarly = await this.worktimeRuleService.isLeaveEarly(endTime, startTime)
		}

		const record = await (new this.recordModel({ date, startTime, endTime, employeeID, isAtWorkLate, isLeaveEarly })).save()
		return record
	}

	async updateOne(date: string, employeeID: UUID, startTime: string | undefined, endTime: string | undefined) {
		let record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null) {
			throw new Error('No record matched date and employeeID')
		}

		let isAtWorkLate, isLeaveEarly
		if (startTime) {
			isAtWorkLate = await this.worktimeRuleService.isStartLate(startTime)
		}

		if (endTime && startTime) {
			isLeaveEarly = await this.worktimeRuleService.isLeaveEarly(endTime, startTime)
		}

		record = await record.update({ startTime, endTime, isAtWorkLate, isLeaveEarly })
		return record
	}

	async deleteOne(date: string, employeeID: UUID) {
		const record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null) {
			throw new Error('No record matched date and employeeID')
		}
		return await record.destroy()
	}

	async findByMonthYearAndEmployeeID(month: string, year: string, employeeID: UUID) {
		const conditions: any[] = []
		const m = parseInt(month);
		conditions.push(literal(`Month(date) = ${month}`))
		const y = parseInt(year);
		conditions.push(literal(`YEAR(date) = ${year}`))

		const where = { [Op.and]: conditions, employeeID }
		const records = await this.recordModel.findAll({
			where,
			include: [Employee]
		})
		return records
	}
}