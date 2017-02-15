{% extends '../../../src/views/admin.swig' %}

{% block heading %}Create item{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Items – {% parent %}{% endblock %}

{% block content %}
	{% set action = 'Create' %}
	<div class="row">
		<div class="col-md-5">
			{% include 'partials/item-form.swig' %}
		</div>
	</div>
{% endblock %}
