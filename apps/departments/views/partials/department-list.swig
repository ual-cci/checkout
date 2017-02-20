{% if departments.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				{% for department in departments %}
					<tr>
						<td>{% include 'department.swig' %}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no departments to display.</p>
{% endif %}
