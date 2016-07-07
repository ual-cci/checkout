<div class="panel panel-primary" data-id="{{ item.barcode }}">
	<div class="panel-heading">
		<h3 class="panel-title"><span class="glyphicon glyphicon-tag"></span> <a href="/items/{{ item._id | raw }}">{{ item.name }}</a></h3>
	</div>
	<div class="panel-body">
		{% set status = item.status %}
		<h4>{% include '../../items/partials/status.swig' %}</h4>
		<p><strong>Barcode:</strong> {{ item.barcode }}</p>
		{% if item.group %}
			<p><strong>Group:</strong> <a target="_blank" href="/groups/{{ item.group._id | raw }}">{{ item.group.name }}</a>{% if item.group.limiter %}<small><em> (Limit per user:</strong> {{ item.group.limiter }})</em></small>{% endif %}</p>
		{% endif %}
		{% if item.owner %}
			<p><strong>Owner:</strong> <a target="_blank" href="/users/{{ item.owner._id | raw }}">{{ item.owner.name }}</a></p>
		{% endif %}
		<p><strong>Department:</strong> <a target="_blank" href="/departments/{{ item.department._id | raw }}">{{ item.department.name }}</a></p>
	</div>
</div>
