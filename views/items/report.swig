{% extends '../admin.swig' %}

{% block head %}
	{% parent %}
	<script type="text/javascript" src="/js/hold-focus.js"></script>
	<script type="text/javascript">
		focusOn = '#barcode';
	</script>
{% endblock %}

{% block heading %}Report{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<form method="get">
		<select id="department" name="department">
			<option value="" selected>All departments</option>
			{% for department in departments %}
				<option value="{{ department._id | raw }}"{% if ( department.id == selectedDepartment | raw ) %} selected{% endif %}>{{ department.name }}</option>
			{% endfor %}
		</select>
		<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-filter"></span></button>
	</form>

	<h3>Scanned</h3>
	<p>Items audited today.</p>
	{% set items = audited %}
	{% include 'partials/items-list.swig' %}

	<h3>Pending</h3>
	<p>Items not yet audited today.</p>
	{% set items = missing %}
	{% include 'partials/items-list.swig' %}

	<h3>On Loan</h3>
	{% set items = onloan %}
	{% include 'partials/items-list.swig' %}

	<h3>Reserved</h3>
	{% set items = reserved %}
	{% include 'partials/items-list.swig' %}

	<h3>Broken</h3>
	{% set items = broken %}
	{% include 'partials/items-list.swig' %}
{% endblock %}