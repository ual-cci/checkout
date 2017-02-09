Hello {{ name }},

Your students currently have the following item(s) on loan which are due back, we'd appreciate any help you can offer in chasing the return of these items:
{% for student in students %}
{{ student.user.name }}{% for item in student.items %}
	- {{ item.name }} ({{ item.barcode }}){% endfor %}
{% endfor %}
