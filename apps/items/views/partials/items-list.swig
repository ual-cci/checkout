{% if items.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped flex">
			<col style="width:5%" />
			<col style="width:7%" />
			<col style="width:20%" />
			<col style="width:7%" />
			<col style="width:10%" />
			<col style="width:15%" />
			<col style="width:5%" />
			<thead>
				<tr>
					<th>Status</th>
					<th>Barcode</th>
					<th>Name</th>
					<th>Owner</th>
					<th>Group</th>
					<th>Department</th>
					{% if total %}
						<th>Value</th>
					{% endif %}
				</tr>
			</thead>
			<tbody>
				{% for item in items %}
					<tr>
						<td>
							{% set status = item.status %}
							{% include 'status.swig' %}
						</td>
						<td title="{{ item.barcode }}"><span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></td>
						<td class="flex" title="{{ item.name }}"><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
						<td class="flex" title="{{ item.owner.name }}">{% if item.owner %}<a href="/users/{{ item.owner._id | raw }}">{{ item.owner.name }}</a>{% else %}&mdash;{% endif %}</td>
						{% set group = item.group %}
						<td class="flex" title="{{ item.group.name }}">{% include '../../../groups/views/partials/group.swig' %}</td>
						{% set department = item.department %}
						<td class="flex" title="{{ item.department.name }}">{% include '../../../departments/views/partials/department.swig' %}</td>
						{% if total %}
							<td>&pound;{{ item.value }}</td>
						{% endif %}
					</tr>
				{% endfor %}
			</tbody>
			{% if total %}
				<tfoot>
					<tr>
						<th colspan="6">Total</th>
						<th>£{{ total }}</th>
					</tr>
				</tfoot>
			{% endif %}
		</table>
	</div>
{% else %}
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no items to display.</p>
{% endif %}
