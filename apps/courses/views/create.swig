{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create course{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Course – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/course-form.swig' %}
{% endblock %}
