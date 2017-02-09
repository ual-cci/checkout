<h4>{% include 'label.swig' %}</h4>

<p><strong>Course:</strong> {% set course = user.course %}{% include '../../courses/partials/course.swig' %}</p>

{% if user.course.contact.name %}
	<p><strong>Staff Contact:</strong> <a href="/users/{{ user.course.contact._id | raw }}">{{ user.course.contact.name }}</a></p>
{% endif %}

<p><strong>Email:</strong> <a href="mailto:{{ user.email }}">{{ user.email }}</a></p>

<p><strong>Barcode:</strong> <span data-clipboard-text="{{ user.barcode }}" class="clipboard">{{ user.barcode }}</span></p>

<p><strong>Read Loan Agreement:</strong> {% if user.read_tc %}Yes{% else %}No{% endif %}</p>
