{% extends '../../../src/views/admin.swig' %}

{% block heading %}{{ item.name }}{% endblock %}
{% block title %}{{ item.name }} – Items – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}

	<a href="/items/{{ item._id | raw }}/edit" title="Edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>

	{% if loggedInUser.printer %}
		<div class="btn-group">
			<a href="/items/{{ item._id | raw }}/label?printer={{ loggedInUser.printer._id | raw }}" class="btn btn-default"><span class="glyphicon glyphicon-print"></span> Print Label to {{ loggedInUser.printer.name }}</a>
			{% if printers.length > 1 %}
				<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<span class="caret"></span>
					<span class="sr-only">Toggle Dropdown</span>
				</button>
					<ul class="dropdown-menu">
					<li class="dropdown-header">Other Printers</li>
					{% for printer in printers %}
						{% if printer._id.toString() != loggedInUser.printer._id.toString() %}
							<li><a href="/items/{{ item._id | raw }}/label?printer={{ printer._id | raw }}">{{ printer.name }}</a></li>
						{% endif %}
					{% endfor %}
				</ul>
			{% endif %}
		</div>
	{% endif %}

	<hr />

	{% block transactions %}
		{% include 'partials/transactions.swig' %}
	{% endblock %}
{% endblock %}
