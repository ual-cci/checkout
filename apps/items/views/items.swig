{% extends '../../../src/views/admin.swig' %}

{% block heading %}Items{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/filter.swig' %}
	<hr />
	{% if items.length == 0 %}
		<p class="bg-info" style="padding: 1em; margin-top: 1em;">Items will be shown after selecting your filtering options above.</p>
	{% else %}
		<form action="/items/edit" method="post">
			{% set edit = true %}
			{% include 'partials/items-list.swig' %}
			<button class="btn btn-default" type="submit">Edit Selected</button>
		</form>
	{% endif %}
{% endblock %}
