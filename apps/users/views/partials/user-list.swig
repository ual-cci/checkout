{% if users.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					{% if edit %}
						<th>
							<input class="checkall" type="checkbox" title="Check All" {% if edit_users %}checked{% endif %} />
						</th>
					{% endif %}
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
						{% if edit %}
							<td>
								<input type="checkbox" name="edit" value="{{ user._id | raw }}" {% if edit_users %}checked{% endif %} />
							</td>
						{% endif %}
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
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no users to display.</p>
{% endif %}
