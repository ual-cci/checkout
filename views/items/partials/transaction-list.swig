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
			{% for transaction in item.transactions %}
				{% set user = transaction.user %}
				<tr {% if loop.first %}style="background-color: #ffffee;"{% endif %}>
					<td>
						{% set status = transaction.status %}
						{% include 'status.swig' %}
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
