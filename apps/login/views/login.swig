{% extends '../../../src/views/layout.swig' %}

{% block title %}Login{% endblock %}

{% block head %}
	{% parent %}
	<link rel="stylesheet" type="text/css" href="/css/login.css">
{% endblock %}

{% block page %}
	<div class="container">
		<form method="post" action="/login" class="form-signin">
			<h2 class="form-signin-heading">Login</h2>
			{% include '../../../src/views/partials/flash.swig' %}
			<label for="inputEmail" class="sr-only">ID</label>
			<input type="password" name="id" id="id" class="form-control" placeholder="ID" required autofocus maxlength="12">
			<button class="btn btn-lg btn-primary btn-block" type="submit">Login</button>
		</form>
	</div>
{% endblock %}
