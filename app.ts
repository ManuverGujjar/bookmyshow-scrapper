import {
	Builder,
	By,
	Key,
	ThenableWebDriver,
	WebElement,
} from "selenium-webdriver";
import { writeFile, writeFileSync, open, write, readFile } from "fs";
import { promisify } from "util";
import { Options } from "selenium-webdriver/chrome";
import * as readline from "readline";
import { exit, stdin, stdout } from "process";
import { IArtist, IMovie, IMovieActor } from "./interfaces/index";
import * as db from "./db";
import { Command } from "selenium-webdriver/lib/command";
import "colors";
const print = console.log;
const debug = (...text: any[]) => console.log(`DEBUG: ${text}`.red);

const input = promisify(
	readline.createInterface({
		input: stdin,
		output: stdout,
	}).question
);

export default class BookMyShow {
	driver: ThenableWebDriver;

	constructor() {
		const options = new Options();
		options.headless();
		options.addArguments(
			"--host-resolver-rules=MAP , MAP *.facebook.com 127.0.0.1, MAP *.google.com 127.0.0.1, MAP *.doubleclick.net 127.0.0.1, MAP *.andbeyond.media 127.0.0.1"
		);

		this.driver = new Builder()
			.forBrowser("chrome")
			.setChromeOptions(options)
			.build();
		const command = new Command("Network.setBlockedURLs");
	}

	start = async () => {
		try {
			const movies: IMovie[] = [];
			const actors: IArtist[] = [];
			const urls = await this.getMoviesUrls(
				"https://in.bookmyshow.com/explore/home/mumbai"
			);

			for (let url of urls) {
				movies.push(await this.getMovie(url));
			}

			await promisify(writeFile)("movies.json", JSON.stringify(movies));

			for (let movie of movies) {
				await db.addMovie(movie, this);
			}
		} catch (e) {
			console.log(e);
		} finally {
			await this.driver.quit();
		}
	};

	startFromJson = async () => {
		await db.connectDB();
		try {
			let movies: IMovie[] = [];

			movies = JSON.parse(
				await promisify(readFile)("movies.json", { encoding: "utf-8" })
			);

			for (let movie of movies) {
				console.log("adding " + movie.name);
				await db.addMovie(movie, this);
				console.log("added");
			}
		} catch (e) {
			console.log(e);
		} finally {
			await this.driver.quit();
			return;
		}
	};

	getMoviesUrls = async (url: string): Promise<string[]> => {
		const allMoviesUrls: string[] = [];

		await this.driver.get(url);
		const newReleases = await this.driver.findElement(
			By.className("cpHHGk")
		);

		for (let newRelease of await newReleases.findElements(
			By.className("iSXRPl")
		)) {
			const href = await newRelease.getAttribute("href");
			allMoviesUrls.push(href);
		}

		return allMoviesUrls;
	};

	async utilGetByType(castCrewInfo: WebElement[], val: string) {
		for (let cci of castCrewInfo) {
			if (
				(
					await cci.findElement(By.className("bLkBmm")).getText()
				).includes(val)
			) {
				return cci;
			}
		}
	}

	getMovie = async (movieUrl: string): Promise<IMovie> => {
		const movie: IMovie = { genre: [], cast: [], crew: [] };

		this.driver.get(movieUrl);
		movie.name = await this.driver
			.findElement(By.className("mptsd"))
			.getText();
		movie.language = await this.driver
			.findElement(By.className("gqLZem"))
			.getText();
		const meta = await this.driver.findElements(By.className("hSMSQi"));
		movie.meta = await (await meta[1].getText())
			.split("\n")
			.join("")
			.split("•");

		movie.length = movie.meta[0];
		movie.ageRating = movie.meta[2];
		movie.releaseDate = movie.meta[3];

		for (let genre of await meta[1].findElements(By.tagName("a"))) {
			movie.genre.push(await genre.getText());
		}

		movie.description = await this.driver
			.findElement(By.className("styles__DescriptionContainer-o4g232-3"))
			.getText();

		movie.imageUrl = await this.driver
			.findElement(By.className("chbdEo"))
			.getAttribute("src");

		const castCrewInfo = await this.driver.findElements(
			By.className("jNvHLC")
		);

		const castList = await this.utilGetByType(castCrewInfo, "Cast");

		const crewList = await this.utilGetByType(castCrewInfo, "Crew");

		for (let cast of await castList.findElements(By.className("blJYPi"))) {
			const href = await cast.getAttribute("href");

			const name = await cast
				.findElement(By.className("jfGPxs"))
				.getText();

			const role = await cast
				.findElement(By.className("eqRnos"))
				.getText();

			movie.cast.push({ name, role, href });
		}

		for (let crew of await crewList.findElements(By.className("blJYPi"))) {
			const href = await crew.getAttribute("href");

			const name = await crew
				.findElement(By.className("jfGPxs"))
				.getText();
			const role = await crew
				.findElement(By.className("eqRnos"))
				.getText();

			movie.crew.push({ name, role, href });
		}

		print(movie);
		return movie;
	};

	async getActor(url: string): Promise<IArtist> {
		this.driver.get(url);

		const artist: IArtist = { url };

		try {
			artist.name = await this.driver
				.findElement(By.className("artist_name"))
				.getText();
		} catch (e) {
			debug(e, url);
			return null;
		}
		try {
			const dob = await this.driver
				.findElement(By.className("artist_dob"))
				.getText();

			artist.dob = dob.substr(6, 12);
			artist.birthPlace = dob.substr(20);
		} catch (e) {
			debug(e, url);
		}

		try {
			artist.description = await this.driver
				.findElement(By.className("biography-body"))
				.getText();

			artist.description = artist.description.split("\n\n")[0];

			artist.imageUrl = await this.driver
				.findElement(By.className("artistPage__detail-poster"))
				.findElement(By.tagName("img"))
				.getAttribute("src");
		} catch (e) {
			debug(e, url);
		}
		print(artist.name);
		return artist;
	}

	close = () => {
		this.driver.quit();
	};
}

const b = new BookMyShow();
b.startFromJson().then(() => exit(0));
// b.getMovie(
// 	"https://in.bookmyshow.com/mumbai/movies/zack-snyders-justice-league/ET00047164"
// );
// b.getActor("https://in.bookmyshow.com/person/ben-affleck/292");
