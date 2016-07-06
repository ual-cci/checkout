{% extends '../admin.swig' %}

{% block heading %}Groups{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/groups-list.swig' %}
{% endblock %}
