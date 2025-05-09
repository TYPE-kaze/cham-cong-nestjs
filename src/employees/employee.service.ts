import bcrypt from 'bcryptjs'
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Employee } from "./employee.model";
import { CreateEmployeeDTO } from "./dto/create-employee.dto";
import { UUID } from "node:crypto";
import { literal, Op } from "sequelize";
import { Record } from "src/records/record.model";
import { FlashError } from 'src/flash-error';

@Injectable()
export class EmployeeService {
	constructor(
		@InjectModel(Employee) private readonly employeeModel: typeof Employee,
	) { }

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
		const { name, email, phone, startWorkTime, endWorkTime } = createEmployeeDTO
		const employee = new Employee({ name, email, phone, startWorkTime, endWorkTime })
		return await employee.save()
	}

	async findOrCreateOneByName(name: string, email?: string, startWorkTime?: string, endWorkTime?: string) {
		const [employee, _] = await this.employeeModel.findOrCreate({
			where: {
				name,
				email: email ? email : name.trim().replace(/\s/g, '_') + '@mail.com',
				startWorkTime: startWorkTime ? startWorkTime : '08:30:00',
				endWorkTime: endWorkTime ? endWorkTime : '17:30:00',
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
		const { name, email, phone, password } = employee.dataValues
		const records = employee.dataValues.records.map(r => r.dataValues)
		return { id, name, email, phone, password, records }
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