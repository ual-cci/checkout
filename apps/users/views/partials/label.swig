{% if user.type == 'staff' %}
	<span class="label label-danger">Admin</span>
{% endif %}
{% if user.disable %}
	<span class="label label-default">Disabled</span>
{% endif %}
