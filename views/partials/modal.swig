<div id="modal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				{% block header %}
					<h4 class="modal-title">{% block title %}{% endblock %}</h4>
				{% endblock %}
			</div>
			<div class="modal-body">
				{% block body %}{% endblock %}
			</div>
		</div>
	</div>
</div>