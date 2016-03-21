{% extends '../../partials/modal.swig' %}

{% block title %}{{ item.name }}{% endblock %}

{% block body %}
	{% include 'info.swig' %}
	{% include 'checkout.swig' %}
{% endblock %}