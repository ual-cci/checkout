<h4>{% include 'label.swig' %}</h4>

<p><strong>Course:</strong> {% set course = user.course %}{% include '../../courses/partials/course.swig' %}</p>

<p><strong>Email:</strong> <a href="mailto:{{ user.email }}">{{ user.email }}</a></p>

<p><strong>Barcode:</strong> {{ user.barcode }}</p>

<p><strong>Read Loan Agreement:</strong> {% if user.read_tc %}Yes{% else %}No{% endif %}</p>
