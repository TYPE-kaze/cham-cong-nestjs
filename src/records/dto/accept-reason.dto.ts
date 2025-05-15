import { IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";
import { UUID } from "crypto";
import { IsNotFutureDate } from "src/utils/is-not-future-date.decorator";

export class AcceptReasonDTO {
	@IsUUID()
	@IsNotEmpty()
	employeeID: UUID

	@IsNotFutureDate({
		message: 'Không thể chấm đủ công một ngày trong tương lai'
	})
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'Date must be in the format YYYY-MM-DD',
	})
	@IsNotEmpty()
	date: string;
}

