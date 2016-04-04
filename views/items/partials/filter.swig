<form method="get">
	<select id="department" name="department">
		<option value="" selected>All departments</option>
		{% for department in departments %}
			<option value="{{ department._id | raw }}"{% if ( department.id == selectedDepartment | raw ) %} selected{% endif %}>{{ department.name }}</option>
		{% endfor %}
	</select>
	<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-filter"></span></button>
</form>