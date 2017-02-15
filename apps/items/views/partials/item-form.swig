<form method="post">
	<p>
		<label for="name">Name:</label>
		<input id="name" name="name" type="text" value="{{ item.name }}" required />
	</p>
	<p>
		<label for="barcode">Barcode:</label>
		<input id="barcode" name="barcode" type="text" value="{{ item.barcode }}" autocomplete="off" required />
	</p>
	<p>
		<label for="group">Group:</label>
		<select id="group" name="group">
			<option value="" selected>Select a group</option>
			{% for group in groups %}
				<option value="{{ group._id | raw }}"{% if ( group.id == item.group | raw ) %} selected{% endif %}>{{ group.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<label for="department">Department:</label>
		<select id="department" name="department" required>
			<option value="" disabled selected>Select a department</option>
			{% for department in departments %}
				<option value="{{ department._id | raw }}"{% if ( department.id == item.department | raw ) %} selected{% endif %}>{{ department.name }}</option>
			{% endfor %}
		</select>
	</p>
	<p>
		<label for="value">Value:</label> £
		<input id="value" name="value" type="number" value="{{ item.value }}" />
	</p>
	<p>
		<label for="notes">Notes:</label>
		<input id="notes" name="notes" type="text" value="{{ item.notes }}" />
	</p>
	{% if action == 'Create' %}
		<p>
			<input id="print" name="print" type="checkbox" checked /> <label for="print">Print Barcode Labels</label>
		</p>
	{% endif %}
	<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>
