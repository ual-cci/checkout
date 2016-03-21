{% extends 'admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/dashboard.js"></script>
{% endblock %}

{% block heading %}Checkout{% endblock %}

{% block title %}{% parent %}{% endblock %}

{% block content %}
	<form class="navbar-form navbar-left" id="cmd" role="search">
		<div class="input-group">
			<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-barcode"></span></span>
			<input type="text" class="form-control" style="text-align: center;">
			<span class="input-group-btn">
				<button type="submit" class="btn btn-default"><span class="glyphicon glyphicon-chevron-right"></span></button>
			</span>
		</div>
	</form>
{% endblock %}