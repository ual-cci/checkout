{% extends '../../../src/views/admin.swig' %}

{% block heading %}Edit Multiple Items{% endblock %}
{% block title %}{% block heading %}{% endblock %} – {% parent %}{% endblock %}

{% block content %}
	<form action="/items/edit" method="post" class="form-horizontal">
		<div class="form-group">
			<label for="group" class="col-md-2 control-label">Group</label>
			<div class="col-md-4">
				<div class="input-group">
					<select id="group" name="group" class="form-control">
						<option value="" selected>Select a group</option>
						{% for group in groups %}
							<option value="{{ group._id | raw }}">{{ group.name }}</option>
						{% endfor %}
					</select>
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="group">
					</span>
				</div>
			</div>
		</div>

		<div class="form-group">
			<label for="department" class="col-md-2 control-label">Department</label>
			<div class="col-md-4">
				<div class="input-group">
					<select id="department" name="department" class="form-control">
						<option value="" disabled selected>Select a department</option>
						{% for department in departments %}
							<option value="{{ department._id | raw }}">{{ department.name }}</option>
						{% endfor %}
					</select>
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="department">
					</span>
				</div>
			</div>
		</div>

		<div class="form-group">
			<label for="value" class="col-md-2 control-label">Value</label>
			<div class="col-md-4">
				<div class="input-group">
					<span class="input-group-addon" id="basic-addon1">&pound;</span>
					<input id="value" name="value" type="number" class="form-control" />
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="value">
					</span>
				</div>
			</div>
		</div>

		<div class="form-group">
			<label for="notes" class="col-md-2 control-label">Notes</label>
			<div class="col-md-4">
				<div class="input-group">
					<input id="notes" name="notes" type="text" class="form-control" />
					<span class="input-group-addon">
						<input type="checkbox" name="fields[]" value="notes">
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
		{% set edit_items = true %}
		{% include 'partials/items-list.swig' %}
	</form>
{% endblock %}
