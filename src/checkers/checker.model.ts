import { Column, Model, Table, HasMany, PrimaryKey, DataType } from 'sequelize-typescript';
import { randomUUID, UUID } from 'node:crypto';

@Table({ tableName: 'checkers' })
export class Checker extends Model {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: randomUUID })
	declare id: UUID

	@Column
	username: string;

	@Column
	password: string
}
