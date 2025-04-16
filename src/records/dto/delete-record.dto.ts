import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, IsUUID, Matches, ValidateIf } from "class-validator";
import { UUID } from "crypto";

export class DeleteRecordDTO {
	@IsNotEmpty()
	@IsUUID()
	employeeID: UUID

	@IsNotEmpty()
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'Date must be in the format YYYY-MM-DD',
	})
	date: string;
}