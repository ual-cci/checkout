{% extends '../admin.swig' %}

{% block heading %}
	{% if status == 'available' %}
		Available
	{% elif status == 'on-loan' %}
		On Loan
	{% elif status == 'reserved' %}
		Reserved
	{% elif status == 'broken' %}
		Broken
	{% elif status == 'new' %}
		New
	{% else %}
		{{ status }}
	{% endif %}
{% endblock %}

{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include '../items/partials/filter.swig' %}
	{% include 'partials/items-list.swig' %}
{% endblock %}
