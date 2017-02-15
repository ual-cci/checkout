{% if items.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Status</th>
					<th>Barcode</th>
					<th>Name</th>
					<th>Owner</th>
					<th>Department</th>
					<th>Group</th>
				</tr>
			</thead>
			<tbody>
				{% for item in items %}
					<tr>
						<td>
							{% set status = item.status %}
							{% include '../../items/partials/status.swig' %}
						</td>
						<td><span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></td>
						<td><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
						<td>{% if item.owner %}<a href="/users/{{ item.owner._id | raw }}">{{ item.owner.name }}</a>{% else %}&mdash;{% endif %}</td>
						{% set department = item.department %}
						<td>{% include '../../departments/partials/department.swig' %}</td>
						{% set group = item.group %}
						<td>{% include '../../groups/partials/group.swig' %}</td>
					</tr>
				{% endfor %}
			</tbody>
		</table>
	</div>
{% else %}
	<p>There are no items to display.</p>
{% endif %}
