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
			<script src="/js/clipboard.min.js"></script>
			<script src="/js/script.js"></script>
		{% endblock %}
	</head>
	<body{% if dev %} class="dev"{% endif %}>
		{% include 'navbar.swig' %}
		{% block page %}{% endblock %}
	</body>
</html>
