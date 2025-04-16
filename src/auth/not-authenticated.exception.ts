import { ForbiddenException, HttpStatus } from "@nestjs/common";

export class NotAuthenticatedException extends ForbiddenException {
	constructor() {
		super('Not Authenticated')
	}
}
