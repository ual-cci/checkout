{% if course.contact %}
	<a href="/users/{{ course.contact.id | raw }}">{{ course.contact.name }}</a>
{% else %}
	&mdash;
{% endif %}
