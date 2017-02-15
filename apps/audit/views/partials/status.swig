{% if status == 'available' %}
	<span class="label label-success">Available</span>
{% elif status == 'returned' %}
	<span class="label label-success">Returned</span>
{% elif status == 'loaned' %}
	<span class="label label-danger">Loaned</span>
{% elif status == 'on-loan' %}
	<span class="label label-danger">On Loan</span>
{% elif status == 'reserved' %}
	<span class="label label-info">Reserved</span>
{% elif status == 'broken' %}
	<span class="label label-warning">Broken</span>
{% elif status == 'lost' %}
	<span class="label label-warning">Lost</span>
{% elif status == 'new' %}
	<span class="label label-primary">New</span>
{% elif status == 'audited' %}
	<span class="label label-default">Audited</span>
{% else %}
	{{ status }}
{% endif %}
