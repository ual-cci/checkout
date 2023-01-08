window.addEventListener('load', () => {
	const clipboard = new ClipboardJS('.clipboard')
	jQuery('#audit_point').datetimepicker({format: 'HH:mm DD/MM/YYYY', icons: {time: 'fa fa-clock'}});
	
	// Detect darkmode
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)').addListener(detectDarkmode)
	detectDarkmode(window.matchMedia('(prefers-color-scheme: dark)'))

	document.querySelectorAll('[data-printer]').forEach(printer => {
		printer.addEventListener('click', handlePrinterChange)
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
	apiGET('select-printer', this.dataset.printer, (data) => {
		if (data.status == 'success') {
			document.querySelector('#topMenuPrinterDropdown .printer').innerText = data.printer
		} else {
			console.log(data)
		}
	})
}

function apiGET(method, barcode, cb) {
	jQuery.get('/api/' + method + '/' + barcode, function(data, status) {
		cb(data)
	})
}
