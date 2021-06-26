import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Actors" })
export default class Actor extends BaseEntity {
	@PrimaryGeneratedColumn({ name: "ID" })
	id: number;

	@Column({ name: "FullName" })
	name: string;

	@Column({ name: "ImageUrl" })
	imageUrl: string;

	@Column({ name: "DOB" })
	dob: Date;

	@Column({ name: "BirthPlace" })
	birthPlace: string;

	@Column({ name: "Description" })
	description: string;

	@Column({ name: "URL" })
	url: string;
}
