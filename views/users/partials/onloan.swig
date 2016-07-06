<h3>On Loan</h3>
{% if onloan.length > 0 %}
	{% set items = onloan %}
	{% include 'user-items.swig' %}
{% else %}
	<p>No items are on loan.</p>
{% endif %}
