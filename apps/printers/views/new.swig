{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create printer{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Printer – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/printer-form.swig' %}
{% endblock %}
