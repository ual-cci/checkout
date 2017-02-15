<div class="panel panel-default" data-id="{{ user.barcode }}">
	<div class="panel-heading">
		<h3 class="panel-title"><span class="glyphicon glyphicon-plus"></span> Unknown User: {{ user.barcode }}</h3>
	</div>
	<div class="panel-body">
		<h4>Create User</h4>
		<form method="post">
			<p>
				<label for="name">Name:</label>
				<input id="name" name="name" type="text" value="{{ user.name }}" required autocomplete="off" />
			</p>
			<p>
				<label for="email">Email:</label>
				<input id="email" name="email" type="text" value="{{ user.email }}" autocomplete="off" />
			</p>
			<p>
				<label for="course">Course:</label>
				<select id="course" name="course">
					<option value="" disabled selected>Select a course</option>
					{% for course in courses %}
						<option value="{{ course._id | raw }}"{% if ( course.id == user.course | raw ) %} selected{% endif %}>{{ course.name }}</option>
					{% endfor %}
				</select>
			</p>
			<p>
				<input type="submit" class="btn btn-default" value="Create" />
			</p>
		</form>

	</div>
</div>
