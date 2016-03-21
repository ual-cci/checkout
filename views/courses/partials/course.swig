{% if loggedInUser.isAdmin %}
	<a href="/courses/{{ course.id | raw }}">{{ course.name }}</a>
{% else %}
	{{ course.name }}
{% endif %}