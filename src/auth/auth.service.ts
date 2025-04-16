import { Injectable } from "@nestjs/common";
import { CheckerService } from "src/checkers/checker.service";
import { EmployeeService } from "src/employees/employee.service";

@Injectable()
export class AuthService {
	constructor(private checkerService: CheckerService, private employeeService: EmployeeService) { }

	async validateChecker(username: string, password: string): Promise<any> {
		const checker = await this.checkerService.findOneByUsername(username);
		if (checker && checker.dataValues.password === password) {
			return checker
		}
		return null;
	}

	async validateEmployee(email: string, password: string): Promise<any> {
		const employee = await this.employeeService.findOneByEmail(email)

		if (employee && employee.dataValues.password === password) {
			return employee
		}
		return null;
	}
}