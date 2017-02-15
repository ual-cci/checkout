{% if items.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Name</th>
					<th>Barcode</th>
					<th>Date</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody>
				{% for item in items %}
					<tr>
						<td><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
						<td><span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></td>
						<td>{{ item.transactions | last.date | date('j/n/Y')  }}</td>
						<td>{{ item.transactions | last.date | date('H:i:s') }}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p>There are no items to display.</p>
{% endif %}
