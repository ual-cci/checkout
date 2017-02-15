{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create group{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Group – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/group-form.swig' %}
{% endblock %}
