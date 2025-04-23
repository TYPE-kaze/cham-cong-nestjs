import { UUID } from 'node:crypto';
import { Column, Model, Table, PrimaryKey, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import { Employee } from 'src/employees/employee.model';

@Table({ tableName: "records" })
export class Record extends Model {
	@PrimaryKey
	@ForeignKey(() => Employee)
	@Column({ type: DataType.UUID, allowNull: false })
	employeeID: UUID;

	@BelongsTo(() => Employee)
	employee: Employee

	@PrimaryKey
	@Column({
		type: DataType.DATEONLY,
		allowNull: false,
	})
	date: string;

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
		type: DataType.BOOLEAN,
		allowNull: true
	})
	isAtWorkLate: boolean

	@Column({
		type: DataType.BOOLEAN,
		allowNull: true
	})
	isLeaveEarly: boolean

}