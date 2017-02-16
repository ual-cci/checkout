{% extends '../../../src/views/admin.swig' %}

{% block heading %}Course: {{ course.name }}{% endblock %}
{% block title %}{{ course.name }} – Courses – {% parent %}{% endblock %}

{% block content %}
{% if course.contact %}
	<p><strong>Contact:</strong> <a href="/users/{{ course.contact._id | raw }}">{{ course.contact.name }}</a></p>
{% endif %}
	<p>
		<a href="/courses/{{ course._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
	"></span> Edit</a>
		{% if course.contact %}
			<a class="btn btn-default" href="mailto:{{ course.contact.email }}?subject={{ "[ATTN] Items outstanding for " + course.name | url_encode }}&body={{ email | url_encode }}"><span class="glyphicon glyphicon-envelope"></span> Generate email</a>
		{% endif %}
	</p>

	<hr />

	<ul class="nav nav-tabs">
		<li role="presentation" class="active" role="tablist">
			<a href="#users" aria-controls="users" role="tab" data-toggle="tab">Users</a>
		</li>
		<li role="presentation" role="tablist">
			<a href="#items" aria-controls="items" role="tab" data-toggle="tab">Items</a>
		</li>
	</ul>

	<div class="tab-content">
		<div role="tabpanel" class="tab-pane active" id="users">
			{% set no_course = true %}
			{% include '../../users/views/partials/user-list.swig' %}
		</div>
		<div role="tabpanel" class="tab-pane" id="items">
			{% include '../../items/views/partials/items-list.swig' %}
		</div>
	</div>
{% endblock %}
