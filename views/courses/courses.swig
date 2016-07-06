{% extends '../admin.swig' %}

{% block heading %}Courses{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/course-list.swig' %}
{% endblock %}
