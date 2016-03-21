{% extends '../admin.swig' %}

{% block heading %}{{ user.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% include '../users/partials/info.swig' %}

	<p>
		<a href="/profile/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
	</p>

	{% include '../users/partials/onloan.swig' %}
{% endblock %}