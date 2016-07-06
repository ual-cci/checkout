{% extends '../admin.swig' %}

{% block heading %}{{ item.name }}{% endblock %}
{% block title %}{{ item.name }} – Items – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}

	<a href="/items/{{ item._id | raw }}/edit" title="Edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>

	{% block transactions %}
		{% include 'partials/transactions.swig' %}
	{% endblock %}
{% endblock %}
