import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as fs from 'fs'
import * as path from 'path'
const LOGFILE_PATH = path.join(__dirname, '..', 'errors.log')
const log = fs.createWriteStream(LOGFILE_PATH, { autoClose: true, flags: 'a' })

@Catch()
export class LogExceptionsFilter extends BaseExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const msg = `${new Date().toISOString()} ${exception.name}: ${exception.message}\n`
		log.write(msg)
		super.catch(exception, host);
	}
}
