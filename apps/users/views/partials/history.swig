{% if pastloan.length > 0 %}
	{% set items = pastloan %}
	{% include 'user-items.swig' %}
{% else %}
	<p class="bg-warning" style="padding: 1em; margin-top: 1em;">No items have previously been loaned to this user.</p>
{% endif %}
