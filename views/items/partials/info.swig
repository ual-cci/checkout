{% set status = item.status %}
<h4>{% include 'status.swig' %}</h4>
<p><strong>Barcode:</strong> {{ item.barcode }}</p>
<p><strong>Department:</strong> {% set department = item.department %}{% include '../../departments/partials/department.swig' %}</p>
{% if item.value %}
	<p><strong>Value:</strong> £{{ item.value }}</p>
{% endif %}

{% if item.notes %}
	<p><strong>Notes:</strong> {{ item.notes }}</p>
{% endif %}
