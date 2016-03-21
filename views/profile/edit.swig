{% extends '../admin.swig' %}

{% block heading %}Edit profile{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Profile – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/profile-form.swig' %}
{% endblock %}