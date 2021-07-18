let searchTextField, checkAllBox

window.addEventListener('load', () => {
	searchTextField = document.querySelector('#searchText input')
	if (searchTextField) searchTextField.addEventListener('input', quickSearch)

	checkAllBox = document.querySelector('input[type=checkbox].checkall')
	checkAllBox.addEventListener('click', checkAll)
})

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

	document.querySelectorAll('tbody tr').forEach(tr => {
		let hide = true
		tr.querySelectorAll('td[data-searchable]').forEach(td => {
			console.log(td.dataset.searchable.toLowerCase().indexOf(searchText))
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