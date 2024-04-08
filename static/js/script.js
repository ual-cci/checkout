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
	apiGET(`/api/select-printer/${this.dataset.printer}`, (data) => {
		if (data.status == 'success') {
			document.querySelector('#topMenuPrinterDropdown .printer').innerText = data.printer
		} else {
			console.log(data)
		}
	})
}

function handleTemplateChange() {
	apiGET(`/api/select-template/${this.dataset.template}`, (data) => {
		if (data.status == 'success') {
			document.querySelector('#topMenuTemplateDropdown .template').innerText = data.template
		} else {
			console.log(data)
		}
	})
}

function apiGET(uri, cb) {
	jQuery.get(uri, (data, status) => {
		cb(data)
	})
}
