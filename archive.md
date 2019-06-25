---
title: Blog archive
subtitle: >
  Random rambunctious ramblings.
layout: page
permalink: /archive
clr: Bu
---

{% for post in site.posts limit:5 %}
  <h2><a href="{{ post.url }}"><span class="faded">{{ post.date | date: '%d %b %Y' }} &mdash;</span> {{ post.title }}</a></h2>
{% endfor %}
{% if site.posts.size == 0 %}
  <em>No posts available.</em>
{% endif %}
