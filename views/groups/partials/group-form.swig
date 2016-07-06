<form method="post">
	<p>
		<label for="name">Name:</label>
		<input id="name" name="name" type="text" value="{{ group.name }}" required autocomplete="off" />
	</p>
	<p>
		<label for="limiter">Limiter:</label>
		<input id="limiter" name="limiter" type="number" value="{{ group.limiter }}" />
	</p>
	<p>
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>
