window.addEventListener('load', () => {
	const clipboard = new ClipboardJS('.clipboard')
	jQuery('#audit_point').datetimepicker({format: 'HH:mm DD/MM/YYYY', icons: {time: 'fa fa-clock'}});
})

function apiGET(method, barcode, cb) {
	jQuery.get('/api/' + method + '/' + barcode, function(data, status) {
		cb(data)
	})
}