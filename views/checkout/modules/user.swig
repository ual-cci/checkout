<div class="panel panel-primary">
	<div class="panel-heading">
		<h3 class="panel-title"><span class="glyphicon glyphicon-user"></span> <a href="/users/{{ user._id | raw }}">{{ user.name }}</a></h3>
	</div>
	<div class="panel-body">
		<h4>{% include '../../users/partials/label.swig' %}</h4>

		<p><strong>Course:</strong> {% set course = user.course %}{% include '../../courses/partials/course.swig' %}</p>
		<p><strong>Email:</strong> <a href="mailto:{{ user.email }}">{{ user.email }}</a></p>
		<p><strong>Barcode:</strong> {{ user.barcode }}</p>

		{% if onloan.length > 0 %}
			<h3>On Loan</h3>
		{% endif %}
	</div>

	{% if onloan.length > 0 %}
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
				{% for item in onloan %}
					<tr>
						<td><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
						<td>{{ item.barcode }}</td>
						<td>{{ item.transactions | last.date | date('j/n/Y')  }}</td>
						<td>{{ item.transactions | last.date | date('H:i:s') }}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	{% endif %}
</div>
