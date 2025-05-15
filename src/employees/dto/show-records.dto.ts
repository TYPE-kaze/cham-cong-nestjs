import { Transform } from "class-transformer";
import { IsIn, IsOptional, Matches } from "class-validator";
import { IsNotFutureMonth } from "src/utils/is-not-future-month.decorator";

export class ShowRecordsDTO {
	@IsNotFutureMonth()
	@Matches(/^[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	monthYear?: string

	@IsIn(['date', 'reason'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	sort?: 'date' | 'reason'

	@IsIn(['ASC', 'DESC'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	order?: 'ASC' | 'DESC'

	@IsIn(['0', '1', '2', '3', '4', '5'])
	@IsOptional()
	@Transform(({ value }) => value === '' ? undefined : value)
	filter?: '0' | '1' | '2' | '3' | '4' | '5'
}
