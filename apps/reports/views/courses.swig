{% extends '../../../src/views/admin.swig' %}

{% block heading %}On Loan By Course{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	{% if courses.length > 0 %}
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Course</th>
					</tr>
				</thead>
				<tbody>
					{% for course in courses %}
						<tr>
							<td>
								<a href="/reports/course/{{ course.id | raw }}">{{ course.name }}</a>
							</td>
						</tr>
					{% endfor %}
				</tbody>
			</table>
		</div>
	{% else %}
		<p>There are no courses to display.</p>
	{% endif %}
{% endblock %}
