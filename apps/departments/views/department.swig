{% extends '../../../src/views/admin.swig' %}

{% block heading %}{{ department.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Departments – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/departments/{{ department._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<h3>Items</h3>
	{% if items.length > 0 %}
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Status</th>
						<th>Barcode</th>
						<th>Name</th>
						<th>Group</th>
					</tr>
				</thead>
				<tbody>
					{% for item in items %}
						<tr>
							<td>
								{% set status = item.status %}
								{% include '../../items/views/partials/status.swig' %}
							</td>
							<td><span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></td>
							<td><a href="/items/{{ item._id | raw }}">{{ item.name }}</a></td>
							{% set group = item.group %}
							<td>{% include '../../groups/views/partials/group.swig' %}</td>
						</tr>
					{% endfor %}
				</tbody>
			</table>
		</div>
	{% else %}
		<p>There are no items to display.</p>
	{% endif %}

{% endblock %}
