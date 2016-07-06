{% extends '../admin.swig' %}

{% block heading %}Generate items{% endblock %}
{% block title %}{% block heading %}{% endblock %} – Items – {% parent %}{% endblock %}

{% block content %}
	<form method="post">
		<p>
			<label>Name:</label>
			<input id="name" name="name" type="text" value="{{ item.name }}" required />
			<input id="suffix" name="suffix" type="checkbox" checked /> <label for="suffix">Suffix name with index number</label>

		</p>
		<p>
			<label>Group:</label>
			<select id="group" name="group">
				<option value="" disabled selected>Select a group</option>
				{% for group in groups %}
					<option value="{{ group._id | raw }}"{% if ( group.id == item.group | raw ) %} selected{% endif %}>{{ group.name }}</option>
				{% endfor %}
			</select>
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
		<h3>Barcode</h3>
		<p>
			<label>Prefix:</label>
			<input id="prefix" name="prefix" type="text" autocomplete="off" required />
		</p>
		<p>
			<label>Start:</label>
			<input id="start" name="start" type="number" min="1" max="98" value="{{ item.start }}" autocomplete="off" required />
		</p>
		<p>
			<label>End:</label>
			<input id="end" name="end" type="number" min="2" max="99" value="{{ item.end }}" autocomplete="off" required />
		</p>
		<p>
			<input id="autoAudit" name="autoAudit" type="checkbox" checked /> <label for="autoAudit">Automatically audit item ready for issue?</label>
		</p>
		<p>
			<input id="largeBatch" name="largeBatch" type="checkbox"  /> <label for="largeBatch">I am generating a batch larger than 25 items</label>
		</p>
		<p>
			<input type="submit" class="btn btn-default" value="Generate" />
		</p>
	</form>
{% endblock %}
