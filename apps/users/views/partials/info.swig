<h4>{% include 'label.swig' %}</h4>

<dl class="dl-horizontal">
	<dt>Course</dt>
	<dd>{% set course = user.course %}{% include '../../../courses/views/partials/course.swig' %}</dd>

	{% if user.course.contact.name %}
		<dt>Staff Contact</dt>
		<dd><a href="/users/{{ user.course.contact._id | raw }}">{{ user.course.contact.name }}</a></dd>
	{% endif %}


	<dt>Email</dt>
	<dd><a href="mailto:{{ user.email }}">{{ user.email }}</a></dd>

	<dt>Barcode</dt>
	<dd><span data-clipboard-text="{{ user.barcode }}" class="clipboard">{{ user.barcode }}</span></dd>

	<dt>Read Loan Agreement</dt>
	<dd>{% if user.read_tc %}Yes{% else %}No{% endif %}</dd>
</dl>
