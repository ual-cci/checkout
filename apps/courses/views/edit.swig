{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ course.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Course – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/course-form.swig' %}
{% endblock %}
