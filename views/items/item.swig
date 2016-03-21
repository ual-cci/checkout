{% extends '../admin.swig' %}

{% block heading %}{{ item.name }}{% endblock %}
{% block title %}{{ item.name }} – Items – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}

	<h3>Actions</h3>

	<div class="btn-group" role="group">
		<a href="/items/{{ item._id | raw }}/return" title="Return" class="btn btn-default"><span class="glyphicon glyphicon-download-alt"></span> Return</a>
		<a href="/items/{{ item._id | raw }}/broken" title="Broken" class="btn btn-default"><span class="glyphicon glyphicon-alert"></span> Broken</a>
		<a href="/items/{{ item._id | raw }}/audit" title="Audit" class="btn btn-default"><span class="glyphicon glyphicon-barcode"></span> Audit</a>
		<a href="/items/{{ item._id | raw }}/edit" title="Edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
	</div>

	{% include 'partials/checkout.swig' %}

	{% block transactions %}
		{% include 'partials/transactions.swig' %}
	{% endblock %}
{% endblock %}