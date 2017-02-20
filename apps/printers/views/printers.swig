{% extends '../../../src/views/admin.swig' %}

{% block heading %}Printers{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<a href="/printers/new" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span> New</a>
	{% if printers.length > 0 %}
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Name</th>
						<th>URL</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>
					{% for printer in printers %}
						<tr>
							<td>{{ printer.name }}</td>
							<td>{{ printer.url }}</td>
							<td><a href="/printers/{{ printer.id | raw }}/edit"><span class="glyphicon glyphicon-pencil"></span></a></td>
						</tr>
					{% endfor %}
				</tbody>
			</table>
		</div>
	{% else %}
		<p class="bg-warning" style="padding: 1em; margin-top: 1em;">There are no printers to display.</p>
	{% endif %}
{% endblock %}
