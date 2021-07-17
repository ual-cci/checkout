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
})

function apiGET(method, barcode, cb) {
	jQuery.get('/api/' + method + '/' + barcode, function(data, status) {
		cb(data)
	})
}