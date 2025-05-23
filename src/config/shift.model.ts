import { Column, Model, Table, HasMany, PrimaryKey, DataType, NotEmpty, NotIn } from 'sequelize-typescript';
import { Record } from 'src/records/record.model';

@Table({ tableName: 'shift_records' })
export class ShiftRecord extends Model {
	@Column({
		type: DataType.TIME,
		allowNull: false,
	})
	startTime: string;

	@Column({
		type: DataType.TIME,
		allowNull: false,
	})
	endTime: string;

	@Column({
		type: DataType.DATE,
		allowNull: true,
		defaultValue: DataType.NOW,
	})
	startDate: Date;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	endDate: Date;

	@Column({ allowNull: false })
	kind: string

	@HasMany(() => Record)
	records: Record[]
}