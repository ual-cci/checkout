{% extends '../admin.swig' %}

{% block heading %}Groups{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<p>
		<div class="btn-group" role="group">
			<a href="/groups/create" class="btn btn-default"><span class="glyphicon glyphicon-plus
"></span> New</a>
		</div>
	</p>


	{% include 'partials/groups-list.swig' %}
{% endblock %}
