{% extends '../../../src/views/admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/checkout.js"></script>
{% endblock %}

{% block title %}{% parent %}{% endblock %}

{% block content %}
	<div class="well clearfix">
		<div class="col-md-2">
			<h1 class="issued">&mdash;</h1>
			<h5>ISSUED</h5>
			<h6>TODAY</h6>
		</div>
		<div class="col-md-2">
			<h1 class="returned">&mdash;</h1>
			<h5>RETURNED</h5>
			<h6>TODAY</h6>
		</div>
		<div class="col-md-2">
			<h1 class="available">&mdash;</h1>
			<h5>AVAILABLE</h5>
		</div>
		<div class="col-md-2">
			<h1 class="onloan">&mdash;</h1>
			<h5>ON LOAN</h5>
		</div>
		<div class="col-md-2">
			<h1 class="lostbroken">&mdash;</h1>
			<h5>LOST/BROKEN</h5>
		</div>
		<div class="col-md-2">
			<h1 class="audit">&mdash;/&mdash;</h1>
			<h5>AUDIT</h5>
			<h6>SCANNED/UNSCANNED</h6>
		</div>
	</div>
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="find" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-search"></span></span>
					<input type="text" class="form-control">
				</div>
				<button type="button" data-action="issue" class="btn btn-default issue" style="display:none;" accesskey='i'>Issue <span class="badge">I</span></button>
				<button type="button" data-action="reserve" class="btn btn-default reserve" style="display:none;" accesskey='v'>Reserve <span class="badge">V</span></button>
				<button type="button" data-action="return" class="btn btn-default return" style="display:none" accesskey='r'>Return <span class="badge">R</span></button>
				<button type="button" data-action="broken" class="btn btn-default broken" style="display:none;" accesskey='b'>Broken <span class="badge">B</span></button>
				<button type="button" data-action="lost" class="btn btn-default lost" style="display:none;" accesskey='l'>Lost <span class="badge">L</span></button>
				<button type="button" data-action="multi-return" class="btn btn-default multi-return" accesskey='1'>Returns Mode <span class="badge">1</span></button>
			</form>
		</div>
	</div>
	<div id="status" style="overflow:hidden;" class="alert alert-warning">&nbsp;</div>
	<div id="modules"></div>
{% endblock %}
