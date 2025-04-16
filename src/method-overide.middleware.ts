import { Request, Response, NextFunction } from 'express';

export function methodOverride(req: Request, _: Response, next: NextFunction) {
	if (req.query && req.query._method && typeof req.query._method === 'string') {
		const method = req.query._method.toUpperCase()
		if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
			req.method = method;
			delete req.query._method
		}
	}
	next();
};
