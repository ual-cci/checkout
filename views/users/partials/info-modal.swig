{% extends '../../partials/modal.swig' %}

{% block title %}{{ user.name }}{% endblock %}

{% block body %}
	{% include 'info.swig' %}
	{% include 'onloan.swig' %}
{% endblock %}