import { IntrinsicException } from "@nestjs/common";

export class WrongCredentialException extends IntrinsicException {
	constructor() {
		super('Wrong credentials');
	}
}