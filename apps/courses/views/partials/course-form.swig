<form method="post" class="form-horizontal">
	<div class="form-group">
		<label for="name" class="col-md-2 control-label">Name</label>
		<div class="col-md-4">
			<input id="name" name="name" type="text" value="{{ course.name }}" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<label for="contact" class="col-md-2 control-label">Contact</label>
		<div class="col-md-4">
			<select id="contact" name="contact" class="form-control">
				<option value="" selected>Select a course contact</option>
				{% for user in users %}
					<option value="{{ user._id | raw }}"{% if ( user.id == course.contact | raw ) %} selected{% endif %}>{{ user.name }}</option>
				{% endfor %}
			</select>
		</div>
	</div>

	<div class="form-group">
		<div class="col-md-4 col-md-offset-2">
			<button type="submit" class="btn btn-default">{{ action }}</button>
		</div>
	</div>
</form>
