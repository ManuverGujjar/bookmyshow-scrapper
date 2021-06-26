import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Movies" })
export default class Movie extends BaseEntity {
	@PrimaryGeneratedColumn({ name: "ID" })
	id: number;

	@Column({ name: "Name" })
	name: string;

	@Column({ name: "ReleaseDate" })
	releaseDate: Date;

	@Column({ name: "ImageUrl" })
	imageUrl: string;

	@Column({ name: "AgeRating" })
	ageRating: string;

	@Column({ name: "Language" })
	language: string;

	@Column({ name: "Description" })
	description: string;

	@Column({ name: "Length" })
	length: string;
}
