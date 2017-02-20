{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ user.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/user-form.swig' %}
{% endblock %}
