{% extends '../../../src/views/admin.swig' %}

{% block heading %}{{ user.name }}{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Users – {% parent %}{% endblock %}

{% block content %}
	{% include 'partials/info.swig' %}
	<p>
		<a href="/users/{{ user._id | raw }}/edit" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
		{% if onloan.length > 0 %}
			<a class="btn btn-default" href="mailto:{{ user.email }}?cc={{ user.course.contact.email }}&subject={{ "IMPORTANT: Items due back" | url_encode }}&body={{ email | url_encode }}"><span class="glyphicon glyphicon-envelope"></span> Generate email</a>
		{% endif %}
	</p>

	<hr />

	<h3>Items</h3>

	<ul class="nav nav-tabs">
		<li role="presentation" class="active" role="tablist">
			<a href="#onloan" aria-controls="users" role="tab" data-toggle="tab">On Loan</a>
		</li>
		<li role="presentation" role="tablist">
			<a href="#history" aria-controls="items" role="tab" data-toggle="tab">History</a>
		</li>
	</ul>

	<div class="tab-content">
		<div role="tabpanel" class="tab-pane active" id="onloan">
			{% include 'partials/onloan.swig' %}
		</div>
		<div role="tabpanel" class="tab-pane" id="history">
			{% include 'partials/history.swig' %}
		</div>
	</div>
{% endblock %}
