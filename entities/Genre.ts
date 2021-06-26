import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Genres" })
export default class Genre extends BaseEntity {
	@PrimaryGeneratedColumn({ name: "ID" })
	id: number;

	@Column({ name: "Name" })
	name: string;
}
