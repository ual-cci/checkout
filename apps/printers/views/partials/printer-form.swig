<form method="post">
	<p>
		<label for="name">Name:</label>
		<input id="name" name="name" type="text" value="{{ printer.name }}" class="form-control" required autocomplete="off" />
	</p>
	<p>
		<label for="url">URL:</label>
		<input id="url" name="url" type="text" value="{{ printer.url }}" class="form-control" required autocomplete="off" />
	</p>
<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>
