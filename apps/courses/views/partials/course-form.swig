<form method="post">
	<p>
		<label for="name">Name:</label>
		<input id="name" name="name" type="text" value="{{ course.name }}" class="form-control" required autocomplete="off" />
	</p>
	<p>
		<label for="contact">Contact:</label>
		<select id="contact" name="contact" class="form-control">
			<option value="" selected>Select a course contact</option>
			{% for user in users %}
				<option value="{{ user._id | raw }}"{% if ( user.id == course.contact | raw ) %} selected{% endif %}>{{ user.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>
