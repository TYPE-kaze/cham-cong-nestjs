import { UUID } from 'node:crypto';
import { Column, Model, Table, PrimaryKey, DataType, ForeignKey, BelongsTo, AllowNull, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { Employee } from 'src/employees/employee.model';
import { ConfigService } from 'src/config/config.service';
const MS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24
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

	get isWeekDay(): boolean {
		const d = new Date(this.date)
		const day = d.getDay(); // 0 (Sun) to 6 (Sat)
		return day >= 1 && day <= 5; // Mon–Fri
	}

	get isLate(): boolean {
		if (typeof this.isAtWorkLate === 'boolean') {
			if (this.isAtWorkLate) return true
		}
		return false
	}

	get isEarly(): boolean {
		if (typeof this.isLeaveEarly === 'boolean') {
			if (this.isLeaveEarly) return true
		}
		return false
	}

	get isBoth(): boolean {
		if (typeof this.isAtWorkLate === 'boolean' && typeof this.isLeaveEarly === 'boolean') {
			if (this.isAtWorkLate && this.isLeaveEarly) return true
		}
		return false
	}

	get isNotWork(): boolean {
		return (
			(typeof this.isAtWorkLate === 'undefined' && typeof this.isLeaveEarly === 'undefined')
			|| (this.isAtWorkLate === null && this.isLeaveEarly === null)
		) && this.isWeekDay
	}

	get isOk(): boolean {
		if (typeof this.isAtWorkLate === 'boolean' && typeof this.isLeaveEarly === 'boolean') {
			if (!this.isAtWorkLate && !this.isLeaveEarly) return true
		}
		return false
	}

	get isStatusUnset(): boolean {
		return (
			(typeof this.isAtWorkLate === 'undefined' && typeof this.isLeaveEarly === 'undefined')
			|| (this.isAtWorkLate === null && this.isLeaveEarly === null)
		)
	}

	get status() {
		if (this.isBoth) return 'bo'
		if (this.isLate) return 'la'
		if (this.isEarly) return 'ea'
		if (this.isOk) return 'ok'
		if (this.isNotWork) return 'no'
		if (!this.isWeekDay) return 'wk'
		return 'uk'
	}

	get statusText() {
		switch (this.status) {
			case 'la':
				return 'Đi muộn'
			case 'ea':
				return 'Về sớm'
			case 'bo':
				return 'Cả hai'
			case 'ok':
				return 'Đủ công'
			case 'no':
				return 'Không công'
			case 'wk':
				return 'Cuối tuần'
			case 'uk':
				return ''
			default:
				return ''
		}

	}

	get isReasonable(): boolean {
		const now = new Date()
		const date = new Date(this.date)
		if (now.getMonth() - date.getMonth() > 1) return false
		return now.getDate() <= ConfigService.config.maxReasonLimit
	}
}