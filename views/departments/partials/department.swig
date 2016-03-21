{% if loggedInUser.isAdmin %}
	<a href="/departments/{{ department._id | raw }}">{{ department.name }}</a>
{% else %}
	{{ department.name }}
{% endif %}