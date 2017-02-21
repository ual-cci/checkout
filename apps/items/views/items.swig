{% extends '../../../src/views/admin.swig' %}

{% block heading %}Items{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/filter.swig' %}

	<hr />

	<form action="/items/edit" method="post">
		{% set edit = true %}
		{% include 'partials/items-list.swig' %}
		<button class="btn btn-default" type="submit">Edit Selected</button>
	</form>
{% endblock %}
