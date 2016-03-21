{% if user.type == 'staff' %}
	<span class="label label-primary">Staff</span>
{% elif user.type == 'admin' %}
	<span class="label label-danger">Admin</span>
{% endif %}