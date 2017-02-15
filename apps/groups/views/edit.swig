{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ group.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Groups – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/group-form.swig' %}
{% endblock %}
