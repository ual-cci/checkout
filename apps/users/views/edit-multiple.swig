{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit Multiple Users{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<form action="/users/edit" method="post" class="form-horizontal">
		<div class="form-group">
			<label for="status" class="col-md-2 control-label">Status</label>
			<div class="col-md-4">
				<div class="input-group">
					<select id="status" name="status" class="form-control">
						<option value="" disabled selected>&mdash;</option>
						<option value="active">Active</option>
						<option value="disabled">Disabled</option>
					</select>
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="status">
					</span>
				</div>
			</div>
		</div>

		<div class="form-group">
			<label for="course" class="col-md-2 control-label">Course</label>
			<div class="col-md-4">
				<div class="input-group">
					<select id="course" name="course" class="form-control">
						<option value="" disabled selected>Select a course</option>
						{% for course in courses %}
							<option value="{{ course._id | raw }}">{{ course.name }}</option>
						{% endfor %}
					</select>
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="course">
					</span>
				</div>
			</div>
		</div>

		<div class="form-group">
			<div class="col-md-4 col-md-offset-2">
				<button type="submit" class="btn btn-default">Update</button>
			</div>
		</div>

		<h3>Items</h3>

		{% set edit = true %}
		{% set edit_users = true %}
		{% include 'partials/user-list.swig' %}
	</form>
{% endblock %}
