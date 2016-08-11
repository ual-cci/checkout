<form method="get">
	<select id="group" name="group">
		<option value="" selected>All groups</option>
		{% for group in groups %}
			<option value="{{ group._id | raw }}"{% if ( group.id == selectedGroup | raw ) %} selected{% endif %}>{{ group.name }}</option>
		{% endfor %}
	</select>
	<select id="department" name="department">
		<option value="" selected>All departments</option>
		{% for department in departments %}
			<option value="{{ department._id | raw }}"{% if ( department.id == selectedDepartment | raw ) %} selected{% endif %}>{{ department.name }}</option>
		{% endfor %}
	</select>
	<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-filter"></span></button>
</form>
