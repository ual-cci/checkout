{% extends '../admin.swig' %}

{% block heading %}{{ group.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Groups – {% parent %}{% endblock %}

{% block content %}
	{% if group.limiter %}
		<p>Limited to: {{ group.limiter }}</p>
	{% endif %}
	<p>
		<div class="btn-group" role="group">
			<a href="/groups/{{ group._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<h3>Items</h3>
	{% include '../items/partials/items-list-minimal.swig' %}
{% endblock %}
