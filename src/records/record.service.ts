import { Injectable } from "@nestjs/common";
import { EmployeeService } from "src/employees/employee.service";
import { Record } from "./record.model";
import { UUID } from "crypto";
import { Employee } from "src/employees/employee.model";
import { InjectModel } from "@nestjs/sequelize";
import { literal, Op, where } from "sequelize";
import { WorktimeRuleService } from "src/worktime-rules/wtr.service";
import { FlashError } from "src/flash-error";
import { CreateRecordDTO } from "./dto/create-record.dto";
import { DeleteRecordDTO } from "./dto/delete-record.dto";
import xlsx from 'xlsx'
import { UpdateReasonDTO } from "./dto/update-one-reason.dto";
import { CreateOneReasonDTO } from "./dto/create-one-reason.dto";
import { workShifts } from "src/constants/work-shift";
import { AcceptReasonDTO } from "./dto/accept-reason.dto";
import { ConfigService } from "src/config/config.service";
const { read, utils } = xlsx
const { decode_range, encode_cell } = utils

@Injectable()
export class RecordService {
	constructor(
		private employeeService: EmployeeService,
		private worktimeRuleService: WorktimeRuleService,
		private configService: ConfigService,
		@InjectModel(Record) private readonly recordModel: typeof Record
	) { }

	async acceptReason(acceptReasonDTO: AcceptReasonDTO) {
		const { date, employeeID } = acceptReasonDTO
		const [record, _] = await this.recordModel.findOrCreate(
			{
				where: { date, employeeID }
			}
		)
		return await record.update({ isAtWorkLate: false, isLeaveEarly: false })
	}
	async createOneReason(createOneReasonDTO: CreateOneReasonDTO) {
		const { employeeID, reason, date } = createOneReasonDTO
		const r = new Record({ employeeID, date })
		if (!r.isReasonable) throw Error('The record is not reasonable')
		const record = await this.recordModel.create({ employeeID, reason, date })
		return record
	}

	async updateOneReason(employeeID: UUID, date: string, reasonDTO: UpdateReasonDTO) {
		const record = await this.recordModel.findOne({
			where: {
				employeeID,
				date
			}
		})
		if (!record) throw Error('find no record')
		if (!record.isReasonable) throw new Error('The record is not reasonable')
		return await record.update({ reason: reasonDTO.reason })
	}

	async XLXSToDatabase(file: Express.Multer.File, year: number) {
		const workbook = read(file.buffer)
		const worksheet = workbook.Sheets[workbook.SheetNames[0]]
		const wsRange = worksheet['!ref']
		if (!wsRange) throw new Error('The worksheet has no range')
		const { r: rowLastIndex } = decode_range(wsRange).e

		// 3 merge A1:C2 la metadata
		const merges = worksheet['!merges']
		let dayRowIndex
		if (!merges) throw new Error('The worksheet has no merge')
		const dayIndex: number[] = []
		for (const m of merges) {
			const { s, e } = m
			// hang 0, merge ngang va dai 3 => ngay
			// const isDayMerge = (s.r === 0) && (s.r === e.r) && (e.c - s.c === 2)

			//merge ngang va dai 3
			const isDayMerge = (s.r === e.r) && (e.c - s.c === 2)
			if (isDayMerge) {
				dayRowIndex ??= s.r
				dayIndex.push(s.c)
			}
		}

		const newRecords: any[] = []
		const updatedRecords: Record[] = []
		const firstEmRowIndex = dayRowIndex + 2
		for (const i of dayIndex) { // tung ngay
			const dayMonth = worksheet[encode_cell({ c: i, r: dayRowIndex })].v
			const [day, month] = dayMonth.split('/')
			const date = `${year}-${month}-${day}`
			const employees = {}

			for (let j = firstEmRowIndex; j <= rowLastIndex; j++) { // tung nhan vien
				const worktime = worksheet[encode_cell({ c: i + 1, r: j })]?.v
				if (worktime) {
					const empName = worksheet[encode_cell({ c: 1, r: j })].v
					const [startTime, endTime] = worktime.split('-')
						.map((t) => t.trim())
						.map((t) => { return t === '' ? undefined : t })
					let employee = employees[empName]
					if (!employee) {
						employee = await this.employeeService.findOrCreateOneByName(empName)
						employees[empName] = employee
					}

					let isAtWorkLate, isLeaveEarly
					if (startTime) {
						isAtWorkLate = this.isEmployeeLate(employee, startTime)
					}

					if (endTime && startTime) {
						isLeaveEarly = this.isEmployeeLeaveEarly(employee, startTime, endTime)
					}

					const currentRecord = await this.recordModel.findOne({
						where: {
							employeeID: employee.id,
							date
						}
					})

					// are there something like a bulk update?
					const shifts = this.configService.getShiftsObject()

					if (currentRecord) {
						const r = await currentRecord.update({ startTime, endTime, isAtWorkLate, isLeaveEarly, shiftID: shifts[employee.shift].id })
						updatedRecords.push(r)
					}
					else {
						const record = { employeeID: employee.id, date, startTime, endTime, isAtWorkLate, isLeaveEarly, shiftID: shifts[employee.shift].id }
						newRecords.push(record)
					}
				}
			}
		}
		const addedRecords = newRecords.length === 0
			? newRecords
			: await this.recordModel.bulkCreate(newRecords)
		return [addedRecords.length, updatedRecords.length]
	}

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
			include: [{
				model: Employee,
				required: true
			}],
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

		const records = this.recordModel.findAll({ where: finalWhere, include: [{ model: Employee, required: true }] })
		return records
	}

	async createOne(createRecordDTO: CreateRecordDTO) {
		const { employeeID, date, startTime, endTime, reason, status } = createRecordDTO
		const employee = await this.employeeService.findOne(employeeID)
		if (employee === null) {
			throw new FlashError('id nhân viên không tồn tại')
		}
		const dup = await this.recordModel.findOne({ where: { date, employeeID } })
		if (dup !== null) {
			throw new FlashError(`Đã chấm công nhân viên ${employee.dataValues.name} ngày ${date}`)
		}
		let isAtWorkLate, isLeaveEarly
		switch (status) {
			case '1':
				isAtWorkLate = false
				isLeaveEarly = false
				break
			case "2":
				isAtWorkLate = true
				isLeaveEarly = false
				break
			case "3":
				isAtWorkLate = false
				isLeaveEarly = true
				break
			case "4":
				isAtWorkLate = true
				isLeaveEarly = true
				break
			default:
				if (startTime) {
					isAtWorkLate = this.isEmployeeLate(employee, startTime)
				}

				if (endTime && startTime) {
					isLeaveEarly = this.isEmployeeLeaveEarly(employee, startTime, endTime)
				}
		}

		const shifts = this.configService.getShiftsObject()
		const record = await (new this.recordModel({ shiftID: shifts[employee.shift].id, date, startTime, endTime, employeeID, isAtWorkLate, isLeaveEarly, reason })).save()
		return record
	}

	async updateOne(updateRecordDTO: CreateRecordDTO) {
		const { employeeID, date, startTime, endTime, reason, status } = updateRecordDTO
		let record = await this.recordModel.findOne(
			{
				where: { employeeID, date },
				include: [{ model: Employee, required: true }]
			})
		if (record === null) {
			throw new Error('Found no record')
		}

		let isAtWorkLate, isLeaveEarly
		switch (status) {
			case '1':
				isAtWorkLate = false
				isLeaveEarly = false
				break
			case "2":
				isAtWorkLate = true
				isLeaveEarly = false
				break
			case "3":
				isAtWorkLate = false
				isLeaveEarly = true
				break
			case "4":
				isAtWorkLate = true
				isLeaveEarly = true
				break
			default:
				if (startTime) {
					isAtWorkLate = this.isEmployeeLate(record.employee, startTime)
				}

				if (endTime && startTime) {
					isLeaveEarly = this.isEmployeeLeaveEarly(record.employee, startTime, endTime)
				}
		}

		record = await record.update({ startTime, endTime, isAtWorkLate, isLeaveEarly, reason })
		return record
	}

	async deleteOne(deleleRecordDTO: DeleteRecordDTO) {
		const { date, employeeID } = deleleRecordDTO
		const record = await this.recordModel.findOne({ where: { employeeID, date } })
		if (record === null) {
			throw new Error('No record matched date and employeeID')
		}
		return await record.destroy()
	}

	async findByMonth(month: number, year: number) {
		const conditions: any[] = []
		conditions.push(literal(`Month(date) = ${month}`))
		conditions.push(literal(`YEAR(date) = ${year}`))

		const where = { [Op.and]: conditions }
		const records = await this.recordModel.findAll({ where })
		return records
	}

	isEmployeeLate(employee: Employee, startTime: string) {
		const config = this.configService.config
		let startWorkTime: any
		for (const sh of config.shifts) {
			if (sh.kind === employee.shift) {
				startWorkTime = sh.startTime
				const ruleD = new Date(`1970-01-01T${startWorkTime}:00Z`)
				return new Date(`1970-01-01T${startTime}Z`) > ruleD
			}
		}
	}

	isEmployeeLeaveEarly(employee: Employee, startTime: string, endTime: string) {
		const startTimeD = new Date(`1970-01-01T${startTime}:00Z`)
		const leaveTimeD = new Date(`1970-01-01T${endTime}:00Z`)
		const config = this.configService.config
		for (const sh of config.shifts) {
			if (sh.kind === employee.shift) {
				const startWorkTime = sh.startTime
				const endWorkTime = sh.endTime
				const ruleStartTimeD = new Date(`1970-01-01T${startWorkTime}:00Z`)
				const ruleEndTimeD = new Date(`1970-01-01T${endWorkTime}:00Z`)
				return leaveTimeD < ruleEndTimeD
			}
		}
	}
}