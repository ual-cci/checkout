{% extends '../admin.swig' %}

{% block heading %}Report{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/filter.swig' %}

	<h3>Scanned</h3>
	<p>Items audited today.</p>
	{% set items = audited %}
	{% include 'partials/items-list.swig' %}

	<h3>Pending</h3>
	<p>Items not yet audited today.</p>
	{% set items = missing %}
	{% include 'partials/items-list.swig' %}

	<h3>On Loan</h3>
	{% set items = onloan %}
	{% include 'partials/items-list.swig' %}

	<h3>Reserved</h3>
	{% set items = reserved %}
	{% include 'partials/items-list.swig' %}

	<h3>Broken</h3>
	{% set items = broken %}
	{% include 'partials/items-list.swig' %}
{% endblock %}