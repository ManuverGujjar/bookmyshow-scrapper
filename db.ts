import "reflect-metadata";
import { createConnection } from "typeorm";
import { promisify } from "util";
import Actor from "./entities/Actor";
import Movie from "./entities/Movie";
import MovieGenre from "./entities/MovieGenre";
import Genre from "./entities/Genre";
import MovieActor from "./entities/MovieActor";
import { IArtist, IMovie, IMovieActor } from "./interfaces";
import BookMyShow from "./app";

const MAX_CAST = 10;
const MAX_CREW = 10;

export const connectDB = async () => {
	const connection = await createConnection({
		type: "sqlite",
		database:
			"/Users/manuver/Projects/BookMyShowAPI/BookMyShowAPI/bookmyshow.db",
		entities: ["out/entities/*.js"],
	});
};

export const addActor = async (actor: IArtist, fallBack: IMovieActor) => {
	if (actor == null) {
		actor = {};
		actor.name = fallBack.name;
	}

	if (!!actor.dob && !/^[a-zA-Z]{3} [0-9]{2}, [0-9]{4}$/gm.test(actor.dob)) {
		actor.dob = null;
	}
	const newActor = Actor.create({ ...actor });
	return newActor.save();
};

export const addMovie = async (movie: IMovie, instance: BookMyShow) => {
	if (!!(await Movie.findOne({ where: { imageUrl: movie.imageUrl } })))
		return;

	const newMovie = new Movie();
	newMovie.ageRating = movie.ageRating;
	newMovie.description = movie.description;
	newMovie.imageUrl = movie.imageUrl;
	newMovie.language = movie.language;
	newMovie.name = movie.name;
	newMovie.releaseDate = new Date(Date.parse(movie.releaseDate));
	newMovie.length = movie.length;

	await newMovie.save();

	for (let mGenre in movie.genre) {
		let genre = await Genre.findOne({ where: { name: mGenre } });
		if (!genre) {
			genre = new Genre();
			genre.name = mGenre;
			await genre.save();
		}

		const movieGenre = new MovieGenre();
		movieGenre.genreId = genre.id;
		movieGenre.movieId = newMovie.id;
		await movieGenre.save();
	}

	let len = 0;
	for (let cast of movie.cast) {
		if (len == MAX_CAST) break;
		let actor = await Actor.findOne({ where: { url: cast.href } });

		if (!actor) {
			actor = await addActor(await instance.getActor(cast.href), cast);
		}

		const movieActor = new MovieActor();
		movieActor.actorId = actor.id;
		movieActor.movieId = newMovie.id;
		movieActor.role = cast.role;
		movieActor.type = "Cast";
		await movieActor.save();
		len++;
	}

	len = 0;
	for (let crew of movie.crew) {
		if (len == MAX_CREW) break;
		let actor = await Actor.findOne({ where: { url: crew.href } });

		if (!actor) {
			actor = await addActor(await instance.getActor(crew.href), crew);
		}

		const movieActor = new MovieActor();
		movieActor.actorId = actor.id;
		movieActor.movieId = newMovie.id;
		movieActor.role = crew.role;
		movieActor.type = "Crew";
		await movieActor.save();
		len++;
	}
};
