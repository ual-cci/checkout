{% if items.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Status</th>
					<th>Barcode</th>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				{% for item in items %}
					<tr>
						<td>
							{% include 'status.swig' %}
						</td>
						<td>{{ item.barcode }}</td>
						<td><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p>There are no items to display.</p>
{% endif %}