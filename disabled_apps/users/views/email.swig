Hello {{ name }},

You currently have the following item(s) on loan which are due back:
{% for item in items %}
 - {{ item.name }} ({{ item.barcode }}){% endfor %}
