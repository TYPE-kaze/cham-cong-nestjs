import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Employee } from "src/employees/employee.model";
import { EmployeeService } from "src/employees/employee.service";
import { RecordService } from "src/records/record.service";
import { MonthStat } from "./month-stat.model";
import { UUID } from "node:crypto";
import { GetMonthQueryDTO } from "./dto/get-month-query.dto";
import { Op, where } from "sequelize";

@Injectable()
export class StatisticService {
	constructor(
		private employeeService: EmployeeService,
		private recordService: RecordService,
		@InjectModel(MonthStat) private readonly monthStatModel: typeof MonthStat,
		@InjectModel(Employee) private readonly employeeModel: typeof Employee
	) { }
	async getStatOfMonth(getMonthQueryDTO: GetMonthQueryDTO) {

		let { monthYear, name, order, sort } = getMonthQueryDTO
		let month: string, year: string
		if (!monthYear) {
			const now = new Date()
			month = String(now.getMonth() + 1)
			year = String(now.getFullYear())
		}
		else {
			const frags = monthYear.split('-')
			month = frags[0].replace(/^0/, '')
			year = frags[1]
		}

		const option: any = {
			where: { month, year },
			include: [{ model: Employee, required: false }]
		}
		if (name) {
			option.include[0].where = { name: { [Op.like]: `%${name}%` } }
		}

		if (sort) {
			const sortOrder = order ?? 'ASC'
			if (sort === 'name') { //employee's name
				// QUIRK: sq-ts implictly made an alias for model 
				option.order = [[{ model: Employee, as: 'employee' }, sort, sortOrder]] //quirk
			} else {
				option.order = [[sort, sortOrder]]
			}
		}

		const numOfRowPerPage = getMonthQueryDTO.numOfRowPerPage
			? parseInt(getMonthQueryDTO.numOfRowPerPage)
			: 30
		option.limit = numOfRowPerPage

		const pageNo = getMonthQueryDTO.pageNo
			? parseInt(getMonthQueryDTO.pageNo)
			: 1
		option.offset = (pageNo - 1) * numOfRowPerPage

		return await this.monthStatModel.findAndCountAll(option)
	}

	async deleteMonthStatOfOneEmployee(employeeID: UUID) {
		return await this.monthStatModel.destroy({ where: { employeeID } })
	}

	async updateMonthStatBaseOnRecord(month: string, year: string) {
		const employees = await this.employeeService.getAll()
		for (const e of employees) {
			const records = await this.recordService.findByMonthYearAndEmployeeID(month, year, e.id)
			let numOfDayLate = 0, numOfDayEarly = 0, numofLE = 0
			for (const r of records) {
				if (r.isAtWorkLate) {
					numOfDayLate++
				}

				if (r.isLeaveEarly) {
					numOfDayEarly++
				}

				if (r.isAtWorkLate && r.isLeaveEarly) {
					numofLE++
				}
			}

			let [m_stat, res] = await this.monthStatModel.findOrCreate(
				{
					where: {
						month,
						year,
						employeeID: e.id
					}
				}
			)
			await m_stat.update({ numOfDayEarly, numOfDayLate, numofLE })
		}
	}
}