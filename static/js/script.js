jQuery(document).ready(function() {
	var clipboard = new ClipboardJS('.clipboard')
	jQuery('input[type=checkbox].checkall').bind('click', function() {
		if (jQuery('.tab-pane').length > 0) {
			if (jQuery(this).prop('checked')) {
				jQuery('.tab-pane.active .table input[type=checkbox]').prop('checked', true)
			} else {
				jQuery('.tab-pane.active .table input[type=checkbox]').prop('checked', false)
			}
		} else {
			if (jQuery(this).prop('checked')) {
				jQuery('.table input[type=checkbox]').prop('checked', true)
			} else {
				jQuery('.table input[type=checkbox]').prop('checked', false)
			}
		}
	})

	// Date time
	$('#audit_point').datetimepicker({format: 'HH:mm DD/MM/YYYY', icons: {time: 'fa fa-clock'}});

	// MultiPrint button shim
	const multiPrint = document.getElementById('multi-print')
	if (multiPrint) {// must be the items page
		const itemsForm = document.getElementById('items-form')

		itemsForm.addEventListener('change', (e) => {
			const fd = new FormData(itemsForm)
			const ids = fd.getAll('edit')

			if (ids.length === 0) {
				multiPrint.setAttribute('disabled', 'disabled')
			} else {
				multiPrint.removeAttribute('disabled')
			}
		}, false)

		multiPrint.addEventListener('click', (e) => {
			e.preventDefault()
			const fd = new FormData(itemsForm)
			const ids = fd.getAll('edit')

			if (ids.length) {
				const hf = createForm(ids)
				document.body.appendChild(hf)
				hf.submit()
			}
		}, false)

		function createForm(ids) {
			const oldForm = document.getElementById('hidden-form')
			if (oldForm) {
				oldForm.parentElement.removeChild(oldForm)
			}

			const form = document.createElement('FORM')
			form.setAttribute('action', '/items/multi')
			form.setAttribute('method', 'post')
			form.setAttribute('id', 'hidden-form')
			const input = document.createElement('INPUT')
			input.setAttribute('type', 'hidden')
			input.setAttribute('name', 'ids')
			input.value = ids.join(',')
			form.appendChild(input)
			return form
		}
	}
})
