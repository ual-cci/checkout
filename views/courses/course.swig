{% extends '../admin.swig' %}

{% block heading %}{{ course.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Courses – {% parent %}{% endblock %}

{% block content %}
	{% if course.contact %}
		<p><strong>Contact:</strong> {{ course.contact.name }}</p>
	{% endif %}
	<p>
		<div class="btn-group" role="group">
			<a href="/courses/{{ course._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<h3>Users</h3>
	{% if users.length > 0 %}
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Barcode</th>
					</tr>
				</thead>
				<tbody>
					{% for user in users %}
						<tr>
							<td><a href="/users/{{ user._id | raw }}">{{ user.name }}</a> {% include '../users/partials/label.swig' %}</td>
							<td><a href="mailto:{{ user.email }}">{{ user.email }}</a></td>
							<td>{{ user.barcode }}</td>
						</tr>
					{% endfor %}
				</tbody>
			</table>
		</div>
	{% else %}
		<p>There are no users to display.</p>
	{% endif %}
{% endblock %}
