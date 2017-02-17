<div class="row">
	<form method="get">
		<div class="col-md-2">
			<select id="course" name="course" class="form-control input-sm">
				<option value="" selected>All courses</option>
				{% for course in courses %}
					<option value="{{ course._id | raw }}"{% if ( course.id == selectedCourse | raw ) %} selected{% endif %}>{{ course.name }}</option>
				{% endfor %}
			</select>
		</div>
		<div class="col-md-1">
			<button class="btn btn-default btn-sm"><span class="glyphicon glyphicon-filter"></span></button>
		</div>
	</form>
</div>
