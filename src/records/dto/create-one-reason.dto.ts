import { IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";
import { UUID } from "crypto";

export class CreateOneReasonDTO {
	@IsNotEmpty()
	@IsUUID()
	employeeID: UUID

	@IsNotEmpty()
	@IsString()
	reason: string;

	@IsNotEmpty()
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'Date must be in the format YYYY-MM-DD',
	})
	date: string;
}
