{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ department.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Department – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/department-form.swig' %}
{% endblock %}
