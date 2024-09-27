const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMoviesDbObjectToResponseObject = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

const convertMovieDBObjectToResponseObject = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const convertDirectorDBObjectToResponseObject = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};

//Get Movies Name API
app.get("/movies", async (request, response) => {
  const getMoviesNameQuery = `
        SELECT movie_name
        FROM movie
    `;
  const moviesNameArray = await db.all(getMoviesNameQuery);
  response.send(
    moviesNameArray.map((eachMovie) =>
      convertMoviesDbObjectToResponseObject(eachMovie)
    )
  );
});

//Add New Movie API
app.post("/movies", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO 
            movie(director_id, movie_name, lead_actor)
        VALUES
            (
                ${directorId},
                '${movieName}',
                '${leadActor}'
            )
        
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * 
        FROM movie 
        WHERE movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDBObjectToResponseObject(movie));
});

//Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId}
    `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM director
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDBObjectToResponseObject(eachDirector)
    )
  );
});

//Get Director Movie API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id = ${directorId}
    `;
  const directorMovies = await db.all(getDirectorMovieQuery);
  response.send(
    directorMovies.map((eachMovie) =>
      convertMoviesDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
