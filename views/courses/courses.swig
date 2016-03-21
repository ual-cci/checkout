{% extends '../admin.swig' %}

{% block heading %}Courses{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}	
	<p>
		<div class="btn-group" role="group">
			<a href="/courses/create" class="btn btn-default"><span class="glyphicon glyphicon-plus
"></span> New</a>
		</div>
	</p>

	{% include 'partials/course-list.swig' %}
{% endblock %}