{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ department.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Department – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/department-form.swig' %}
		</div>
	</div>
{% endblock %}
