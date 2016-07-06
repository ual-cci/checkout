{% extends '../admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/checkout.js"></script>
{% endblock %}

{% block title %}{% parent %}{% endblock %}

{% block content %}
	<div class="panel panel-default">
		<div class="panel-body">
			<form class="navbar-form navbar-left" id="find" role="search">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1"><span class="glyphicon glyphicon-search"></span></span>
					<input type="text" class="form-control">
				</div>
				<div class="btn-group" role="group">
					<button type="button" data-action="issue" class="btn btn-primary item-issue" style="display:none;" accesskey='i'>Issue <span class="badge">I</span></button>
					<button type="button" data-action="reserve" class="btn btn-default reserve" style="display:none;" accesskey='r'>Reserve <span class="badge">R</span></button>
					<button type="button" data-action="broken" class="btn btn-default broken" style="display:none;" accesskey='b'>Broken <span class="badge">B</span></button>
					<button type="button" data-action="lost" class="btn btn-default lost" style="display:none;" accesskey='l'>Lost <span class="badge">L</span></button>
				</div>
				<button type="button" data-action="return" class="btn btn-primary return" style="display:none;">Return</button>
				<button type="button" data-action="issue" class="btn btn-primary user-issue" style="display:none;">Issue</button>
			</form>
		</div>
	</div>
	<div id="modules"></div>
{% endblock %}
