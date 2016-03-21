{% extends '../admin.swig' %}

{% block heading %}{{ department.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Departments – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/departments/{{ department._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<h3>Items</h3>
	{% include '../items/partials/items-list-minimal.swig' %}
{% endblock %}