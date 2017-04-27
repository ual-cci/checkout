<form method="post" class="form-horizontal">
	<div class="form-group">
		<label for="barcode" class="col-md-2 control-label">Barcode</label>
		<div class="col-md-4">
			<input id="barcode" name="barcode" type="text" value="{{ user.barcode }}" autocomplete="off" class="form-control" required />
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

	{% if action == 'Update' %}
		<div class="form-group">
			<div class="col-md-4 col-md-offset-2">
				<div class="checkbox">
					<label for="disable"><input id="disable" name="disable" type="checkbox" {% if user.disable %}checked{% endif %} /> Disable User</label>
				</div>
			</div>
		</div>
	{% endif %}

	<div class="page-header">
		<h3>Details</h3>
	</div>

	<div class="form-group">
		<label for="name" class="col-md-2 control-label">Name</label>
		<div class="col-md-4">
			<input id="name" name="name" type="text" value="{{ user.name }}" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="email" class="col-md-2 control-label">Email</label>
		<div class="col-md-4">
			<input id="email" name="email" type="text" required value="{{ user.email }}" class="form-control" autocomplete="off" />
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

	<div class="page-header">
		<h3>Preferences</h3>
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

	{% if action == 'Update' %}
		<div class="form-group">
			<label for="audit_point" class="col-md-2 control-label">Audit Point</label>
			<div class="col-md-4">
				<input name="audit_point" id="audit_point" type="datetime-local" class="form-control" value="{{ user.audit_point | date('Y-m-d\TH:i:s') }}">
			</div>
		</div>
	{% endif %}

	<hr />

	<div class="form-group">
		<div class="col-md-4 col-md-offset-2">
			<button type="submit" class="btn btn-primary">{{ action }}</button>
		</div>
	</div>
</form>
