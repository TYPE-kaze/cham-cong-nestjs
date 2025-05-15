import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import { UUID } from "crypto";
import { IsNotFutureDate } from "src/utils/is-not-future-date.decorator";

export class CreateRecordDTO {
	@IsNotEmpty()
	@IsUUID()
	employeeID: UUID

	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'Ngày chấm công không hợp lệ',
	}) //implies not null, undefined or ''
	@IsNotFutureDate({
		message: 'Không thể chấm công một ngày trong tương lai'
	})
	date: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Thời điểm đến không hợp lệ',
	})
	@IsOptional()
	startTime?: string;


	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Thời điểm về không hợp lệ',
	})
	endTime?: string;

	@IsIn(['', '1', '2', '3', '4'])
	@IsOptional()
	status?: '' | '1' | '2' | '3' | '4'

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	reason?: string;
}
