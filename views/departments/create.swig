{% extends '../admin.swig' %}

{% block heading %}Create department{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Department – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/department-form.swig' %}
{% endblock %}