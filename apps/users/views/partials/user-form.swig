<form method="post" class="form-horizontal">
	<div class="form-group">
		<label for="name" class="col-md-2 control-label">Name</label>
		<div class="col-md-4">
			<input id="name" name="name" type="text" value="{{ user.name }}" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="barcode" class="col-md-2 control-label">Barcode</label>
		<div class="col-md-4">
			<input id="barcode" name="barcode" type="text" value="{{ user.barcode }}" autocomplete="off" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="email" class="col-md-2 control-label">Email</label>
		<div class="col-md-4">
			<input id="email" name="email" type="text" value="{{ user.email }}" class="form-control" autocomplete="off" />
		</div>
	</div>

	<div class="form-group">
		<label for="course" class="col-md-2 control-label">Course</label>
		<div class="col-md-4">
			<select id="course" name="course" class="form-control">
				<option value="" disabled selected>Select a course</option>
				{% for course in courses %}
					<option value="{{ course._id | raw }}"{% if ( course.id == user.course | raw ) %} selected{% endif %}>{{ course.name }}</option>
				{% endfor %}
			</select>
		</div>
	</div>

	<div class="form-group">
		<label for="printer" class="col-md-2 control-label">Printer</label>
		<div class="col-md-4">
			<select id="printer" name="printer" class="form-control">
				<option value="">None</option>
				{% for printer in printers %}
					<option value="{{ printer._id | raw }}"{% if ( printer.id == user.printer | raw ) %} selected{% endif %}>{{ printer.name }}</option>
				{% endfor %}
			</select>
		</div>
	</div>

	<div class="form-group">
		<label for="type" class="col-md-2 control-label">Type</label>
		<div class="col-md-4">
			<select id="type" name="type" class="form-control">
				<option value="student" {% if user.type == 'student' %}selected{% endif %}>User</option>
				<option value="staff" {% if user.type == 'staff' %}selected{% endif %}>Admin</option>
			</select>
		</div>
	</div>

	<div class="form-group">
		<div class="col-md-4 col-md-offset-2">
			<button type="submit" class="btn btn-default">{{ action }}</button>
		</div>
	</div>
</form>
