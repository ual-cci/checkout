{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ group.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Groups – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/group-form.swig' %}
		</div>
	</div>
{% endblock %}
