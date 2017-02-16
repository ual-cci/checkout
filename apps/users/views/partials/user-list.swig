{% if users.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
					{% if !no_course %}
						<th>Course</th>
					{% endif %}
					<th>Email</th>
					<th>Barcode</th>
				</tr>
			</thead>
			<tbody>
				{% for user in users %}
					<tr>
						<td><a href="/users/{{ user._id | raw }}">{{ user.name }}</a> {% include 'label.swig' %}</td>
						{% if !no_course %}
							<td>{% set course = user.course %}{% include '../../../courses/views/partials/course.swig' %}</td>
						{% endif %}
						<td><a href="mailto:{{ user.email }}">{{ user.email }}</a></td>
						<td><span data-clipboard-text="{{ user.barcode }}" class="clipboard">{{ user.barcode }}</span></td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p>There are no users to display.</p>
{% endif %}
