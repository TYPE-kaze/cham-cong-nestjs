import { Transform } from "class-transformer";
import { IsEmpty, IsIn, IsInt, IsNotEmpty, IsOptional, Matches } from "class-validator";

export class GetIndexQueryDTO {
	// @Query('employeeID') employeeID: string,
	// @Query('day') day: string,
	// @Query('month') month: string,
	// @Query('year') year: string,
	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	day?: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	month?: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	year?: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@IsIn(['date', 'startTime', 'endTime', 'shift'])
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