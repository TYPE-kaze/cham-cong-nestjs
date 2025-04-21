import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, IsUUID, Matches, ValidateIf } from "class-validator";
import { UUID } from "crypto";

export class CreateRecordDTO {
	@IsNotEmpty()
	@IsUUID()
	employeeID: UUID

	@IsNotEmpty()
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'Date must be in the format YYYY-MM-DD',
	})
	date: string;

	@IsString()
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Time must be in the format HH:mm:ss',
	})
	startTime?: string;


	@IsString()
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Time must be in the format HH:mm:ss',
	})
	endTime?: string;
}