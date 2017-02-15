{% extends '../admin.swig' %}

{% block heading %}Departments{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/department-list.swig' %}
{% endblock %}
