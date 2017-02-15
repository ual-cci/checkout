{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit '{{ user.name }}'{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Update' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/user-form.swig' %}
		</div>
	</div>
{% endblock %}
