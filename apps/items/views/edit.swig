{% extends '../admin.swig' %}

{% block heading %}Edit '{{ item.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Items – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	{% include 'partials/item-form.swig' %}
{% endblock %}