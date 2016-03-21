{% extends '../admin.swig' %}

{% block heading %}Departments{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/departments/create" class="btn btn-default"><span class="glyphicon glyphicon-plus
"></span> New</a>
		</div>
	</p>

	
	{% include 'partials/department-list.swig' %}
{% endblock %}