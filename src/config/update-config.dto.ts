import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotIn, IsOptional, Matches } from "class-validator";
export class UpdateConfigDTO {
	@Matches(/^10|15|20|25$/, { message: 'Hạn giải trình không hợp lệ' })
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	maxReasonLimit?: string;
}