{% extends '../admin.swig' %}

{% block heading %}Course Report: {{ course }}{% endblock %}

{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/items-list.swig' %}

	<a href="/reports/course" class="btn btn-default">Back</a>
{% endblock %}
