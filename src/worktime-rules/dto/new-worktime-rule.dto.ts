import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsInt, isNotEmpty, IsNotEmpty, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, IsUUID, Matches, ValidateIf } from "class-validator";
import { IsStartBeforeEnd } from "src/utils/is-start-before-end.decorator";

export class NewWorktimeRuleDTO {
	@Transform(({ value }) => value === '' ? undefined : value)
	@IsNotEmpty()
	@IsString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'fromDate must be in the format YYYY-MM-DD',
	})
	fromDate: string

	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value === '' ? undefined : value)
	@IsStartBeforeEnd('endTime', { message: 'Start time must be before end time' })
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'startTime must be in the format HH:mm:ss',
	})
	startTime: string;

	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => value === '' ? undefined : value)
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'endTime must be in the format HH:mm:ss',
	})
	endTime: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@IsNotEmpty()
	deltaMins: number

}
