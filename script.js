"use strict"

import API_KEY from "./apikey.js"

const movieListEl = document.getElementById(`movie-list`)
const movieItemEl = document.getElementById(`movie-item`)
const formBoxEl = document.getElementById(`form-box`)
const searchBoxInput = document.getElementById(`search-box`)
const searchBoxBtn = document.getElementById(`btn-search`)
const movieDropdown = document.getElementById(`movie-dropdown`)
const movieDropdownList = document.getElementById(`movie-dropdown-list`)

document.addEventListener(`click`, function (e) {
  if (e.target.dataset.movie) {
    localStorage.setItem(`movieID`, e.target.dataset.movie)
    window.location.href = "single-movie.html"
  } else if (e.target.dataset.add) {
    addToWatchlist(e.target.dataset.add)
  }
})

function addToWatchlist(movieItemToAdd) {
  const addMovieID = movieItemToAdd
  let watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)) || []
  const movieClickedEl = document.querySelector(`[data-add="${movieItemToAdd}"]`)

  if (!watchlistArray.includes(addMovieID)) {
    watchlistArray.push(addMovieID)
    localStorage.setItem(`watchlist`, JSON.stringify(watchlistArray))

    movieClickedEl.classList.remove(`btn-add`)
    movieClickedEl.classList.add(`btn-remove`)
  } else {
    watchlistArray = watchlistArray.filter((id) => id !== addMovieID)
    localStorage.setItem(`watchlist`, JSON.stringify(watchlistArray))
    movieClickedEl.classList.add(`btn-add`)
    movieClickedEl.classList.remove(`btn-remove`)
  }
}

formBoxEl.addEventListener(`submit`, function (e) {
  e.preventDefault()
  const userSearchInput = searchBoxInput.value

  renderMovies(userSearchInput)
  searchBoxInput.value = ``
})

async function renderMovies(searchInput) {
  const response = await fetch(`http://www.omdbapi.com/?s=${searchInput}&apikey=${API_KEY}`)
  const data = await response.json()

  const searchResults = data.Search
  let movieHTMLString = ``

  if (data.Response === `True`) {
    const watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)) || []

    for (let movie of searchResults) {
      const posterImg = movie.Poster !== `N/A` ? movie.Poster : `images/no-poster.png`

      movieHTMLString += `
            <li class="movie-item" id="movie-item">
                <div class="movie-poster-container">
                    <img src="${posterImg}" alt="${movie.Title} poster" data-movie="${movie.imdbID}" />
                    <button class="btn-round-add ${watchlistArray.includes(movie.imdbID) ? `btn-remove` : `btn-add`}" data-add="${movie.imdbID}">
                    </button>
                </div>
                <p class="text-small">${movie.Type}</p>
                <p class="movie-title" data-movie="${movie.imdbID}">${movie.Title}</p>
                <ul>
                    <li>${movie.Year}</li>
                </ul>
            </li>
        `
    }
  } else {
    movieHTMLString += `
    <li class="no-results">
        <img src="images/logo-magnifying-glass.png" alt="Magnifying glass" />
        <h2>Sorry, we couldn't find what you're looking for</h2>
    </li>
    `
  }

  movieListEl.innerHTML = movieHTMLString
}
