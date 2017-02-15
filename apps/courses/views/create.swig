{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create course{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Course – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/course-form.swig' %}
		</div>
	</div>
{% endblock %}
