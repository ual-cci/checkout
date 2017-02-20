<form method="post" class="form-horizontal">
	<div class="form-group">
		<label for="name" class="col-md-2 control-label">Name</label>
		<div class="col-md-4">
			<input id="name" name="name" type="text" value="{{ item.name }}" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="barcode" class="col-md-2 control-label">Barcode</label>
		<div class="col-md-4">
			<input id="barcode" name="barcode" type="text" value="{{ item.barcode }}" autocomplete="off" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="group" class="col-md-2 control-label">Group</label>
		<div class="col-md-4">
			<select id="group" name="group" class="form-control">
				<option value="" selected>Select a group</option>
				{% for group in groups %}
					<option value="{{ group._id | raw }}"{% if ( group.id == item.group | raw ) %} selected{% endif %}>{{ group.name }}</option>
				{% endfor %}
			</select>
		</div>
	</div>

	<div class="form-group">
		<label for="department" class="col-md-2 control-label">Department</label>
		<div class="col-md-4">
			<select id="department" name="department" class="form-control" required>
				<option value="" disabled selected>Select a department</option>
				{% for department in departments %}
					<option value="{{ department._id | raw }}"{% if ( department.id == item.department | raw ) %} selected{% endif %}>{{ department.name }}</option>
				{% endfor %}
			</select>
		</div>
	</div>

	<div class="form-group">
		<label for="value" class="col-md-2 control-label">Value</label>
		<div class="col-md-4">
			<div class="input-group">
				<span class="input-group-addon" id="basic-addon1">&pound;</span>
				<input id="value" name="value" type="number" value="{{ item.value }}" class="form-control" />
			</div>
		</div>
	</div>

	{% if action == 'Create' %}
		<div class="form-group">
			<div class="col-md-offset-2 col-md-4">
				<div class="checkbox">
					<label for="print"><input id="print" name="print" type="checkbox" checked /> Print Barcode Labels</label>
				</div>
			</div>
		</div>
	{% endif %}

	<div class="form-group">
		<label for="notes" class="col-md-2 control-label">Notes</label>
		<div class="col-md-4">
			<input id="notes" name="notes" type="text" value="{{ item.notes }}" class="form-control" />
		</div>
	</div>

	<div class="form-group">
		<div class="col-md-4 col-md-offset-2">
			<button type="submit" class="btn btn-default">{{ action }}</button>
		</div>
	</div>
</form>
