{% set status = item.status %}
<h4>{% include 'status.swig' %}</h4>

<dl class="dl-horizontal">
	<dt>Barcode</dt>
	<dd><span data-clipboard-text="{{ item.barcode }}" class="clipboard">{{ item.barcode }}</span></dd>

	<dt>Department</dt>
	<dd>{% set department = item.department %}{% include '../../../departments/views/partials/department.swig' %}</dd>

	<dt>Group</dt>
	<dd>{% set group = item.group %}{% include '../../../groups/views/partials/group.swig' %}</dd>

	{% if item.value %}
		<dt>Value</dt>
		<dd>£{{ item.value }}</dd>
	{% endif %}

	{% if item.notes %}
		<dt>Notes</dt>
		<dd>{{ item.notes }}</dd>
	{% endif %}
</dl>
