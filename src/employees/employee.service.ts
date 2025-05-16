import bcrypt from 'bcryptjs'
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Employee } from "./employee.model";
import { CreateEmployeeDTO } from "./dto/create-employee.dto";
import { UUID } from "node:crypto";
import { literal, Op, where } from "sequelize";
import { Record } from "src/records/record.model";
import { FlashError } from 'src/flash-error';
import { GetIndexQueryDTO } from './dto/get-index-query.dto';

@Injectable()
export class EmployeeService {
	constructor(
		@InjectModel(Employee) private readonly employeeModel: typeof Employee,
	) { }

	async getEmployeeForIndexPage(getIndexQueryDTO: GetIndexQueryDTO) {
		const { query, sort, order } = getIndexQueryDTO

		const option: any = {}
		if (query) {
			option.where = {
				[Op.or]: [
					{ name: { [Op.like]: `%${query}%` } },
					{ phone: { [Op.like]: `%${query}%` } },
					{ email: { [Op.like]: `%${query}%` } },
				],
			}

			let res = /ca? *([12])/.exec(query)
			if (res) {
				const shift = res[1]
				option.where[Op.or].push({ shift })
			}
		}

		if (sort) {
			const sortOrder = order ?? 'ASC'
			option.order = [[sort, sortOrder]]
		}

		const numOfRowPerPage = getIndexQueryDTO.numOfRowPerPage
			? parseInt(getIndexQueryDTO.numOfRowPerPage)
			: 30
		option.limit = numOfRowPerPage

		const pageNo = getIndexQueryDTO.pageNo
			? parseInt(getIndexQueryDTO.pageNo)
			: 1
		option.offset = (pageNo - 1) * numOfRowPerPage

		return await this.employeeModel.findAndCountAll(option)
	}

	async getEmployeeWithRecords(date: string, name?: string) {
		let where
		if (name) {
			where = {
				name: {
					[Op.like]: `%${name}%`
				}
			}
		}
		return await this.employeeModel.findAll(
			{
				where,
				include: [{
					model: Record,
					required: false,
					where: {
						date,
					}
				}]
			}
		)
	}

	async createOne(createEmployeeDTO: CreateEmployeeDTO) {
		const { name, email, phone, shift } = createEmployeeDTO
		const employee = new Employee({ name, email, phone, shift })
		return await employee.save()
	}

	async findOrCreateOneByName(name: string, email?: string, startWorkTime?: string, endWorkTime?: string) {
		const [employee, _] = await this.employeeModel.findOrCreate({
			where: {
				name,
				email: email ? email : name.trim().replace(/\s/g, '_') + '@mobiphone.vn',
				shift: '2'
			}
		})
		return await employee.save()
	}

	async getAll() {
		return await this.employeeModel.findAll()
	}

	async findByName(name: string) {
		return await this.employeeModel.findAll({ where: { name: { [Op.like]: `%${name}%` } } })
	}

	async findOneByEmail(email: string) {
		return await this.employeeModel.findOne({ where: { email } })
	}

	async findOne(id: UUID) {
		const employee = await this.employeeModel.findOne({ where: { id } })
		if (employee === null) {
			throw new Error('id matches no employee')
		}
		return employee
	}

	async getOneWithRecords(id: UUID, recordYear: number) {
		const employee = await this.employeeModel.findOne(
			{
				where: { id },
				include: [{
					model: Record,
					required: false,
					where: {
						[Op.and]: literal(`YEAR(date) = ${recordYear}`)
					},
					order: [['date', 'ASC']],
				}]
			}
		)
		if (employee === null) {
			throw new Error('id matches no employee')
		}
		const { name, email, phone, password, shift } = employee.dataValues
		const records = employee.dataValues.records.map(r => r.dataValues)
		return { id, name, email, phone, password, shift, records }
	}

	async getOneWithRecordsInOneMonth(id: UUID, month: number, year: number, sort = 'date', order = 'ASC', filter = '0') {
		const employee = await this.employeeModel.findOne(
			{
				where: { id },
				include: [{
					model: Record,
					required: false,
					where: {
						[Op.and]: [
							literal(`YEAR(date) = ${year}`),
							literal(`MONTH(date) = ${month}`),
						]
					},
				}],
				order: [[{ model: Record, as: 'records' }, 'date', 'ASC']], //sq-ts quirk!
			}
		)
		if (employee === null) {
			throw new Error('id matches no employee')
		}
		const date = new Date(year, month - 1, 1, 0, 0, 0);
		let records: Record[] = []
		let i = 0
		while (date.getMonth() === month - 1) {
			// each loop would give a date
			const yyyy = date.getFullYear();
			const mm = String(date.getMonth() + 1).padStart(2, '0')
			const dd = String(date.getDate()).padStart(2, '0');
			const dateStr = `${yyyy}-${mm}-${dd}`

			if (employee.records.length > 0 && i < employee.records.length && dateStr === employee.records[i].date) {
				records.push(employee.records[i])
				i++
			} else {
				const newRecord = new Record({
					employeeID: id,
					date: dateStr,
				})
				records.push(newRecord)
			}
			date.setDate(date.getDate() + 1);
		}

		//collect stats of the month
		const stat = {
			isAtWorkLate: 0,
			isLeaveEarly: 0,
			isBoth: 0,
			isOk: 0,
			isNotWork: 0
		}
		for (const record of records) {
			const { isLate, isEarly, isBoth, isNotWork, isOk } = record
			if (isLate) stat.isAtWorkLate += 1
			if (isEarly) stat.isLeaveEarly += 1
			if (isBoth) stat.isBoth += 1
			if (isNotWork) stat.isNotWork += 1
			if (isOk) stat.isOk += 1
		}

		switch (filter) {
			case '1':
				records = records.filter((r) => r.isNotWork)
				break
			case '2':
				records = records.filter((r) => r.isOk)
				break
			case '3':
				records = records.filter((r) => r.isLate)
				break
			case '4':
				records = records.filter((r) => r.isEarly)
				break
			case '5':
				records = records.filter((r) => r.isBoth)
				break
			default:
				break

		}

		//Sort
		if (sort === 'reason') {
			let hasUpdateded = records.filter((r) => !!r.reasonUpdatedAt)
			const other = records.filter((r) => !r.reasonUpdatedAt)
			hasUpdateded = hasUpdateded.sort((a, b) => {
				const aDate = new Date(a.reasonUpdatedAt)
				const bDate = new Date(b.reasonUpdatedAt)
				if (order === 'DESC') {
					return bDate.getTime() - aDate.getTime()
				} else {
					return aDate.getTime() - bDate.getTime()
				}
			})
			records = [...hasUpdateded, ...other]
		} else {
			if (order === 'DESC') records = records.reverse()
		}

		employee.records = records
		return [employee, stat] as const
	}

	async updateOne(id: UUID, updateEmployeeDTO: CreateEmployeeDTO) {
		let employee = await this.employeeModel.findOne({ where: { id } })
		if (employee === null) {
			throw new Error('id matchs no employee')
		}
		return await employee.update(updateEmployeeDTO)
	}

	async deleteOne(id: UUID) {
		const employee = await this.employeeModel.findOne({ where: { id } })
		if (employee === null) {
			throw new Error('id match no employee')
		}
		return await employee.destroy()
	}

	async changePassword(id: UUID, oldP: string, newP: string) {
		const employee = await this.employeeModel.findOne({ where: { id } })
		if (employee === null) {
			throw new FlashError('id match no employee')
		}
		if (oldP === 'user' && oldP !== employee.dataValues.password) { //default password 'user'
			throw new FlashError('Mật khẩu cũ không đúng')
		}
		if (oldP !== 'user' && !bcrypt.compareSync(oldP, employee.dataValues.password)) {
			throw new FlashError('Mật khẩu cũ không đúng')
		}
		const hash = bcrypt.hashSync(newP, 10);

		await employee.update({ password: hash })
	}
}