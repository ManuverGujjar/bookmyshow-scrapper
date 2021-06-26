import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "MovieGenre" })
export default class MovieGenre extends BaseEntity {
	@PrimaryGeneratedColumn({ name: "ID" })
	id: number;

	@Column({ name: "MovieID" })
	movieId: number;

	@Column({ name: "GenreID" })
	genreId: number;
}
