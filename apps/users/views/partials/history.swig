<h3>History</h3>
{% if pastloan.length > 0 %}
	{% set items = pastloan %}
	{% include 'user-items.swig' %}
{% else %}
	<p>No items have previously been loaned to this user.</p>
{% endif %}