{% if onloan.length > 0 %}
	{% set items = onloan %}
	{% include 'user-items.swig' %}
{% else %}
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">No items are on loan.</p>
{% endif %}
