import { Column, Model, Table, HasMany, PrimaryKey, DataType, NotEmpty, NotIn } from 'sequelize-typescript';
import { randomUUID, UUID } from 'node:crypto';
import { Record } from 'src/records/record.model';
import { MonthStat } from 'src/statistic/month-stat.model';

@Table({ tableName: 'employees', paranoid: true })
export class Employee extends Model {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: randomUUID })
	id: UUID

	@Column({ allowNull: false })
	name: string;

	@NotIn([['checker']])
	@Column({ allowNull: false })
	email: string;

	@Column({
		defaultValue: 'user',
		allowNull: false
	})
	password: string;

	@Column
	phone?: string;

	@Column({
		type: DataType.CHAR(1),
		defaultValue: '2',
	})
	shift: '1' | '2';

	@HasMany(() => Record)
	records: Record[]

	@HasMany(() => MonthStat, { onDelete: 'CASCADE' })
	monthStats: MonthStat[]
}