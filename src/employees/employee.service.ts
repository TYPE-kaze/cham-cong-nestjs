import bcrypt from 'bcryptjs'
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Employee } from "./employee.model";
import { CreateEmployeeDTO } from "./dto/create-employee.dto";
import { UUID } from "node:crypto";
import { Op } from "sequelize";
import { Record } from "src/records/record.model";

@Injectable()
export class EmployeeService {
	constructor(@InjectModel(Employee) private readonly employeeModel: typeof Employee) { }

	async createOne(createEmployeeDTO: CreateEmployeeDTO) {
		const { name, email, phone } = createEmployeeDTO
		const employee = new Employee({ name, email, phone })
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

	async getOneWithRecords(id: UUID) {
		const employee = await this.employeeModel.findOne({ where: { id }, include: [Record] })
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

	async changePassWD(id: UUID, oldP: string, newP: string) {
		const employee = await this.employeeModel.findOne({ where: { id } })
		if (employee === null) {
			throw new Error('id match no employee')
		}


		console.log("DEBUG")
		console.log(employee.dataValues)
		console.log(oldP)
		if (oldP === 'user' && oldP !== employee.dataValues.password) { //default password 'user'
			throw new Error('Mật khẩu cũ không đúng')
		}

		if (oldP !== 'user' && !bcrypt.compareSync(oldP, employee.dataValues.password)) {
			throw new Error('Mật khẩu cũ không đúng')
		}

		const hash = bcrypt.hashSync(newP, 10);
		console.log('Hello !!!!!!!!!!!!!!!')
		console.log(`Hash: ${hash}`)
		await employee.update({ password: hash })
	}
}