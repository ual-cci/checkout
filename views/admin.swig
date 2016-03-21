{% extends 'layout.swig' %}

{% block title %}Dashboard – {% parent %}{% endblock %}

{% block head %}
	{% parent %}
	<link rel="stylesheet" type="text/css" href="/css/dashboard.css">
{% endblock %}

{% block page %}
	<div class="container">
		<div class="row">
			<h2 class="page-header">{% block heading %}{% endblock %}</h2>
			{% include 'partials/flash.swig' %}
			{% block content %}{% endblock %}
		</div>
	</div>
{% endblock %}