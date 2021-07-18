let searchTextField, checkAllBox

window.addEventListener('load', () => {
	searchTextField = document.querySelector('#searchText input')
	if (searchTextField) {
		searchTextField.addEventListener('input', quickSearch)
		document.addEventListener('keydown', QShandleKeyboardInput)
	}

	checkAllBox = document.querySelector('input[type=checkbox].checkall')
	if (checkAllBox) {
		checkAllBox.addEventListener('click', checkAll)
	}
})

function QShandleKeyboardInput(e) {
	if (e.altKey && e.shiftKey && e.which == 81) {
		e.preventDefault()
		searchTextField.focus()
	}
}

function checkAll() {
	if (checkAllBox.checked) {
		document.querySelectorAll('.table input[type=checkbox]').forEach(elm => {
			if (elm.parentElement.parentElement.style.display != 'none') elm.checked = true
		})
	} else {
		document.querySelectorAll('.table input[type=checkbox]').forEach(elm => {
			if (elm.parentElement.parentElement.style.display != 'none') elm.checked = false
		})
	}
}

function quickSearch() {
	const searchText = searchTextField.value.toLowerCase()
	
	if (checkAllBox) checkAllBox.checked = false

	document.querySelectorAll('tbody tr').forEach(tr => {
		let hide = true
		tr.querySelectorAll('td[data-searchable]').forEach(td => {
			if (td.dataset.searchable.toLowerCase().indexOf(searchText) != -1) {
				hide = false
			}
		})

		if (hide) {
			tr.style.display = 'none'
		} else {
			tr.style.display = ''
		}
	})
}