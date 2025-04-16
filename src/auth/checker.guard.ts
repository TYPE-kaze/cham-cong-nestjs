import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { NotCheckerException } from "./not-checker.exception"

@Injectable()
export class CheckerGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()
		const role = request?.user?.role
		if (role !== 'checker') {
			throw new NotCheckerException()
		}

		return true
	}
}
