<h3>Checkout</h3>

<form method="post" action="/items/{{ item._id | raw }}/issue" id="checkout">
	<p>
		<div class="input-group" style="max-width: 15em;">
			<input name="user" type="text" placeholder="User" required autocomplete="off" class="form-control user" />
			<span class="input-group-btn">
				<button class="btn btn-default" type="button"><span class="glyphicon glyphicon-random"></span></button>
			</span>
		</div>
		<input type="hidden" id="item" value="{{ item._id | raw }}" />
		<input type="hidden" name="modal" value="{{ modal }}" />
	</p>
</form>

<h3>Reserve</h3>

<form method="post" action="/items/{{ item._id | raw }}/reserve" id="reserve">
	<p>
		<div class="input-group" style="max-width: 15em;">
			<input name="user" type="text" placeholder="User" required autocomplete="off" class="form-control user" />
			<span class="input-group-btn">
				<button class="btn btn-default" type="button"><span class="glyphicon glyphicon-book"></span></button>
			</span>
		</div>
		<input type="hidden" name="modal" value="{{ modal }}" />
	</p>
</form>