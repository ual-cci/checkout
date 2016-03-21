{% extends '../admin.swig' %}

{% block heading %}{{ course.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Courses – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/courses/{{ course._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<h3>Users</h3>
	{% include '../users/partials/user-list-minimal.swig' %}
{% endblock %}