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
		private recordService: RecordService,
		@InjectModel(MonthStat) private readonly monthStatModel: typeof MonthStat,
		@InjectModel(Employee) private readonly employeeModel: typeof Employee
	) { }
	async getStatOfMonth(getMonthQueryDTO: GetMonthQueryDTO) {
		let { monthYear, query, order, sort } = getMonthQueryDTO
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

		const kEmWhere: any = { [Op.and]: [] }
		const eWhere: any = { [Op.and]: [] }

		let isNA = false
		if (query) {
			isNA = /n\/a?/i.test(query)
			if (!isNA) {
				kEmWhere[Op.and].push(
					{ name: { [Op.like]: `%${query}%` } }
				)

				eWhere[Op.and].push(
					{ name: { [Op.like]: `%${query}%` } }
				)
			}
		}

		let kStats = await this.monthStatModel.findAll({
			order: [['employeeID', 'ASC']],
			include: [{
				model: Employee,
				required: true,
				where: kEmWhere
			}],
			where: {
				month, year
			}
		})

		const employees = await this.employeeModel.findAll(
			{
				order: [['id', 'ASC']],
				where: eWhere
			}
		)
		let stats: MonthStat[] = []
		let ukStats: MonthStat[] = []
		let k_count = 0
		for (const e of employees) {
			if (kStats.length > 0 && k_count < kStats.length && e.id === kStats[k_count].employeeID) {
				k_count++
			} else {
				const m = new MonthStat({ employeeID: e.id, month, year })
				m.employee = e
				ukStats.push(m)
			}
		}

		if (isNA) kStats = []
		stats = [...kStats, ...ukStats]
		//sort 
		switch (sort) {
			case 'name':
				if (order === 'ASC') {
					stats = stats.sort((a, b) => {
						return a.employee.name.localeCompare(b.employee.name, 'vi')
					})
				} else {
					stats = stats.sort((a, b) => {
						return -a.employee.name.localeCompare(b.employee.name, 'vi')
					})
				}
				break;
			case 'numOfDayEarly':
			case 'numOfDayLate':
			case 'numofLE':
				if (order === 'ASC') {
					kStats = kStats.sort((a, b) => a[sort] - b[sort])
				} else {
					kStats = kStats.sort((a, b) => b[sort] - a[sort])
				}
				stats = [...kStats, ...ukStats]
				break
			default:
				break
		}

		const count = stats.length
		const numOfRowPerPage = getMonthQueryDTO.numOfRowPerPage
			? parseInt(getMonthQueryDTO.numOfRowPerPage)
			: 30
		const pageNo = getMonthQueryDTO.pageNo
			? parseInt(getMonthQueryDTO.pageNo)
			: 1
		const s = 0 + numOfRowPerPage * (pageNo - 1)
		const e = s + numOfRowPerPage - 1
		stats = stats.slice(s, e)
		return [stats, count] as const
	}

	async deleteMonthStatOfOneEmployee(employeeID: UUID) {
		return await this.monthStatModel.destroy({ where: { employeeID } })
	}

	async updateMonthStatBaseOnRecord(month: number, year: number) {
		const records = await this.recordService.findByMonth(month, year)
		const t = {}
		for (const r of records) {
			t[r.employeeID] ??= {
				numOfDayLate: 0,
				numOfDayEarly: 0,
				numofLE: 0
			}

			if (r.isLate) {
				t[r.employeeID].numOfDayLate++
			}

			if (r.isEarly) {
				t[r.employeeID].numOfDayEarly++
			}

			if (r.isBoth) {
				t[r.employeeID].numofLE++
			}
		}

		console.log(t)
		for (const employeeID in t) {
			const [m_stat, _] = await this.monthStatModel.findOrCreate(
				{
					where: { month, year, employeeID }
				}
			)
			await m_stat.update(t[employeeID])
		}
	}
}
