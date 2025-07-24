let searchTypeTimeout
let searchInput
let searchList
let modalCover

let searchSelectIndex = -1;

const icons = {
	items: 'box',
	users: 'users',
	courses: 'user-graduate',
	groups: 'object-group',
	locations: 'location-arrow',
	years: 'user-clock'
}

const titles = {
	items: 'Items',
	users: 'Users',
	courses: 'Courses',
	groups: 'Groups',
	locations: 'Locations',
	years: 'Years'
}

// API Search Function
function search(term, cb) {term ? apiGET(`/api/search/${term}`, cb) : null}

window.addEventListener('load', () => {
	searchInput = document.getElementById('search')

	if (searchInput) {
		searchInput.addEventListener('input', handleSearchInput)
		searchInput.addEventListener('focus', handleSearchInputFocus)
		window.addEventListener('resize', positionsearchList)
	}
	document.addEventListener('keydown', handleKeyboardInput)
})

function handleKeyboardInput(e) {
	// Alt + K - Go to kiosk
	if (e.altKey && e.shiftKey && e.which == 75) {
		e.preventDefault()
		window.location = '/checkout'
	}

	if (searchInput) {
		// Alt + F - open search
		if (e.altKey && e.shiftKey && e.which == 70) {
			e.preventDefault()
			searchInput.focus()
		}

		if (document.activeElement === searchInput) {
			// Escape - empty search or close it
			if (e.which == 27) {
				e.preventDefault()

				if (searchInput.value == '') {
					searchInput.blur()
					removeSearchList()
				} else {
					searchInput.value = ''
					clearSearchResults()
					removeSearchList()
				}
			}

			const numResults = document.querySelectorAll('.searchList a:not([style*="display: none;"]').length
			if (numResults > 0) {
				if (e.which == 40) {
					e.preventDefault()
					searchSelectIndex++
					if (searchSelectIndex > document.querySelectorAll('.searchList a:not([style*="display: none;"]').length - 1) {
						searchSelectIndex = 0
					}
					moveSearchSelection()
				} else if (e.which == 38) {
					e.preventDefault()
					searchSelectIndex--
					if (searchSelectIndex < 0) {
						searchSelectIndex = document.querySelectorAll('.searchList a:not([style*="display: none;"]').length - 1
					}
					moveSearchSelection()
				} else if (e.which == 13) {
					e.preventDefault()
					if (numResults == 1) {
						document.querySelectorAll('.searchList a:not([style*="display: none;"]')[0].click()
					} else if (searchSelectIndex != -1) {
						document.querySelectorAll('.searchList a:not([style*="display: none;"]')[searchSelectIndex].click()
					}
				}
			}
		}
	}
}

function moveSearchSelection() {
	document.querySelectorAll('.searchList a.selected').forEach((el) => {el.classList.remove('selected')})

	const selected = document.querySelectorAll('.searchList a:not([style*="display: none;"]')[searchSelectIndex]
	if (selected) {
		selected.classList.add('selected')
		selected.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
	}
}

function handleSearchInputFocus() {
	if (searchInput.value) {
		searchTimer()
		searchInput.setSelectionRange(searchInput.selectionStart, searchInput.selectionEnd)
	}
}

function searchTimer() {
	if (!searchInput || searchInput.value) {
		createsearchList()
	}

	search(searchInput.value, (data) => {
		clearSearchResults()

		let total_results = 0
		const data_types = Object.keys(data)
		data_types.forEach((type) => {
			processDataSet(type, data[type])
			total_results += data[type].length
		})

		if (total_results == 0) {
			addNoResultsFound()
		}
	})
}

function processDataSet(type, data) {
	if (data.length > 0) {
		lazyAddSearchDIV(type, titles[type], icons[type])

		for (i in data) {
			addSearchResult(data[i], type, type, i > 4 ? 'none' : '')
		}

		if (data.length > 5) addOverflow(type)
	}
}

function lazyAddSearchDIV(type, title, faclass) {
	if (searchList && !searchList.querySelector(`[data-type='${type}']`)) {
		const div = document.createElement('div')
		div.dataset.type = type

		const heading = document.createElement('h3')

		const span = document.createElement('span')
		span.classList.add('fa')
		span.classList.add('me-2')
		span.classList.add(`fa-${faclass}`)
		heading.appendChild(span)

		heading.innerHTML += title

		searchList.appendChild(div)
		searchList.insertBefore(heading, div)
	}
}

function handleSearchInput(e) {
	if (searchInput.value == '') removeSearchList()
	clearTimeout(searchTypeTimeout)
	searchTypeTimeout = setTimeout(searchTimer, 100)
}

function clearSearchResults() {
	searchSelectIndex = -1
	if (searchList) searchList.innerText = ''
}

function addOverflow(type) {
	const a = document.createElement('a')
	a.classList.add('overflow')

	const span = document.createElement('span')
	span.classList.add('fas')
	span.classList.add('fa-ellipsis-h')
	a.appendChild(span)

	searchList.querySelector(`[data-type=${type}]`).appendChild(a)
	a.addEventListener('click', (e) => {

		// Reval extra search results
		e.target.parentElement.querySelectorAll('.object').forEach((elm) => {
			elm.style.display = ''
			setTimeout(() => {
				elm.classList.remove('closed')
			},1)
		})

		// Hide overflow item
		e.target.classList.add('closed')

		moveSearchSelection()
	})
}

function addSearchResult(object, type, path, display) {
	const a = document.createElement('a')
	a.classList.add('object')
	a.href = `/${path}/${object.id}`
	a.style.display = display
	if (display == 'none') a.classList.add('closed')

	if (type == 'items') a.appendChild(createStatusBadge(object.status, object.loanable))
	a.innerHTML += `<strong>${object.name}</strong>`
	if (object.barcode) a.innerHTML += `<br>${object.barcode}`

	searchList.querySelector(`[data-type=${type}]`).appendChild(a)
}

function addNoResultsFound() {
	searchList.innerHTML = '<p>No results</p>'
}

function createStatusBadge(status, loanable) {
	const span = document.createElement('span')
	span.classList.add('badge')
	span.classList.add('me-1')
	span.innerHTML = '&nbsp;'

	let badgeClass = 'default'

	switch (status) {
		case 'unavailable':
			badgeClass = 'success'
			break
		case 'available':
			badgeClass = 'success'
			break
		case 'on-loan':
			badgeClass = 'danger'
			break
		case 'lost':
		case 'broken':
			badgeClass = 'warning'
			break
		case undefined:
			break
		default:
			badgeClass = 'default'
			break
	}

	if (loanable) badgeClass = 'info'

	span.classList.add(`bg-${badgeClass}`)
	return span
}

function createsearchList() {
	document.body.classList.add('noScroll')

	// Make search a modal
	if (!modalCover) {
		modalCover = document.createElement('div')
		modalCover.classList.add('modalCover')
		document.body.appendChild(modalCover)

		modalCover.addEventListener('click', () => {
			removeSearchList()
		})
	}
	// Fade in modalCover
	setTimeout(() => {
		modalCover.style.display = ''
		modalCover.classList.add('open')
	}, 1)

	// Add search dropdown
	if (!searchList) {
		searchList = document.createElement('div')
		searchList.classList.add('searchList')
		positionsearchList()
		document.body.appendChild(searchList)
	}

	// Slide down searchList
	setTimeout(() => {searchList.classList.add('open')}, 1)
}

function positionsearchList() {
	if (searchList) {
		const searchInputPosition = searchInput.getBoundingClientRect()
		const navbarPosition = document.querySelector('nav.navbar').getBoundingClientRect()
		searchList.style.top = `${navbarPosition.bottom}px`
		searchList.style.width = `${searchInputPosition.width}px`
		searchList.style.left = `${searchInputPosition.left}px`
	}
}

function removeSearchList() {
	// Fade out modalCover
	modalCover.classList.remove('open')
	setTimeout(() => {
		modalCover.style = 'display:none'
	}, 400)

	// Slide up searchList
	searchList.classList.remove('open')
	document.body.classList.remove('noScroll')
}
