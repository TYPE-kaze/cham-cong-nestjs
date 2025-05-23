import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { NotAuthenticatedException } from "./not-authenticated.exception"

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest()
		if (request.isAuthenticated() === false) {
			request.session.returnTo = request.originalUrl
			throw new NotAuthenticatedException()
		}
		return true
	}
}