{% extends '../admin.swig' %}

{% block heading %}Create item{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Items – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	{% include 'partials/item-form.swig' %}
{% endblock %}