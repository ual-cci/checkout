{% extends 'item.swig' %}

{% block actions %}
	<li><a href="/items/{{ item._id | raw }}/reserve">Reserve</a></li>
	<li><a href="/items/{{ item._id | raw }}/return">Return</a></li>
{% endblock %}

{% block transactions %}{% endblock %}