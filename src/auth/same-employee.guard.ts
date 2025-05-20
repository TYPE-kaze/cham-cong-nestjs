import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

@Injectable()
export class SameEmployeeGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()
		const id = request?.user.user.id
		return request.params?.id === id
	}
}

