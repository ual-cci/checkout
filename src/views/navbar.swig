<nav class="navbar navbar-inverse navbar-fixed-top">
	<div class="container-fluid">
		<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
			<ul class="nav navbar-nav">
				{% if loggedInUser %}
					<li{% if currentModule == 'checkout' %} class="active"{% endif %}><a href="/">Checkout</a></li>

					<li class="dropdown{% if currentModule == 'items' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Items <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li class="dropdown-header">View</li>
							<li><a href="/items">Items</a></li>
							<li><a href="/groups">Groups</a></li>
							<li><a href="/departments">Departments</a></li>
							<li role="separator" class="divider"></li>
							<li class="dropdown-header">New</li>
							<li><a href="/items/create">Item</a></li>
							<li><a href="/items/generate">Generate Items</a></li>
							<li><a href="/groups/create">Group</a></li>
							<li><a href="/departments/create">Department</a></li>
						</ul>
					</li>

					<li class="dropdown{% if currentModule == 'users' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Users <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li class="dropdown-header">View</li>
							<li><a href="/users">Users</a></li>
							<li><a href="/courses">Courses</a></li>
							<li role="separator" class="divider"></li>
							<li class="dropdown-header">New</li>
							<li><a href="/users/create">User</a></li>
							<li><a href="/courses/create">Course</a></li>
						</ul>
					</li>

					<li class="dropdown{% if currentModule == 'audit' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Audit <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li><a href="/items/audit">Scan</a></li>
							<li role="separator" class="divider"></li>
							<li class="dropdown-header">Reports</li>
							<li><a href="/reports/scanned">Scanned</a></li>
							<li><a href="/reports/missing">Missing</a></li>
						</ul>
					</li>

					<li class="dropdown{% if currentModule == 'reports' %} active{% endif %}">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Reports <span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li><a href="/reports/course">On Loan By Course</a></li>
							<li role="separator" class="divider"></li>
							<li class="dropdown-header">Status</li>
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
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{ loggedInUser.name }} <span class="caret"></span></a>
						<ul class="dropdown-menu">
							</li><li><a href="/users/{{ loggedInUser._id | raw }}">Edit Profile</a></li>
							<li role="separator" class="divider"></li>
							</li><li><a href="/checkout/compact">Compact Checkout</a></li>
							<li role="separator" class="divider"></li>
							</li><li><a href="/printers">Printers</a></li>
							<li role="separator" class="divider"></li>
							<li><a href="/logout">Logout</a></li>
						</ul>
				{% endif %}
			</ul>
		</div>
	</div>
</nav>
