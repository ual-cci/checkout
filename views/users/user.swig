{% extends '../admin.swig' %}

{% block heading %}{{ user.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}

	<p>
		<a href="/users/{{ user._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
	</p>

	{% include 'partials/onloan.swig' %}

	{% include 'partials/history.swig' %}
{% endblock %}