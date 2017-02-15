{% if group %}
	<a href="/groups/{{ group._id | raw }}">{{ group.name }}</a>
{% else %}
	&mdash;
{% endif %}
