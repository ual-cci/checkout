{% if courses.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				{% for course in courses %}
					<tr>
						<td>{% include 'course.swig' %}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p>There are no courses to display.</p>
{% endif %}