export interface IMovieActor {
	role?: string;
	name?: string;
	href?: string;
}

export interface IArtist {
	name?: string;
	dob?: string;
	description?: string;
	imageUrl?: string;
	birthPlace?: string;
	url?: string;
}

export interface IMovie {
	name?: string;
	language?: string;
	length?: string;
	ageRating?: string;
	releaseDate?: string;
	meta?: string[];
	genre?: string[];
	description?: string;
	imageUrl?: string;
	cast?: IMovieActor[];
	crew?: IMovieActor[];
}
