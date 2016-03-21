<form method="post">
	<p>
		<label>Name:</label>
		<input id="name" name="name" type="text" value="{{ item.name }}" required />
	</p>
	<p>
		<label>Barcode:</label>
		<input id="barcode" name="barcode" type="text" value="{{ item.barcode }}" autocomplete="off" required />
	</p>
	<p>
		<label>Department:</label>
		<select id="department" name="department">
			<option value="" disabled selected>Select a department</option>
			{% for department in departments %}
				<option value="{{ department._id | raw }}"{% if ( department.id == item.department | raw ) %} selected{% endif %}>{{ department.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<label>Value:</label> £
		<input id="value" name="value" type="number" value="{{ item.value }}" />
	</p>
	<p>
		<label>Notes:</label>
		<input id="notes" name="notes" type="text" value="{{ item.notes }}" />
	</p>
	<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>