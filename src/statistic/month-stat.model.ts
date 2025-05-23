import { UUID } from 'node:crypto';
import { Column, Model, Table, DataType, BelongsTo, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import { Employee } from 'src/employees/employee.model';

@Table({ tableName: "month_stat" })
export class MonthStat extends Model {
	@PrimaryKey
	@ForeignKey(() => Employee)
	@Column({
		type: DataType.UUID,
		allowNull: false
	})
	employeeID: UUID

	@BelongsTo(() => Employee)
	employee: Employee

	@PrimaryKey
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	month: number

	@PrimaryKey
	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	year: number

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	numOfDayLate: number

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	numOfDayEarly: number

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	numofLE: number
}