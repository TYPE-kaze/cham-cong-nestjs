import { ForbiddenException } from "@nestjs/common";

export class NotCheckerException extends ForbiddenException {
	constructor() {
		super('Not Checker')
	}
}
