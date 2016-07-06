{% if loggedInUser.isAdmin %}
	<a href="/groups/{{ group._id | raw }}">{{ group.name }}</a>
{% else %}
	{{ group.name }}
{% endif %}
