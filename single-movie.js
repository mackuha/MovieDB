"use strict"

import API_KEY from "./apikey.js"

const singleMovieEl = document.getElementById(`single-movie-container`)
const searchFormHeader = document.getElementById(`search-form-header`)
const searchInputEl = document.getElementById(`search-input`)
const movieDropdownEl = document.getElementById(`movie-dropdown-container`)
const noResultsEl = document.getElementById(`no-results-popup`)

const storedMovieId = localStorage.getItem("movieID")

renderSingleMovie(storedMovieId)

searchFormHeader.addEventListener(`submit`, function (e) {
  e.preventDefault()
  movieDropdownEl.style.display = `block`
  movieDropdownEl.scrollTo(0, 0)
  renderSuggestions(searchInputEl.value)
})

document.addEventListener(`click`, function (e) {
  if (e.target.dataset.movie) {
    searchInputEl.value = ``
    movieDropdownEl.style.display = `none`
    renderSingleMovie(e.target.dataset.movie)
  } else if (e.target.dataset.add) {
    addToWatchlist(e.target.dataset.add)
  }
})

function addToWatchlist(movieItemToAdd) {
  const addMovieID = movieItemToAdd
  const btnAdd = document.getElementById(`btn-add`)
  let watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)) || []

  if (!watchlistArray.includes(addMovieID)) {
    watchlistArray.push(addMovieID)
    localStorage.setItem(`watchlist`, JSON.stringify(watchlistArray))
    btnAdd.classList.add(`btn-remove`)
    btnAdd.classList.remove(`btn-add`)
  } else {
    watchlistArray = watchlistArray.filter((id) => id !== addMovieID)
    localStorage.setItem(`watchlist`, JSON.stringify(watchlistArray))
    btnAdd.classList.add(`btn-add`)
    btnAdd.classList.remove(`btn-remove`)
  }
}

async function renderSuggestions(searchInput) {
  const response = await fetch(`https://www.omdbapi.com/?s=${searchInput}&apikey=${API_KEY}`)
  const data = await response.json()

  const searchResults = data.Search
  let movieHTMLString = ``

  if (data.Response === `True`) {
    for (let movie of searchResults) {
      const posterImg = movie.Poster !== `N/A` ? movie.Poster : `images/no-poster.png`

      movieHTMLString += `
            <li class="movie-dropdown-item" data-movie="${movie.imdbID}">
                <img src="${posterImg}" alt="${movie.Title} poster" />
                <div class="movie-item-data">
                    <p class="text-small">${movie.Type}</p>
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                </div>
            </li>
            `
    }
  } else {
    noResultsEl.style.display = `block`

    setTimeout(() => {
      noResultsEl.style.display = `none`
    }, 2000)
  }

  movieDropdownEl.innerHTML = movieHTMLString
}

async function renderSingleMovie(storedMovieId) {
  const response = await fetch(`https://www.omdbapi.com/?i=${storedMovieId}&plot=full&apikey=${API_KEY}`)
  const data = await response.json()

  const posterImg = data.Poster !== `N/A` ? data.Poster : `images/no-poster.png`
  const isSeries = data.Type === `series` ? true : false
  const seasonsCount = `${data.totalSeasons} seasons`
  const ratingsArray = data.Ratings
  let rottenTomatoesRating = ``

  const watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)) || []

  const isAddedToWatchlist = watchlistArray.includes(data.imdbID) ? `btn-remove` : `btn-add`

  for (let { Source, Value } of ratingsArray) {
    if (Source === `Rotten Tomatoes`) {
      rottenTomatoesRating = `
            <img src="images/logo-rotten-tomatoes.png" alt="Rotten Tomatoes logo" />
            <span>${Value}</span>
        `
    }
  }

  singleMovieEl.innerHTML = `
  <img src="${posterImg}" alt="${data.Title} movie poster" class="single-movie-poster" />
        <div class="movie-details">
          <div class="movie-subheader">
            <span class="rated rated-${data.Rated}">${data.Rated}</span>
            <span class="capitalize">${data.Type}</span>
            <span>${isSeries ? seasonsCount : ``}</span>
          </div>
          <h1>${data.Title}</h1>
          <div class="movie-subheader text-white">
            <span>${data.Year}</span>
            <span>${data.Genre}</span>
            <span>${data.Runtime !== `N/A` ? data.Runtime : ``}</span>
          </div>
          <div class="movie-critic-rating">
            <span class="critic-rating">
              <img src="images/logo-imdb.png" alt="IMDB logo" />
              <span>${data.imdbRating}</span>
              ${rottenTomatoesRating}
            </span>
          </div>
          <p class="plot">${data.Plot}</p>
          <button class="btn ${isAddedToWatchlist}" id="btn-add" data-add="${data.imdbID}"></button>
          <div class="divider"></div>
          <div class="movie-meta-desc">
            <h3>Actors</h3>
            <p>${data.Actors}</p>
            <h3>Director</h3>
            <p>${data.Director}</p>
            <h3>Writer</h3>
            <p>${data.Writer}</p>
            <h3>Released</h3>
            <p>${data.Released}</p>
            <h3>Box office</h3>
            <p>${data.BoxOffice || `N/A`}</p>
            <h3>Awards</h3>
            <p>${data.Awards}</p>
          </div>
        </div>
  `
}
