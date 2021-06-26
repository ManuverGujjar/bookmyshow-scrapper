import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "MovieActor" })
export default class MovieActor extends BaseEntity {
	@PrimaryGeneratedColumn({ name: "ID" })
	id: number;

	@Column({ name: "MovieID" })
	movieId: number;

	@Column({ name: "ActorID" })
	actorId: number;

	@Column({ name: "Role" })
	role: string;

	@Column({ name: "type" })
	type: string;
}
