import { Transform } from "class-transformer";
import { IsIn, IsOptional, Matches } from "class-validator";
import { IsNotFutureMonth } from "src/utils/is-not-future-month.decorator";
import { IsNotFutureYear } from "src/utils/is-not-future-year.decorator";

export class ShowHeatMapDTO {
	@IsNotFutureYear()
	@Matches(/^[0-9][0-9][0-9][0-9]$/)
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	year?: string

	@IsNotFutureMonth()
	@Matches(/^[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	r_monthYear?: string

	@IsIn(['date', 'reason'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	r_sort?: 'date' | 'reason'

	@IsIn(['ASC', 'DESC'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	r_order?: 'ASC' | 'DESC'

	@IsIn(['0', '1', '2', '3', '4', '5'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	r_filter?: '0' | '1' | '2' | '3' | '4' | '5'
}