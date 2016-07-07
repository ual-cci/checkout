{% extends '../admin.swig' %}

{% block heading %}
	{% include '../items/partials/status.swig' %}
{% endblock %}

{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include '../items/partials/filter.swig' %}
	<hr />
	{% include 'partials/items-list.swig' %}
{% endblock %}
