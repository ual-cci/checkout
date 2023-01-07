let searchTypeTimeout
let searchInput
let searchDropdown
let modalCover

let searchSelectIndex = -1;

const icons = {
	items: 'box',
	users: 'users',
	courses: 'user-graduate',
	groups: 'object-group',
	locations: 'location-arrow',
	departments: 'building',
	years: 'user-clock'
}

const titles = {
	items: 'Items',
	users: 'Users',
	courses: 'Courses',
	groups: 'Groups',
	locations: 'Locations',
	departments: 'Departments',
	years: 'Years'
}

// API Search Function
function search(term, cb) {term ? apiGET('search', term, cb) : null}

jQuery(document).ready(function() {
	searchInput = document.getElementById('search')

	if (searchInput) {
		searchInput.addEventListener('input', handleSearchInput)
		searchInput.addEventListener('focus', handleSearchInputFocus)
		window.addEventListener('resize', positionSearchDropdown)
	}
	document.addEventListener('keydown', handleKeyboardInput)
})

function handleKeyboardInput(e) {

	// console.log(e)

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
					removeSearchDropdown()
				} else {
					searchInput.value = ''
					clearSearchResults()
					jQuery(modalCover).fadeOut()
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
	selected.classList.add('selected')
	selected.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
}

function handleSearchInputFocus() {
	if (searchInput.value) {
		searchTimer()
		searchInput.setSelectionRange(searchInput.selectionStart, searchInput.selectionEnd)
	}
}

function searchTimer() {
	if (!searchInput || searchInput.value) {
		createSearchDropdown()
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
	if (searchDropdown && !searchDropdown.querySelector(`[data-type='${type}']`)) {
		const div = document.createElement('div')
		div.dataset.type = type

		const heading = document.createElement('h3')

		const span = document.createElement('span')
		span.classList.add('fa')
		span.classList.add('me-2')
		span.classList.add(`fa-${faclass}`)
		heading.appendChild(span)

		heading.innerHTML += title

		searchDropdown.appendChild(div)
		searchDropdown.insertBefore(heading, div)
	}
}

function handleSearchInput(e) {
	if (searchInput.value == '') removeSearchDropdown()
	clearTimeout(searchTypeTimeout)
	searchTypeTimeout = setTimeout(searchTimer, 100)
}

function clearSearchResults() {
	searchSelectIndex = -1
	if (searchDropdown) searchDropdown.innerText = ''
}

function addOverflow(type) {
	const a = document.createElement('a')
	a.classList.add('overflow')

	const span = document.createElement('span')
	span.classList.add('fas')
	span.classList.add('fa-ellipsis-h')
	a.appendChild(span)

	searchDropdown.querySelector(`[data-type=${type}]`).appendChild(a)
	a.addEventListener('click', (e) => {
		jQuery(e.target.parentElement.querySelectorAll('.object')).slideDown()
		jQuery(e.target).slideUp()
		moveSearchSelection()
	})
}

function addSearchResult(object, type, path, display) {
	const a = document.createElement('a')
	a.classList.add('object')
	a.href = `/${path}/${object.id}`
	a.style.display = display

	if (type == 'items') a.appendChild(createStatusBadge(object.status))
	a.innerHTML += `<strong>${object.name}</strong>`
	if (object.barcode) a.innerHTML += `<br>${object.barcode}`

	searchDropdown.querySelector(`[data-type=${type}]`).appendChild(a)
}

function addNoResultsFound() {
	searchDropdown.innerHTML = '<p>No results</p>'
}

function createStatusBadge(status) {
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

	span.classList.add(`bg-${badgeClass}`)
	return span
}

function createSearchDropdown() {
	document.body.classList.add('noScroll')

	// Make search a modal
	if (!modalCover) {
		modalCover = document.createElement('div')
		modalCover.classList.add('modalCover')
		modalCover.style.display = 'none'
		document.body.appendChild(modalCover)
		modalCover.addEventListener('click', () => {
			removeSearchDropdown()
		})
	}
	jQuery(modalCover).fadeIn()

	// Add search dropdown
	if (!searchDropdown) {
		searchDropdown = document.createElement('div')
		searchDropdown.classList.add('searchList')
		positionSearchDropdown()
		searchDropdown.style.display = 'none'
		document.body.appendChild(searchDropdown)
	}
	jQuery(searchDropdown).slideDown()

}

function positionSearchDropdown() {
	if (searchDropdown) {
		const searchInputPosition = searchInput.getBoundingClientRect()
		const navbarPosition = document.querySelector('nav.navbar').getBoundingClientRect()
		searchDropdown.style.top = `${navbarPosition.bottom}px`
		searchDropdown.style.width = `${searchInputPosition.width}px`
		searchDropdown.style.left = `${searchInputPosition.left}px`
	}
}

function removeSearchDropdown() {
	jQuery(modalCover).fadeOut()
	jQuery(searchDropdown).slideUp()
	document.body.classList.remove('noScroll')
}
