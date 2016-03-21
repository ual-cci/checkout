{% if item.status == 'available' %}
	<span class="label label-success">Available</span>
{% elif item.status == 'on-loan' %}
	<span class="label label-danger">On Loan</span>
{% elif item.status == 'reserved' %}
	<span class="label label-warning">Reserved</span>
{% elif item.status == 'broken' %}
	<span class="label label-warning">Broken</span>
{% elif item.status == 'new' %}
	<span class="label label-primary">New</span>
{% else %}
	<span class="label label-default">{{ item.status }}</span>
{% endif %}