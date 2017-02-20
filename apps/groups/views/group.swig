{% extends '../../../src/views/admin.swig' %}

{% block heading %}{{ group.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Groups – {% parent %}{% endblock %}

{% block content %}
	{% if group.limiter %}
		<dl class="dl-horizontal">
			<dt>Item limit</dt>
			<dd>{{ group.limiter }}</dd>
		</dl>
	{% endif %}
	<p>
		<div class="btn-group" role="group">
			<a href="/groups/{{ group._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil
"></span> Edit</a>
		</div>
	</p>

	<hr />

	<h3>Items</h3>
	{% if items.length > 0 %}
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Status</th>
						<th>Barcode</th>
						<th>Name</th>
						<th>Department</th>
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
							{% set department = item.department %}
							<td>{% include '../../departments/views/partials/department.swig' %}</td>
						</tr>
					{% endfor %}
				</tbody>
			</table>
		</div>
	{% else %}
		<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no items to display.</p>
	{% endif %}

{% endblock %}
