{% extends '../admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/dashboard.js"></script>
{% endblock %}

{% block heading %}Checkout 2{% endblock %}

{% block title %}{% parent %}{% endblock %}

{% block content %}
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="cmd" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-search"></span></span>
					<input type="text" class="form-control">
				</div>
			</form>
		</div>
	</div>
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="cmd" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-barcode"></span></span>
					<input type="text" class="form-control">
				</div>
				<div class="btn-group" role="group">
					<button type="button" class="btn btn-primary">Issue <span class="badge">I</span></button>
					<button type="button" class="btn btn-default">Reserve <span class="badge">V</span></button>
					<button type="button" class="btn btn-default">Broken <span class="badge">B</span></button>
					<button type="button" class="btn btn-default">Lost <span class="badge">L</span></button>
				</div>
			</form>
		</div>
	</div>
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="cmd" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-barcode"></span></span>
					<input type="text" class="form-control">
				</div>
				<button class="btn btn-primary">Return</button>
			</form>
		</div>
	</div>
	<div class="panel panel-info">
		<div class="panel-heading">
			<h3 class="panel-title"><span class="glyphicon glyphicon-tag"></span> Arduino Pack (Uno) #01</h3>
		</div>
		<div class="panel-body">
			<div class="alert alert-danger">Item already on loan</div>
			<h4><span class="label label-danger">On Loan</span></h4>
			<p><strong>Barcode:</strong> APK 01</p>
			<p><strong>Group:</strong> <a href="">Arduino Pack</a></p>
			<p><strong>Department:</strong> <a href="">Prototyping Lab (DLG11d)</a></p>
		</div>
	</div>
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="cmd" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-user"></span></span>
					<input type="text" class="form-control">
				</div>
				<button class="btn btn-primary">Issue</button>
			</form>
		</div>
	</div>
	<div class="panel panel-info">
		<div class="panel-heading">
			<h3 class="panel-title"><span class="glyphicon glyphicon-user"></span> Tom Lynch</h3>
		</div>
		<div class="panel-body">
			Panel content
		</div>
	</div>
{% endblock %}
