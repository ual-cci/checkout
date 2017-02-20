{% extends '../../../src/views/admin.swig' %}

{% block heading %}Users{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/filter.swig' %}

	<hr />

	
	{% include 'partials/user-list.swig' %}
{% endblock %}
