{% extends '../admin.swig' %}

{% block heading %}Audit Report{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include '../items/partials/filter.swig' %}

	<h3>Missing items</h3>
	<p>Items not scanned today that should have been scanned.</p>
	{% include '../items/partials/items-list.swig' %}

	<h3>Other</h3>
	<p>Items not expected to be in the audit.</p>
	{% set items = other %}
	{% include '../items/partials/items-list.swig' %}
{% endblock %}
