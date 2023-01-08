window.addEventListener('load', () => {
	const clipboard = new ClipboardJS('.clipboard')
	jQuery('#audit_point').datetimepicker({format: 'HH:mm DD/MM/YYYY', icons: {time: 'fa fa-clock'}});
	
	// Detect darkmode
	const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)').addListener(detectDarkmode)
	detectDarkmode(window.matchMedia('(prefers-color-scheme: dark)'))
})

function detectDarkmode(e) {
	if (e.matches) {
		document.getElementsByTagName('html')[0].dataset.bsTheme = 'dark'
	} else {
		document.getElementsByTagName('html')[0].dataset.bsTheme = ''
	}
}

function apiGET(method, barcode, cb) {
	jQuery.get('/api/' + method + '/' + barcode, function(data, status) {
		cb(data)
	})

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
