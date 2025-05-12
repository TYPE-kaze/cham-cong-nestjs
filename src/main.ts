import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { methodOverride } from './method-overide.middleware';
import { ValidationPipe } from '@nestjs/common';
import { CustomErrorFilter } from './custom-error.filter';
import flash from 'connect-flash'
import session from 'express-session';
import { Request, Response } from 'express';
import passport from 'passport';
import { ValidationException } from './validation.exception';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	const PORT = process.env.PORT || 3000
	app.useStaticAssets(join(__dirname, '..', 'public'))
	app.setBaseViewsDir(join(__dirname, '..', 'views'))
	app.setViewEngine('ejs')

	// session storage
	app.use(
		session({
			secret: 'thisisasecret',
			resave: false,
			saveUninitialized: false,
		}),
	);

	app.use(flash())

	// need to de/serialize user and req.isAuthenticated()
	app.use(passport.initialize())
	app.use(passport.session())

	app.use((req, res: Response, next) => {
		//flash from session storage
		res.locals.success = req.flash('success')
		res.locals.error = req.flash('error')
		res.locals.user = req.user
		res.locals.returnTo = req?.session?.returnTo
		next()
	})

	app.use(methodOverride)
	app.useGlobalPipes(
		new ValidationPipe({
			stopAtFirstError: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true
			},
			exceptionFactory: errors => new ValidationException(errors)
		}))
	app.useGlobalFilters(new CustomErrorFilter())

	// test
	app.use((req: Request, res, next) => {
		// console.log(req.body)
		next()
	})
	await app.listen(PORT)
	console.log(`Listening on port http://localhost:${PORT}`)
}
bootstrap();
