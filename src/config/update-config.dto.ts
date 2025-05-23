import { Transform } from "class-transformer";
import { IsOptional, Matches } from "class-validator";
import { IsShift } from "./is-shift.decorator";
export class UpdateConfigDTO {
	@Matches(/^10|15|20|25$/, { message: 'Hạn giải trình không hợp lệ' })
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	maxReasonLimit?: string;

	@IsShift()
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	shifts?: {
		[key: string]: {
			startTime: `${number}:${number}`,
			endTime: `${number}:${number}`
		}
	}
}