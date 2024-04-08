const auditErrorSound = new buzz.sound("/sounds/audit-error.wav")
const auditSuccessSound = new buzz.sound("/sounds/audit-success.wav")
const locationErrorSound = new buzz.sound("/sounds/location-error.mp3")
const locationSuccessSound = new buzz.sound("/sounds/location-success.mp3")
const warningSound = new buzz.sound("/sounds/warning.mp3")
const errorSound = new buzz.sound("/sounds/error.mp3")

const locationRegex = /^L:(.+)$/

let token
let typeTimeout
let flashTimeout
let one_item
let last_item

let current = {}
let cursor = 0

let newUserForm

window.addEventListener('DOMContentLoaded', () => {
	token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

	newUserForm = {
		barcode: document.querySelector('#new-user form [name="barcode"]'),
		name: document.querySelector('#new-user form [name="name"]'),
		email: document.querySelector('#new-user form [name="email"]'),
		course: document.querySelector('#new-user form [name="course"]'),
		year: document.querySelector('#new-user form [name="year"]')
	}

	focus()

	document.addEventListener('keydown', handleKeyboardPress)
	document.querySelector('#find input').addEventListener('input', handleFindInput)
	document.querySelector('#find').addEventListener('submit', handleIssueSubmit)
	document.querySelector('#return').addEventListener('submit', handleReturnSubmit)
	document.querySelector('#audit').addEventListener('submit', handleAuditSubmit)
	document.querySelector('#label').addEventListener('submit', handleLabelSubmit)
	document.querySelector('#new-user form').addEventListener('submit', handleUserSubmit)
	document.querySelectorAll('#mode .nav-link').forEach((elm) => {
		elm.addEventListener('shown.bs.tab', () => {focus()})
	})
})

function findTimer() {
	find(document.querySelector('#find input').value, (data) => {
		empty()

		let last_item

		// Process items
		if (data.items.length > 0) {
			for (i in data.items) {
				last_item = data.items[i]
				last_item.type = 'item'
				addResult(data.items[i])
			}
		} else {
			addResult({name: 'No items found', type:'item', disable: true})
		}

		// Process users
		if (data.users.length > 0) {
			for (i in data.users) {
				last_item = data.users[i]
				last_item.type = 'user'
				addResult(data.users[i])
			}
		} else {
			addResult({name: 'No users found', type:'user', disable: true})
		}

		if (data.items.length > data.users.length) {
			document.querySelector('.items a').click()
		} else {
			document.querySelector('.users a').click()
		}

		if (data.users.length + data.items.length == 1) one_item = last_item
	})
}

function updateCurrent() {
	select(current.type, current.barcode)
}

function select(type, barcode) {
	switch (type) {
		case 'user':
			getUser(barcode, (data) => {
				if (data.html) {
					addModule(data)
					focus()
				} else {
					flash(data)
				}
			})
			break
		case 'item':
			if (current && current.type == 'user') {
				issue(barcode, current.barcode, false, handleItemIssue)
			} else {
				getItem(barcode, (data) => {
					if (data.html) {
						addModule(data)
					}
				})
			}
			break
	}
}

function handleItemIssue(data) {
	lazyResetKioskTimer()
	if (data.status) flash(data)
	updateCurrent()
}

function flash(data) {
	const flashLimit = 3
	const activeTab = document.querySelector('#mode .nav-link.active').href.split('#')[1]

	const flashes = document.querySelectorAll(`#${activeTab} .alert`)
	// Trim the list
	if (flashes && flashes.length >= flashLimit) {
		Array.from(flashes).slice(flashLimit-1).forEach(elm => {
			elm.remove()
		})
	}

	// Play alert sounds
	if (data.status == 'warning') warningSound.play()
	if (data.status == 'danger') errorSound.play()

	// Create alert flash
	const flashElm = document.createElement('div')
	flashElm.classList.add('alert')
	flashElm.classList.add(`alert-${data.status}`)
	flashElm.innerHTML = data.message

	// Create and prepend barcode if it exists
	if (data.barcode) {
		const barcodeElm = document.createElement('strong')
		barcodeElm.innerText = `${data.barcode}: `
		flashElm.prepend(barcodeElm)
	}

	if (data.override) {
		// Remove existing override buttons
		document.querySelectorAll('button.override').forEach(elm => {
			elm.remove()
		})

		// Create and append override button with event handler
		const overrideElm = document.createElement('button')
		overrideElm.className = 'btn btn-sm float-end override'
		overrideElm.classList.add(`btn-outline-${data.status}`)
		overrideElm.innerText = 'Override'
		flashElm.append(overrideElm)
		overrideElm.addEventListener('click', handleOverride)
	}

	// Append flash alert to active tab and set timeout
	document.getElementById(activeTab).prepend(flashElm)
	setTimeout(function() {flashElm.remove()}, 5000)
}

function addModule(data) {
	const moduleLimit = 10
	const modulesElm = document.querySelector('#modules')

	clearActive()

	// Remove exiting if it exists
	const existingElm = document.querySelector(`#modules [data-barcode="${data.barcode}"]`)
	if (existingElm) existingElm.remove()

	if (data.type == 'user') {
		current = data
		document.querySelector('.find').classList.add('bg-primary')
		document.querySelector('#results .items a').click()
	} else {
		current = null
	}

	const parser = new DOMParser()
	const moduleDOM = parser.parseFromString(data.html, 'text/html')
	const moduleElm = moduleDOM.body.childNodes[0]
	modulesElm.prepend(moduleElm)

	moduleElm.querySelectorAll('[data-btn-action]').forEach((elm) => {
		elm.addEventListener('click', handleItemButtons)
	})

	moduleElm.querySelector('.card-header').addEventListener('click', handlePanelClick)

	// Trim the list
	if (modulesElm && modulesElm.children.length >= moduleLimit) {
		Array.from(modulesElm.children).slice(moduleLimit-1).forEach((elm) => {
			elm.remove();
		})
	}

	setTimeout(() => {
		modulesElm.remove()
		if (document.querySelectorAll('#modules .bg-primary')) clearActive()
	}, 60000)

}
function addResult(result, type) {
	const statusElm = document.createElement('span')
		statusElm.classList.add('badge')
		statusElm.innerHTML = '&nbsp;'

		if (result.type == 'item') {
			if (result.loanable) {
				switch (result.status) {
					case 'available':
						statusElm.classList.add('text-bg-success')
						break
					case 'on-loan':
						statusElm.classList.add('text-bg-danger')
						break
					case 'lost':
					case 'broken':
						statusElm.classList.add('text-bg-warning')
						break
					default:
						statusElm.classList.add('text-bg-secondary')
						break
				}
			} else {
				statusElm.classList.add('text-bg-info')
			}
		} else if (result.type = 'user') {
			if (result.disable) {
				statusElm.classList.add('text-bg-secondary')
			} else {
				statusElm.classList.add('text-bg-success')
			}
		}

		const resultElm = document.createElement('li')
			resultElm.dataset.type = result.type
			resultElm.classList.add('list-group-item')

			const resultNameElm = document.createElement('strong')
			resultNameElm.innerText = result.name
			resultElm.appendChild(resultNameElm)

			if (result.barcode) {
				const resultBarcodeElm = document.createElement('div')
				resultBarcodeElm.innerText = result.barcode
				resultBarcodeElm.prepend(statusElm)

				resultElm.dataset.barcode = result.barcode
				resultElm.appendChild(resultBarcodeElm)
		}


	if (result.disable) resultElm.classList.add('disabled')
	resultElm.addEventListener('click', handleResultClick)
	document.querySelector(`#results #${result.type}s .list-group`).appendChild(resultElm)
}

function issue(item, user, override, cb) {
	let query = ''
	last_item = {
		item: item,
		user: user
	}
	if (override) query += '?override=true'
	apiPOST(`/issue/${item}/${user}${query}`, cb)
}
function returnItem(item, cb) {
	apiPOST(`/return/${item}`, cb)
}
function broken(item, cb) {
	apiPOST(`/broken/${item}`, cb)
}
function lost(item, cb) {
	apiPOST(`/lost/${item}`, cb)
}
function sold(item, cb) {
	apiPOST(`/sold/${item}`, cb)
}
function label(item, cb) {
	apiPOST(`/label/${item}`, cb)
}
function audit(item, location, override, cb) {
	apiPOST(`/audit/${item}`, {
		location: location,
		override: override
	}, cb)
}
function newUser(name, barcode, email, course, year, cb) {
	apiPOST(`/new-user`, {
		name: name,
		barcode: barcode,
		email: email,
		course: course,
		year: year
	}, cb)
}
function find(barcode, cb) {barcode ? apiGET(`/find/${barcode}`, cb) : null}
function getItem(barcode, cb) {apiGET(`/item/${barcode}`, cb)}
function getUser(barcode, cb) {apiGET(`/user/${barcode}`, cb)}
function identify(barcode, cb) {apiGET(`/identify/${barcode}`, cb)}

function empty(clear) {
	one_item = null

	document.querySelectorAll('#results #users ul li').forEach((el) => el.remove())
	document.querySelectorAll('#results #items ul li').forEach((el) => el.remove())

	if (clear)
		document.querySelector('#find input').value = ''
}

function clearActive() {
	empty(true)
	current = {}
	document.querySelector('.find').classList.remove('bg-primary')
	document.querySelector('#results .users a').click()
	if (document.querySelector('#modules .bg-primary')) {
		document.querySelector('#modules .bg-primary').classList.add('bg-dark')
		document.querySelector('#modules .bg-primary').classList.remove('bg-primary')
	}
}

function handleKeyboardPress(e) {
	lazyResetKioskTimer()

	// Escape - empty search or close it
	if (e.which == 27 && !(searchInput && document.activeElement === searchInput)) {
		clearActive()
		focus()
	}

	// Alt +
	if (e.altKey && e.shiftKey) {
		e.preventDefault()
		switch(e.which) {
			case 73: // I
				document.querySelector('.issue.nav-link').click()
				break
			case 82: // R
				document.querySelector('.return.nav-link').click()
				break
			case 78: // N
				document.querySelector('.new-user.nav-link').click()
				break
			case 76: // L
				document.querySelector('.print.nav-link').click()
				break
			case 65: // A
				document.querySelector('.audit.nav-link').click()
				break
			case 88: // X
				if (typeof kioskLogout == 'function') kioskLogout()
				break
			default:
				// console.log(e.which)
				break
		}
	}
}

function handleIssueSubmit(e) {
	lazyResetKioskTimer()
	e.preventDefault()
	clearTimeout(typeTimeout)

	if (one_item) {
		select(one_item.type, one_item.barcode)
		one_item = null
		return
	}
	const term = document.querySelector('#find input').value
	identify(term, function(data) {
		if (data.kind == 'unknown') {
			document.querySelector('.new-user.nav-link').click()
			document.querySelector('#new-user #barcode').value = term
			flash({status: 'warning', message: 'Unknown barcode', barcode: term})
			document.querySelector('#new-user [name=name]').focus()
		} else {
			select(data.kind, data.barcode)
			empty(true)
		}
	})
}

function handleReturnSubmit(e) {
	lazyResetKioskTimer()
	e.preventDefault()

	const term = document.querySelector('#return input').value
	document.querySelector('#return input').value = ''

	returnItem(term, (data) => {
		if (data) {
			flash(data)
		} else {
			flash({status: 'danger', message: 'Unknown item', barcode: term})
		}
	})
}

function focus() {
	lazyResetKioskTimer()
	const activeTab = document.querySelector('#mode .nav-link.active').href.split('#')[1]

	switch(activeTab) {
		case 'return':
			document.querySelector('#return input').focus()
			break
		case 'issue':
			document.querySelector('#find input').focus()
			break
		case 'audit':
			document.querySelector('#audit input').focus()
			break
		case 'label':
			document.querySelector('#label input').focus()
			break
		case 'new-user':
			document.querySelector('#new-user input[name="barcode"]').focus()
			break
	}
}

function handleItemButtons() {
	lazyResetKioskTimer()

	const clicked = this.closest('.card')
	const type = clicked.dataset.type
	const barcode = clicked.dataset.barcode

	switch (this.dataset.btnAction) {
		case 'return':
			returnItem(barcode, (data) => {
				flash(data)
				select('item', data.barcode)
			})
			break
		case 'broken':
			broken(barcode, (data) => {
				flash(data)
				select('item', data.barcode)
			})
			break
		case 'lost':
			lost(barcode, (data) => {
				flash(data)
				select('item', data.barcode)
			})
			break;
		case 'sold':
			sold(barcode, (data) => {
				flash(data)
				select('item', data.barcode)
			})
			break;
	}
}

function handleOverride() {
	lazyResetKioskTimer()
	if (last_item) {
		issue(last_item.item, last_item.user, true, handleItemIssue)
		this.parentElement.remove()
	}
}

function handleResultClick() {
	lazyResetKioskTimer()

	const type = this.dataset.type
	const barcode = this.dataset.barcode

	if (this.classList.contains('disabled')) return flash({status: 'warning', message: 'Cannot select a disabled user account'})

	select(type, barcode)
	empty(true)
}

function handlePanelClick() {
	lazyResetKioskTimer()
	const clicked = this.closest('.card')
	select(clicked.dataset.type, clicked.dataset.barcode)
}

function handleFindInput(e) {
	lazyResetKioskTimer()
	if (document.querySelector('#find input').value == '') empty()
	clearTimeout(typeTimeout)
	typeTimeout = setTimeout(findTimer, 100)
}

function handleAuditSubmit(e) {
	e.preventDefault()

	const barcodeInput = document.querySelector('#audit input')

	const term = barcodeInput.value
	barcodeInput.value = ''

	const locationMatch = term.match(locationRegex)
	if (locationMatch) {
		const child = document.querySelector('#location option[data-barcode="' + locationMatch[1].trim() + '"]')

		if (child) {
			document.querySelector('#location').value = child.value
			locationSuccessSound.play()
			flash({
				barcode: locationMatch[1],
				message: 'Location changed',
				status: 'success'
			})
		} else {
			locationErrorSound.play()
			flash({
				barcode: locationMatch[1],
				message: 'Unknown location',
				status: 'danger'
			})
		}
	} else {
		let location = document.querySelector('#location').value
		let mode = document.querySelector('#locationMode').value
		const override = false
		if (mode == 3) override = true
		if (mode == 1) location = null
		audit(term, location, override, (data) => {
			if (data.status == 'success') auditSuccessSound.play()
			if (data.status == 'danger') auditErrorSound.play()
			flash(data)
		})
	}
}

function handleLabelSubmit(e) {
	e.preventDefault()
	lazyResetKioskTimer()

	const barcodeInput = document.querySelector('#label input')

	const term = barcodeInput.value
	barcodeInput.value = ''

	label(term, (data) => {
		flash(data)
	})
}

function handleUserSubmit(e) {
	e.preventDefault()
	lazyResetKioskTimer()

	const barcode = newUserForm.barcode.value
	const name = newUserForm.name.value
	const email = newUserForm.email.value
	const course = newUserForm.course.value
	const year = newUserForm.year.value

	newUser(name, barcode, email, course, year, function(data) {
		if (data.status == 'success') {
			select(data.redirect.type, data.redirect.barcode)
			document.querySelector('a.issue').click()
			clearUserForm()
		}
		flash(data)
	})
}

function clearUserForm() {
	newUserForm.barcode.value = ''
	newUserForm.name.value = ''
	newUserForm.email.value = ''
	newUserForm.course.value = ''
	newUserForm.year.value = ''
}

function lazyResetKioskTimer() {
	if (typeof resetKioskTimer == 'function') {
		resetKioskTimer()
	}
}
