{% extends '../../../src/views/admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/buzz.js"></script>
	<script type="text/javascript" src="/js/audit.js"></script>
{% endblock %}

{% block heading %}Audit Scan{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<div class="row">
		<form method="post">
			<div class="col-md-3">
				<div class="input-group">
					<input type="text" id="barcode" name="barcode" required autocomplete="off" class="form-control">
					<span class="input-group-btn">
						<button class="btn btn-default"><span class="glyphicon glyphicon-barcode"></span></button>
					</span>
				</div>
			</div>
			<div class="col-md-3">
				<div class="input-group">
					<select id="department" class="form-control">
						<option value="">Don't change department</option>
						{% for department in departments %}
							<option value="{{ department._id | raw }}">{{ department.name }}</option>
						{% endfor %}
					</select>
				</div>
			</div>
		</form>
	</div>
{% endblock %}
