import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap, catchError } from 'rxjs';

@Injectable()
export class RedirectReturnTo implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest()
		const res = context.switchToHttp().getResponse<Response>()
		const returnTo = req.session.returnTo
		const returnToOnError = req.session.returnToOnError
		//TODO: redirect depend on error or not
		return next.handle()
	}
}