import { UUID } from 'node:crypto';
import { Column, Model, Table, PrimaryKey, DataType, ForeignKey, BelongsTo, AllowNull, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
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
	startTime?: string;

	@Column({
		type: DataType.TIME,
		allowNull: true,
	})
	endTime?: string;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: true
	})
	isAtWorkLate?: boolean

	@Column({
		type: DataType.BOOLEAN,
		allowNull: true
	})
	isLeaveEarly?: boolean

	@Column({
		type: DataType.STRING,
		allowNull: true
	})
	reason?: string

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	reasonUpdatedAt: Date;

	@BeforeUpdate
	static updateNameTimestamp(instance: Record) {
		if (instance.changed('reason')) {
			instance.reasonUpdatedAt = new Date();
		}
	}

	// 👇 Virtual property (not stored in DB)
	get isWeekDay(): boolean {
		const d = new Date(this.date)
		const day = d.getDay(); // 0 (Sun) to 6 (Sat)
		return day >= 1 && day <= 5; // Mon–Fri
	}
}