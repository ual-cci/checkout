<form method="post">
	<p>
		<label for="name">Name:</label>
		<input id="name" name="name" type="text" value="{{ user.name }}" class="form-control" required autocomplete="off" />
	</p>
	<p>
		<label for="email">Email:</label>
		<input id="email" name="email" type="text" value="{{ user.email }}" class="form-control" autocomplete="off" />
	</p>
	<p>
		<label for="course">Course:</label>
		<select id="course" name="course" class="form-control">
			<option value="" disabled selected>Select a course</option>
			{% for course in courses %}
				<option value="{{ course._id | raw }}"{% if ( course.id == user.course | raw ) %} selected{% endif %}>{{ course.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<label for="printer">Printer:</label>
		<select id="printer" name="printer" class="form-control">
			<option value="">None</option>
			{% for printer in printers %}
				<option value="{{ printer._id | raw }}"{% if ( printer.id == user.printer | raw ) %} selected{% endif %}>{{ printer.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<label for="barcode">Barcode:</label>
		<input id="barcode" name="barcode" type="text" value="{{ user.barcode }}" required maxlength="12" class="form-control" autocomplete="off" required />
	</p>
	<p>
		<label for="type">Type:</label>
		<select id="type" name="type" class="form-control">
			<option value="student" {% if user.type == 'student' %}selected{% endif %}>User</option>
			<option value="staff" {% if user.type == 'staff' %}selected{% endif %}>Admin</option>
		</select>
	</p>
	<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>
