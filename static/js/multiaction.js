let multiForm, multiBtns, items, _csrf

window.addEventListener('load', () => {	
	_csrf = document.getElementsByName('_csrf')[0].value

	multiBtns = Array.from(document.getElementsByClassName('multi'))
	if (multiBtns && multiBtns.length > 0) {
		multiForm = document.getElementById('multi-form')
		multiForm.addEventListener('change', handleCheckboxChange, false)
		handleCheckboxChange()

		multiBtns.forEach(btn => {
			btn.addEventListener('click', handleMultiActionButtons, false)
		})
	}
})

function handleCheckboxChange() {
	const fd = new FormData(multiForm)
	const ids = fd.getAll('ids')

	if (ids.length > 0) {
		multiBtns.forEach(btn => {
			btn.removeAttribute('disabled')
		})
	} else {
		multiBtns.forEach(btn => {
			btn.setAttribute('disabled', 'disabled')
		})
	}
}

function handleMultiActionButtons(e) {
	e.preventDefault()

	let target = e.target

	const fd = new FormData(multiForm)
	const ids = fd.getAll('ids')

	if (ids.length > 0) {
		// Captures button icon click target
		if (target.tagName == 'SPAN') {
			target = target.parentElement
		}

		const hf = createForm(ids, target.dataset.action)
		document.body.appendChild(hf)
		hf.submit()
	}
}

function createForm(ids, action) {
	const oldForm = document.getElementById('hidden-form')
	if (oldForm) {
		oldForm.parentElement.removeChild(oldForm)
	}

	const form = document.createElement('form')
	form.setAttribute('action', action)
	form.setAttribute('method', 'post')
	form.setAttribute('id', 'hidden-form')
	
	const csrfInput = document.createElement('input')
	csrfInput.setAttribute('type', 'hidden')
	csrfInput.setAttribute('name', '_csrf')
	csrfInput.value = _csrf
	form.appendChild(csrfInput)
	
	const idsInput = document.createElement('input')
	idsInput.setAttribute('type', 'hidden')
	idsInput.setAttribute('name', 'ids')
	idsInput.value = ids.join(',')
	form.appendChild(idsInput)

	return form
}