{% if item.transactions.length > 0 %}
	<table class="table table-striped">
		<thead>
			<tr>
				<th>Action</th>
				<th>User</th>
				<th>Date</th>
				<th>Time</th>
			</tr>
		</thead>
		<tbody>
			{% for transaction in item.transactions | reverse %}
				{% set user = transaction.user %}
				<tr {% if loop.first %}style="background-color: #ffffee;"{% endif %}>
					<td>
						{% if transaction.status == 'loaned' %}
							<span class="label label-primary">Loaned</span>
						{% elif transaction.status == 'returned' %}
							<span class="label label-primary">Returned</span>
						{% elif transaction.status == 'reserved' %}
							<span class="label label-warning">Reserved</span>
						{% elif transaction.status == 'broken' %}
							<span class="label label-danger">Broken</span>
						{% elif transaction.status == 'audited' %}
							<span class="label label-success">Audited</span>
						{% else %}
							<span class="label label-default">{{ transaction.status }}</span>
						{% endif %}
					</td>
					<td><a href="/users/{{ user._id | raw }}">{{ user.name }}</a> {% include '../../users/partials/label.swig' %}</td>
					<td>{{ transaction.date|date('j/n/Y') }}</td>
					<td>{{ transaction.date|date('H:i:s') }}</td>
				</tr>
			{% endfor %}
		</tbody>
	</table>
{% else %}
	<p>There are no transactions to display.</p>
{% endif %}