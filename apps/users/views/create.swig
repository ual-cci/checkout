{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create user{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/user-form.swig' %}
		</div>
	</div>
{% endblock %}
