{% extends '../admin.swig' %}

{% block heading %}Items{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/items-list.swig' %}
{% endblock %}