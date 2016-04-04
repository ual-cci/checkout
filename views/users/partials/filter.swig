<form method="get">
	<select id="course" name="course">
		<option value="" selected>All courses</option>
		{% for course in courses %}
			<option value="{{ course._id | raw }}"{% if ( course.id == selectedCourse | raw ) %} selected{% endif %}>{{ course.name }}</option>
		{% endfor %}
	</select>
	<button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-filter"></span></button>
</form>