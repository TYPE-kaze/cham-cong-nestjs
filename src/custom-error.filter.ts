import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";
import { NotAuthenticatedException } from "./auth/not-authenticated.exception";
import { WrongCredentialException } from "./auth/wrong-credential.exception";
import { ValidationError } from "class-validator";
import { ValidationException } from "./validation.exception";
import { FlashError } from "./flash-error";
import path from "node:path";
import fs from "node:fs"

const LOGFILE_PATH = path.join(__dirname, '..', 'errors.log')
const log = fs.createWriteStream(LOGFILE_PATH, { autoClose: true, flags: 'a' })

@Catch()
export class CustomErrorFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();
		const request = host.switchToHttp().getRequest();

		console.log(exception)

		// TODO: breaks to multiple filters
		if (exception instanceof NotAuthenticatedException) {
			const msg = `${new Date().toISOString()} ${exception.name}: ${exception.message}\n`
			log.write(msg)
			request.flash('error', 'Đăng nhập để sử dụng hệ thống')
			response.redirect('/login')
			return
		}

		if (exception instanceof WrongCredentialException) {
			const msg = `${new Date().toISOString()} ${exception.name}: ${exception.message}\n`
			log.write(msg)
			request.flash('error', 'Sai hoặc không tồn tại thông tin đăng nhập')
			response.redirect('/login')
			return
		}

		if (exception instanceof FlashError) {
			const msg = `${new Date().toISOString()} ${exception.name}: ${exception.message}\n`
			log.write(msg)
			request.flash('error', exception.message)
			const redirectUrl = request?.session?.returnTo
			if (redirectUrl) {
				return response.redirect(redirectUrl)
			}
			return response.redirect('/')
		}

		if (exception instanceof ValidationException) {
			const errors = exception.validationErrors;
			let msg = ''

			if (errors.length === 0) {
				msg = msg.concat("Validation errors")
			}
			else {
				for (const e of errors) {
					const constraints = e.constraints;
					for (const c in constraints) {
						msg = msg.concat(constraints[c], '. ')
					}
				}
			}
			const log_msg = `${new Date().toISOString()} ValidationExceptions: ${msg}\n`
			log.write(log_msg)

			request.flash('error', msg)
			const redirectUrl = request?.session?.returnTo
			if (redirectUrl) {
				return response.redirect(redirectUrl)
			}
			// TODO: If an user then redirect to its show page
			return response.redirect('/records')
		}

		// Default handler
		const r = exception.response;
		if (r && r.message && Array.isArray(r.message)) {
			exception.message = r.message
		}
		if (exception.status === null) {
			exception.status = 500;
		}
		const msg = `${new Date().toISOString()} ${exception.name}: ${exception.message}\n`
		log.write(msg)
		response.render('error', { err: exception })
	}
}