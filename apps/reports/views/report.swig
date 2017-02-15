{% extends '../admin.swig' %}

{% block heading %}
	{% if status == 'available' %}
		Available
	{% elif status == 'on-loan' %}
		On Loan
	{% elif status == 'new' %}
		New
	{% elif status == 'reserved' %}
		Reserved
	{% elif status == 'lost' %}
		Lost
	{% elif status == 'broken' %}
		Broken
	{% else %}
		{{ status }}
	{% endif %}
{% endblock %}

{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include '../items/partials/filter.swig' %}
	<hr />
	{% include 'partials/items-list.swig' %}
{% endblock %}
