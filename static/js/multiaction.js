let multiForm, multiBtns, items

window.addEventListener('load', () => {	
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
	const ids = fd.getAll('edit')

	if (ids.length > 1) {
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
	const fd = new FormData(multiForm)
	const ids = fd.getAll('edit')
	
	if (ids.length) {
		const hf = createForm(ids, e.target.dataset.action)
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
	form.appendChild(document.getElementsByName('_csrf')[0])
	
	const input = document.createElement('input')
	input.setAttribute('type', 'hidden')
	input.setAttribute('name', 'ids')
	input.value = ids.join(',')
	form.appendChild(input)
	
	return form
}