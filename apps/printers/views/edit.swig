{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ printer.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Course – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/printer-form.swig' %}
{% endblock %}
