{% extends '../admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/buzz.js"></script>
	<script type="text/javascript" src="/js/audit.js"></script>
{% endblock %}

{% block heading %}Audit Scan{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<form method="post">
		<p>
			<div class="input-group" style="max-width: 15em;">
				<input type="text" id="barcode" name="barcode" required autocomplete="off" class="form-control">
				<span class="input-group-btn">
					<button class="btn btn-default"><span class="glyphicon glyphicon-barcode"></span></button>
				</span>
			</div>
		</p>
		<input type="hidden" name="modal" value="/items/audit">
	</form>
{% endblock %}
