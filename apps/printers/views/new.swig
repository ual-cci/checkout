{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create printer{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Printer – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/printer-form.swig' %}
		</div>
	</div>
{% endblock %}
