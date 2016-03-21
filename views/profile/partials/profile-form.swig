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
		<input type="submit" class="btn btn-default" value="{{ action }}" />
	</p>
</form>