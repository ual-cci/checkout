{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create department{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Department – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/department-form.swig' %}
		</div>
	</div>
{% endblock %}
