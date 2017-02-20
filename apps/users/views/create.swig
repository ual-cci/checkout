{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create User{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/user-form.swig' %}
{% endblock %}
