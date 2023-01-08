var auditErrorSound = new buzz.sound("/sounds/audit-error.wav")
var auditSuccessSound = new buzz.sound("/sounds/audit-success.wav")
var locationErrorSound = new buzz.sound("/sounds/location-error.mp3")
var locationSuccessSound = new buzz.sound("/sounds/location-success.mp3")
var warningSound = new buzz.sound("/sounds/warning.mp3")
var errorSound = new buzz.sound("/sounds/error.mp3")

var locationRegex = /^L:(.+)$/

var token
var typeTimeout
var flashTimeout
var one_item
var last_item

var current = {}
var cursor = 0

jQuery(document).ready(function() {
	token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
	focus()
	jQuery('#find input').bind('input', handleFindInput)
	document.addEventListener('keydown', handleKeyboardPress)
	jQuery('#find').bind('submit', handleIssueSubmit)
	jQuery('#return').bind('submit', handleReturnSubmit)
	jQuery('#audit').bind('submit', handleAuditSubmit)
	jQuery('#label').bind('submit', handleLabelSubmit)
	jQuery('#new-user form').bind('submit', handleUserSubmit)
	jQuery(document).delegate('#modules [data-btn-action]', 'click', handleItemButtons)
	jQuery(document).delegate('#modules .card-header', 'click', handlePanelClick)
	jQuery(document).delegate('#issue .flash .override', 'click', handleOverride)
	jQuery(document).delegate('#results .list-group-item', 'click', handleResultClick)
	jQuery('#mode .nav-link').on('shown.bs.tab', function(a) {focus()})
})



function findTimer() {
	find(jQuery('#find input').val(), function(data) {
		empty()

		var last_item

		// Process items
		if (data.items.length > 0) {
			for (i in data.items) {
				last_item = data.items[i]
				last_item.type = 'item'
				addResult(data.items[i], 'item')
			}
			jQuery('.items a').tab('show')
		}

		// Process users
		if (data.users.length > 0) {
			for (i in data.users) {
				last_item = data.users[i]
				last_item.type = 'user'
				addResult(data.users[i], 'user')
			}
			if (current.type != 'user') jQuery('.users a').tab('show')
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
			getUser(barcode, function(data) {
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
				getItem(barcode, function(data) {
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
	var activeTab = '#' + jQuery('#mode .nav-link.active').attr('href').substr(1) + ' .flash'

	jQuery(activeTab).children().slice(10).remove()

	if (data.status == 'warning') warningSound.play()
	if (data.status == 'danger') errorSound.play()

	var html = '<div class="alert">'
		if (data.barcode) html += '<strong>' + data.barcode + '</strong>: '
		html += data.message
		if (data.override) html += `<button style="margin-top:-.25emmargin-right:-.75em" class="override btn btn-sm btn-outline-${data.status} float-right">Override</button>`
		if (data.override) jQuery('#issue .flash button.override').remove()
	html += '</div>'
	var alert = jQuery(html).addClass('alert-' + data.status)

	jQuery(activeTab).prepend(alert)
	setTimeout(function() {jQuery(alert).remove()}, 5000)
}

function addModule(data) {
	clearActive()

	// Trim the list
	jQuery('#modules').children().slice(10).remove()

	// Remove exi
	jQuery('#modules [data-barcode="' + data.barcode + '"]').remove()

	if (data.type == 'user') {
		current = data
		jQuery('.find').addClass('bg-primary')
		jQuery('#results .items a').tab('show')
	} else {
		current = null
	}

	var module = jQuery(data.html)
	jQuery('#modules').prepend(module)
	setTimeout(function() {
		jQuery(module).remove()
		if (jQuery('#modules .bg-primary').length == 0) clearActive()
	}, 60000)

}
function addResult(result, type) {
	var html = '<li class="list-group-item" data-type="' + type + '" data-barcode="' + result.barcode + '"><small>'
	if (result.loanable) {
		switch (result.status) {
			case 'unavailable':
				html += ' <span class="badge text-bg-success">&nbsp</span>'
				break
			case 'available':
				html += ' <span class="badge text-bg-success">&nbsp</span>'
				break
			case 'on-loan':
				html += ' <span class="badge text-bg-danger">&nbsp</span>'
				break
			case 'lost':
			case 'broken':
				html += ' <span class="badge text-bg-warning">&nbsp</span>'
				break
			case undefined:
				break
			default:
				html += ' <span class="badge text-bg-secondary">&nbsp</span>'
				break
		}
	} else {
		html += ' <span class="badge text-bg-secondary">&nbsp</span>'
	}
	html += ' <strong>' + result.name + '</strong>'
	html += '<br />'
	html += result.barcode
	html += '</small></li>'
	if (result.disable) html = jQuery(html).addClass('disabled')
	jQuery('#results #' + type + 's .list-group').append(html)
}

function issue(item, user, override, cb) {
	var query = ''
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
function find(barcode, cb) {barcode ? apiGET('find', barcode, cb) : null}
function getItem(barcode, cb) {apiGET('item', barcode, cb)}
function getUser(barcode, cb) {apiGET('user', barcode, cb)}
function identify(barcode, cb) {apiGET('identify', barcode, cb)}

function getHistory() {
	jQuery.get('/api/history', function(data, status) {
		jQuery('#history .items').html(data.actions)
	})
}

function empty(clear) {
	one_item = null
	jQuery('#results #users ul').empty()
	jQuery('#results #items ul').empty()
	if (clear) jQuery('#find input').val('')
}
function clearActive() {
	empty(true)
	current = {}
	jQuery('.find').removeClass('bg-primary')
	jQuery('#results .users a').tab('show')
	jQuery('#modules .bg-primary').addClass('bg-dark').removeClass('bg-primary')
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
				jQuery('.issue.nav-link').tab('show')
				break
			case 82: // R
				jQuery('.return.nav-link').tab('show')
				break
			case 69: // E
				jQuery('.reservation.nav-link').tab('show')
				break
			case 78: // N
				jQuery('.new-user.nav-link').tab('show')
				break
			case 76: // L
				jQuery('.print.nav-link').tab('show')
				break
			case 65: // A
				jQuery('.audit.nav-link').tab('show')
				break
			case 72: // H
				jQuery('.history.nav-link').tab('show')
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
	var term = jQuery('#find input').val()

	identify(term, function(data) {
		if (data.kind == 'unknown') {
			jQuery('.new-user.nav-link').tab('show')
			jQuery('#new-user #barcode').val(term)
			flash({status: 'warning', message: 'Unknown barcode', barcode: term})
			jQuery('#new-user [name=name]').focus()
		} else {
			select(data.kind, data.barcode)
			empty(true)
		}
	})
}

function handleReturnSubmit(e) {
	lazyResetKioskTimer()
	e.preventDefault()

	var term = jQuery('#return input').val()
	jQuery('#return input').val('')

	returnItem(term, function(data) {
		if (data) {
			flash(data)
		} else {
			flash({status: 'danger', message: 'Unknown item', barcode: term})
		}
	})
}

function focus() {
	lazyResetKioskTimer()
	switch(jQuery('#mode .nav-link.active').attr('href').substr(1)) {
		case 'return':
			jQuery('#return input').focus()
			break
		case 'issue':
			jQuery('#find input').focus()
			break
		case 'audit':
			jQuery('#audit input').focus()
			break
		case 'label':
			jQuery('#label input').focus()
			break
		case 'new-user':
			jQuery('#new-user input[name="barcode"]').focus()
			break
		case 'history':
			getHistory()
			break
	}
}

function handleItemButtons() {
	lazyResetKioskTimer()
	var clicked = jQuery(this).closest('.card')
	var type = jQuery(clicked).data('type')
	var barcode = jQuery(clicked).data('barcode')

	switch (jQuery(this).data('btn-action')) {
		case 'return':
			returnItem(barcode, function(data) {
				flash(data)
				select('item', data.barcode)
			})
			break
		case 'broken':
			broken(barcode, function(data) {
				flash(data)
				select('item', data.barcode)
			})
			break
		case 'lost':
			lost(barcode, function(data) {
				flash(data)
				select('item', data.barcode)
			})
			break;
		case 'sold':
			sold(barcode, function(data) {
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
		jQuery(this).parent().remove()
	}
}

function handleResultClick() {
	lazyResetKioskTimer()
	var type = jQuery(this).data('type')
	var barcode = jQuery(this).data('barcode')
	if (jQuery(this).hasClass('disabled')) return flash({status: 'warning', message: 'Cannot select a disabled user account'})
	select(type, barcode)
	empty(true)
}

function handlePanelClick() {
	lazyResetKioskTimer()
	var clicked = jQuery(this).closest('.card')
	select(clicked.data('type'), clicked.data('barcode'))
}

function handleFindInput(e) {
	lazyResetKioskTimer()
	if (jQuery('#find input').val() == '') empty()
	clearTimeout(typeTimeout)
	typeTimeout = setTimeout(findTimer, 100)
}

function handleAuditSubmit(e) {
	e.preventDefault()

	var term = jQuery('#audit input').val()
	jQuery('#audit input').val('')

	var locationMatch = term.match(locationRegex)
	if (locationMatch) {
		var child = jQuery('#location').children('option[data-barcode="' + locationMatch[1].trim() + '"]')
		if (child.length == 1) {
			jQuery('#location').val(child.val())
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
		var location = jQuery('#location').val()
		var mode = jQuery('#locationMode').val()
		var override = false
		if (mode == 3) override = true
		if (mode == 1) location = null
		audit(term, location, override, function(data) {
			if (data.status == 'success') auditSuccessSound.play()
			if (data.status == 'danger') auditErrorSound.play()
			flash(data)
		})
	}
}

function handleLabelSubmit(e) {
	e.preventDefault()
	lazyResetKioskTimer()

	var term = jQuery('#label input').val()
	jQuery('#label input').val('')

	label(term, function(data) {
		flash(data)
	})
}

function handleUserSubmit(e) {
	e.preventDefault()
	lazyResetKioskTimer()

	var name = jQuery('#new-user form [name="name"]').val()
	var barcode = jQuery('#new-user form [name="barcode"]').val()
	var email = jQuery('#new-user form [name="email"]').val()
	var course = jQuery('#new-user form [name="course"]').val()
	var year = jQuery('#new-user form [name="year"]').val()

	newUser(name, barcode, email, course, year, function(data) {
		if (data.status == 'success') {
			select(data.redirect.type, data.redirect.barcode)
			jQuery('a.issue').tab('show')
			clearUserForm()
		}
		flash(data)
	})
}

function clearUserForm() {
	jQuery('#new-user form [name="name"]').val('')
	jQuery('#new-user form [name="barcode"]').val('')
	jQuery('#new-user form [name="email"]').val('')
	jQuery('#new-user form [name="course"]').val('')
	jQuery('#new-user form [name="year"]').val('')
}

function refreshHistory() {
	if (jQuery('#mode .nav-link.active').attr('href').substr(1) == 'history') {
		getHistory()
	}
}
setInterval(refreshHistory, 10000)

function lazyResetKioskTimer() {
	if (typeof resetKioskTimer == 'function') {
		resetKioskTimer()
	}
}

function apiPOST(path, data, cb) {
	if (typeof data == 'function') {
		cb = data
		delete data
	}

	let request = {
		url: `/api/${path}`,
		type: 'post',
		headers: {
			'CSRF-Token': token
		},
		xhrFields: {
			withCredentials: true
		},
		dataType: 'json',
		success: (data, status) => {
			cb(data)
		}
	}

	if (typeof data == 'object') {
		request.data = data
	}

	jQuery.ajax(request)
}