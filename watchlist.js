"use strict"

require(`dotenv`).config()

const searchFormHeader = document.getElementById(`search-form-header`)
const searchInputEl = document.getElementById(`search-input`)
const movieDropdownEl = document.getElementById(`movie-dropdown-container`)
const movieList = document.getElementById(`movie-list`)
const noResultsEl = document.getElementById(`no-results-popup`)

document.addEventListener(`click`, function (e) {
  if (e.target.dataset.movie) {
    localStorage.setItem(`movieID`, e.target.dataset.movie)
    window.location.href = "single-movie.html"
  } else if (e.target.dataset.add) {
    removeToWatchlist(e.target.dataset.add)
  }
})

function removeToWatchlist(movieID) {
  const watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)).filter((id) => id !== movieID)

  localStorage.setItem(`watchlist`, JSON.stringify(watchlistArray))

  renderWatchlist()
}

renderWatchlist()

async function renderWatchlist() {
  const watchlistArray = JSON.parse(localStorage.getItem(`watchlist`)) || []

  let movieHTMLString = ``
  //   movieList.innerHTML = ``

  if (watchlistArray.length > 0) {
    for (let id of watchlistArray) {
      const response = await fetch(`http://www.omdbapi.com/?i=${id}&apikey=${process.env.API_KEY}`)
      const data = await response.json()

      const posterImg = data.Poster !== `N/A` ? data.Poster : `images/no-poster.png`

      movieHTMLString += `
        <li class="movie-item" id="movie-item">
            <div class="movie-poster-container">
                <img src="${posterImg}" alt="${data.Title} poster" data-movie="${data.imdbID}" />
                <button class="btn-round-add ${watchlistArray.includes(data.imdbID) ? `btn-remove` : `btn-add`}" data-add="${data.imdbID}">
                </button>
            </div>
            <p class="text-small">${data.Type}</p>
            <p class="movie-title" data-movie="${data.imdbID}">${data.Title}</p>
            <ul>
                <li>${data.Year}</li>
            </ul>
        </li>
        `
    }
  } else {
    movieHTMLString = `
    <li class="no-results">
        <img src="images/logo-moviedb-gray.png" alt="MovieDB logo mark" />
        <h2>Nothing to watch yet!</h2>
    </li>
    `
  }
  movieList.innerHTML = movieHTMLString
}

searchFormHeader.addEventListener(`submit`, function (e) {
  e.preventDefault()
  movieDropdownEl.style.display = `block`
  movieDropdownEl.scrollTo(0, 0)
  renderSuggestions(searchInputEl.value)
})

async function renderSuggestions(searchInput) {
  const response = await fetch(`https://www.omdbapi.com/?s=${searchInput}&apikey=${process.env.API_KEY}`)
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
