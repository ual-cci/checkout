{% if courses.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
					<th>Contact</th>
				</tr>
			</thead>
			<tbody>
				{% for course in courses %}
					<tr>
						<td>{% include 'course.swig' %}</td>
						<td>{% include 'contact.swig' %}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no courses to display.</p>
{% endif %}
