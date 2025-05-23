import { Transform } from "class-transformer";
import { IsEmpty, IsIn, IsInt, IsNotEmpty, IsOptional, Matches } from "class-validator";

export class GetIndexQueryDTO {
	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	query?: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@IsIn(['name', 'email', 'phone', 'shift'])
	sort?: 'name' | 'email' | 'phone' | 'shift'

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@IsIn(['ASC', 'DESC'])
	order?: 'ASC' | 'DESC'

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@Matches(/^(?!0+)[0-9]+$/)
	numOfRowPerPage?: string

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@Matches(/^(?!0+)[0-9]+$/)
	pageNo?: string
}