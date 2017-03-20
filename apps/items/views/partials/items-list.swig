{% if items.length > 0 %}
	<div class="table-responsive">
		<table class="table table-striped">
			<thead>
				<tr>
					{% if edit %}
						<th>
							<input class="checkall" type="checkbox" title="Check All" {% if edit_items %}checked{% endif %} />
						</th>
					{% endif %}
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
						{% if edit %}
							<td>
								<input type="checkbox" name="edit" value="{{ item._id | raw }}" {% if edit_items %}checked{% endif %} />
							</td>
						{% endif %}
						<td>
							{% set status = item.status %}
							{% include 'status.swig' %}
						</td>
						<td title="{{ item.barcode }}">{% if loggedInUser.printer %}<a href="/items/{{ item._id | raw }}/label?printer={{ loggedInUser.printer._id | raw }}"><span class="glyphicon glyphicon-print"></span></a> {% endif %}<span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></td>
						<td title="{{ item.name }}"><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
						<td title="{{ item.owner.name }}">{% if item.owner %}<a href="/users/{{ item.owner._id | raw }}">{{ item.owner.name }}</a>{% else %}&mdash;{% endif %}</td>
						{% set group = item.group %}
						<td title="{{ item.group.name }}">{% include '../../../groups/views/partials/group.swig' %}</td>
						{% set department = item.department %}
						<td title="{{ item.department.name }}">{% include '../../../departments/views/partials/department.swig' %}</td>
						{% if total %}
							<td>&pound;{{ item.value }}</td>
						{% endif %}
					</tr>
				{% endfor %}
			</tbody>
			{% if total %}
				<tfoot>
					<tr>
						<th></th>
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
