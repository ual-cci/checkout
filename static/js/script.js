window.addEventListener('DOMContentLoaded', () => {
	const clipboard = new ClipboardJS('.clipboard')
	// jQuery('#audit_point').datetimepicker({format: 'HH:mm DD/MM/YYYY', icons: {time: 'fa fa-clock'}});

	// Detect darkmode
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)').addListener(detectDarkmode)
	detectDarkmode(window.matchMedia('(prefers-color-scheme: dark)'))

	document.querySelectorAll('[data-printer]').forEach(printer => {
		printer.addEventListener('click', handlePrinterChange)
	})
	document.querySelectorAll('[data-template]').forEach(template => {
		template.addEventListener('click', handleTemplateChange)
	})
})

function detectDarkmode(e) {
	if (e.matches) {
		document.getElementsByTagName('html')[0].dataset.bsTheme = 'dark'
	} else {
		document.getElementsByTagName('html')[0].dataset.bsTheme = ''
	}
}

function handlePrinterChange() {
	apiGET(`/select-printer/${this.dataset.printer}`, (data) => {
		if (data.status == 'success') {
			document.querySelector('#topMenuPrinterDropdown .printer').innerText = data.printer
		} else {
			console.log(data)
		}
	})
}

function handleTemplateChange() {
	apiGET(`/select-template/${this.dataset.template}`, (data) => {
		if (data.status == 'success') {
			document.querySelector('#topMenuTemplateDropdown .template').innerText = data.template
		} else {
			console.log(data)
		}
	})
}

function apiGET(path, cb) {
	apiRequest('GET', path, cb)
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

function apiRequest(method, path, data, cb) {
	if (typeof data == 'function') {
		cb = data
		delete data
	}

	const req = new XMLHttpRequest()
	req.open(method, `/api/${path}`)

	req.addEventListener('readystatechange', e => {
		if (e.target.readyState === XMLHttpRequest.DONE) {
			if (e.target.status == 200) {
				const result = JSON.parse(e.target.response)
				cb(result)
			} else {
				flash({
					status: 'warning',
					barcode: 'API Error',
					message: `${e.target.statusText} [${e.target.status}]`
				})
			}
		}
	})

	req.send()
}
