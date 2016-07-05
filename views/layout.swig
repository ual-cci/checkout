<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>{% block title %}Checkout{% endblock %}</title>
		{% block head %}
			<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
			<link rel="stylesheet" type="text/css" href="/css/style.css">
			<script src="/socket.io/socket.io.js"></script>
			<script src="/js/jquery.js"></script>
			<script src="/js/bootstrap.js"></script>
			<script src="/js/script.js"></script>
		{% endblock %}
	</head>
	<body{%if dev %} class="dev"{% endif %}>
		<nav class="navbar navbar-inverse navbar-fixed-top">
			<div class="container-fluid">
				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
					<ul class="nav navbar-nav">
						{% if loggedInUser %}
							<li{% if currentModule == 'checkout' %} class="active"{% endif %}><a href="/">Checkout</a></li>
						{% endif %}
						{% if loggedInUser.isStaff %}
							<li class="dropdown{% if currentModule == 'items' %} active{% endif %}">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Items <span class="caret"></span></a>
								<ul class="dropdown-menu">
									<li><a href="/items">All Items</a></li>
									<li role="separator" class="divider"></li>
									<li><a href="/items/create">New item</a></li>
									<li><a href="/items/generate">Generate items</a></li>
									<li role="separator" class="divider"></li>
									<li><a href="/items/audit">Audit</a></li>
								</ul>
							</li>
							<li class="dropdown{% if currentModule == 'reports' %} active{% endif %}">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Reports <span class="caret"></span></a>
								<ul class="dropdown-menu">
									<li class="dropdown-header">Course</li>
									<li><a href="/reports/course">All Courses</a></li>
									<li role="separator" class="divider"></li>
									<li class="dropdown-header">Audit</li>
									<li><a href="/reports/audited">Scanned</a></li>
									<li><a href="/reports/missing">Missing</a></li>
									<li role="separator" class="divider"></li>
									<li class="dropdown-header">Status</li>
									<li><a href="/reports/status/available">Available</a></li>
									<li><a href="/reports/status/on-loan">On Loan</a></li>
									<li><a href="/reports/status/new">New</a></li>
									<li><a href="/reports/status/reserved">Reserved</a></li>
									<li><a href="/reports/status/broken">Broken</a></li>
								</ul>
							</li>
							<li{% if currentModule == 'users' %} class="active"{% endif %}><a href="/users">Users</a></li>
						{% endif %}
						{% if loggedInUser.isAdmin %}
							<li{% if currentModule == 'courses' %} class="active"{% endif %}><a href="/courses">Courses</a></li>
							<li{% if currentModule == 'departments' %} class="active"{% endif %}><a href="/departments">Departments</a></li>
						{% endif %}
					</ul>
					<ul class="nav navbar-nav navbar-right">
						{% if loggedInUser %}
							<li{% if currentModule == 'profiles' %} class="active"{% endif %}><a href="/profile">{{ loggedInUser.name }}</a></li>
							<li><a href="/logout">Logout</a></li>
						{% endif %}
					</ul>
				</div>
			</div>
		</nav>
		{% block page %}{% endblock %}
	</body>
</html>
