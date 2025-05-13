import { Transform } from "class-transformer";
import { IsEmpty, IsIn, IsInt, IsNotEmpty, IsOptional, Matches } from "class-validator";
import { IsNotFutureMonth } from "src/utils/is-not-future-month.decorator";

export class GetMonthQueryDTO {
	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	name?: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsNotFutureMonth()
	@Matches(/^[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)
	@IsOptional()
	monthYear?: string

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	@IsIn(['name', 'numOfDayLate', 'numOfDayEarly', 'numofLE'])
	sort?: 'name' | 'numOfDayLate' | 'numOfDayEarly' | 'numofLE'

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
