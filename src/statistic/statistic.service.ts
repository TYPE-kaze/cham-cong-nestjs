import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Employee } from "src/employees/employee.model";
import { EmployeeService } from "src/employees/employee.service";
import { Record } from "src/records/record.model";
import { RecordService } from "src/records/record.service";
import { WorktimeRuleService } from "src/worktime-rules/wtr.service";
import { MonthStat } from "./month-stat.model";

@Injectable()
export class StatisticService {
	constructor(
		private employeeService: EmployeeService,
		private recordService: RecordService,
		@InjectModel(MonthStat) private readonly monthStatModel: typeof MonthStat
	) { }
	async getStatOfMonth(month: string, year: string) {
		return await this.monthStatModel.findAll(
			{
				where: { month, year },
				include: [Employee]
			}
		)
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