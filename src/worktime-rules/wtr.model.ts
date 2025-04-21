import { Column, Model, Table, PrimaryKey, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

@Table({ tableName: "worktime_rules" })
export class WorktimeRule extends Model {
	@Column({
		type: DataType.DATEONLY,
		allowNull: true,
	})
	fromDate: string;

	@Column({
		type: DataType.TIME,
		allowNull: true,
	})
	startTime: string;

	@Column({
		type: DataType.TIME,
		allowNull: true,
	})
	endTime: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	deltaMins: number;
}