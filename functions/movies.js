const { URL } = require('url');
const fetch = require('node-fetch');
const movies = require('../data/movies.json');
const { query } = require('./util/hasura')

exports.handler = async () => {
    const { movies } = await query({
        query: `
            query {
                movies {
                id
                poster
                tagline
                title
                }
            }
        `
    })
    const api = new URL('https://www.omdbapi.com/');

    // add the secret API key to query string
    api.searchParams.set('apikey', process.env.OMDB_API_KEY)

    // get every movie scores
    const promises = movies.map((movie) => {

        //  use the movie's IMDb ID to look up details
        api.searchParams.set('i', movie.id);

        return fetch(api)
            .then((response) => response.json())
            .then((data) => {
                const scores = data.Ratings;
                return {
                    ...movie,
                    scores
                };
            });
    });

    const moviesWithRatings = await Promise.all(promises)

    return {
        statusCode: 200,
        body: JSON.stringify(moviesWithRatings),
    }
}
