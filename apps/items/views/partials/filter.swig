<div class="row">
	<form method="get">
		<div class="col-md-2">
			<select id="group" name="group" class="form-control">
				<option value="" selected>All groups</option>
				{% for group in groups %}
					<option value="{{ group._id | raw }}"{% if ( group.id == selectedGroup | raw ) %} selected{% endif %}>{{ group.name }}</option>
				{% endfor %}
			</select>
		</div>
		<div class="col-md-2">
			<select id="department" name="department" class="form-control">
				<option value="" selected>All departments</option>
				{% for department in departments %}
					<option value="{{ department._id | raw }}"{% if ( department.id == selectedDepartment | raw ) %} selected{% endif %}>{{ department.name }}</option>
				{% endfor %}
			</select>
		</div>
		<div class="col-md-1">
			<button class="btn btn-default"><span class="glyphicon glyphicon-filter"></span></button>
		</div>
	</form>
</div>
