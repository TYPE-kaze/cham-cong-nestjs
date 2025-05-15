import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class StoreBaseUrlToReturnToOnErrorInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest()
		req.session.returnToOnError = req.originalUrl.split('?')[0]
		return next.handle()
	}
}