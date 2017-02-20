<dl class="dl-horizontal">
	<dt>Barcode</dt>
	<dd><span data-clipboard-text="{{ user.barcode }}" class="clipboard">{{ user.barcode }}</span></dd>

	<dt>Course</dt>
	<dd>{% set course = user.course %}{% include '../../../courses/views/partials/course.swig' %}</dd>

	{% if user.course.contact.name %}
		<dt>Staff Contact</dt>
		<dd><a href="/users/{{ user.course.contact._id | raw }}">{{ user.course.contact.name }}</a></dd>
	{% endif %}

	<dt>Email</dt>
	<dd><a href="mailto:{{ user.email }}">{{ user.email }}</a></dd>

	<dt>Status</dt>
	<dd>{% if user.disable %}Disabled{% else %}Active{% endif %}</dd>

	<dt>Loan Agreement</dt>
	<dd>{% if user.read_tc %}Read{% else %}Unread{% endif %}</dd>

	<dt>Type</dt>
	<dd>{% if user.type == 'staff' %}Staff{% else %}User{% endif %}</dd>
</dl>
