import { IntrinsicException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export class ValidationException extends IntrinsicException {
	public validationErrors: ValidationError[]
	constructor(validationErrors: ValidationError[]) {
		super()
		this.validationErrors = validationErrors
	}
}	