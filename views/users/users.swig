{% extends '../admin.swig' %}

{% block heading %}Users{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/users/create" class="btn btn-default"><span class="glyphicon glyphicon-plus
"></span> New</a>
		</div>
	</p>
	
	{% include 'partials/user-list.swig' %}
{% endblock %}