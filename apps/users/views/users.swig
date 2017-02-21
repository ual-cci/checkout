{% extends '../../../src/views/admin.swig' %}

{% block heading %}Users{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/filter.swig' %}

	<hr />

	<ul class="nav nav-tabs">
		<li role="presentation" class="active" role="tablist">
			<a href="#active" aria-controls="active" role="tab" data-toggle="tab">Active</a>
		</li>
		<li role="presentation" role="tablist">
			<a href="#disabled" aria-controls="disabled" role="tab" data-toggle="tab">Disabled</a>
		</li>
	</ul>

	<form action="/users/edit" method="post">
		{% set edit = true %}
		<div class="tab-content">
			<div role="tabpanel" class="tab-pane active" id="active">
				{% set users = active %}
				{% include 'partials/user-list.swig' %}
			</div>
			<div role="tabpanel" class="tab-pane" id="disabled">
				{% set users = disabled %}
				{% include 'partials/user-list.swig' %}
			</div>
		</div>

		<button class="btn btn-default" type="submit">Edit Selected</button>
	</form>
{% endblock %}
