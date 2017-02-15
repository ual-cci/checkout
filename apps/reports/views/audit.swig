{% extends '../../../src/views/admin.swig' %}

{% block heading %}Missing{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include '../../items/views/partials/filter.swig' %}

	<hr />

	<h3>Missing items</h3>
	<p>Items not scanned today that should have been scanned.</p>
	{% include '../../items/views/partials/items-list.swig' %}

	<h3>Other</h3>
	<p>Items not expected to be in the audit.</p>
	{% set items = other %}
	{% include '../../items/views/partials/items-list.swig' %}
{% endblock %}
