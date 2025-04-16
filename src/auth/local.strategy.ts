import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WrongCredentialException } from './wrong-credential.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<any> {
		let user = await this.authService.validateChecker(username, password);
		let role
		if (user) {
			role = 'checker'
		} else {
			user = await this.authService.validateEmployee(username, password)
			if (user) {
				role = 'employee'
			}
		}

		if (!user) {
			throw new WrongCredentialException()
		}
		return { user, role };
	}
}