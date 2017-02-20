<nav class="navbar navbar-inverse navbar-fixed-top">
	<div class="container-fluid">
		<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
			<ul class="nav navbar-nav">
				{% if loggedInUser %}
					<li{% if currentModule == 'checkout' %} class="active"{% endif %}><a href="/"><span class="glyphicon glyphicon-home"></span></a></li>
					<li{% if currentModule == 'items' %} class="active"{% endif %}><a href="/items">Items</a></li>
					<li{% if currentModule == 'users' %} class="active"{% endif %}><a href="/users">Users</a></li>

					<li class="dropdown{% if currentModule == 'items' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">More <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li class="dropdown-header"><span class="glyphicon glyphicon-eye-open"></span> View</li>
							<li><a href="/courses">Courses</a></li>
							<li><a href="/groups">Groups</a></li>
							<li><a href="/departments">Departments</a></li>
							<li role="separator" class="divider"></li>
							<li class="dropdown-header"><span class="glyphicon glyphicon-plus"></span> New</li>
							<li><a href="/items/create">Item</a></li>
							<li><a href="/items/generate">Generate Items</a></li>
							<li><a href="/groups/create">Group</a></li>
							<li><a href="/departments/create">Department</a></li>
							<li><a href="/users/create">User</a></li>
							<li><a href="/courses/create">Course</a></li>
						</ul>
					</li>

					<li class="dropdown{% if currentModule == 'reports' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Reports <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li class="dropdown-header"><span class="glyphicon glyphicon-filter"></span> Status</li>
							<li><a href="/reports/status/available">Available</a></li>
							<li><a href="/reports/status/on-loan">On Loan</a></li>
							<li><a href="/reports/status/new">New</a></li>
							<li><a href="/reports/status/reserved">Reserved</a></li>
							<li><a href="/reports/status/lost">Lost</a></li>
							<li><a href="/reports/status/broken">Broken</a></li>
						</ul>
					</li>
				{% endif %}
			</ul>
			<ul class="nav navbar-nav navbar-right">
				{% if loggedInUser %}
					<li class="dropdown{% if currentModule == 'admin' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Admin <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li class="dropdown-header"><span class="glyphicon glyphicon-barcode"></span> Audit</li>
							<li><a href="/audit">Scan</a></li>
							<li><a href="/audit/scanned">Scanned</a></li>
							<li><a href="/audit/missing">Missing</a></li>
							<li role="separator" class="divider"></li>
							<li><a href="/printers"><span class="glyphicon glyphicon-print"></span> Configure Printers</a></li>
						</ul>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{ loggedInUser.name }} <span class="caret"></span></a>
						<ul class="dropdown-menu">
							</li><li><a href="/users/{{ loggedInUser._id | raw }}/edit"><span class="glyphicon glyphicon-pencil"></span> Edit Profile</a></li>
							<li role="separator" class="divider"></li>
							</li><li><a href="/checkout/compact"><span class="glyphicon glyphicon-resize-small"></span> Compact Checkout</a></li>
							<li role="separator" class="divider"></li>
							<li><a href="/logout"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
						</ul>
				{% endif %}
			</ul>
		</div>
	</div>
</nav>
