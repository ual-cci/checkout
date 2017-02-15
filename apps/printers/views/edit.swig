{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ printer.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Course – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/printer-form.swig' %}
		</div>
	</div>
{% endblock %}
