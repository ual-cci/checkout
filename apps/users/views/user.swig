{% extends '../admin.swig' %}

{% block heading %}{{ user.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}
	<p>
		<a href="/users/{{ user._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
		{% if onloan.length > 0 %}
			<a class="btn btn-default" href="mailto:{{ user.email }}?cc={{ user.course.contact.email }}&subject={{ "IMPORTANT: Items due back" | url_encode }}&body={{ email | url_encode }}"><span class="glyphicon glyphicon-envelope"></span> Generate email</a>
		{% endif %}
	</p>

	{% include 'partials/onloan.swig' %}

	{% include 'partials/history.swig' %}
{% endblock %}
