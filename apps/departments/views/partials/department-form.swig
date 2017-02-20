<form method="post" class="form-horizontal">
	<div class="form-group">
		<label for="name" class="col-md-2 control-label">Name</label>
		<div class="col-md-4">
			<input id="name" name="name" type="text" value="{{ department.name }}" class="form-control" required />
		</div>
	</div>

	<div class="form-group">
		<div class="col-md-4 col-md-offset-2">
			<button type="submit" class="btn btn-default">{{ action }}</button>
		</div>
	</div>
</form>
