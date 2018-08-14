---
title: Blog
subtitle: >
  Random rambunctious ramblings.
layout: page
permalink: /archive
clr: Bu
---

{% for post in site.posts limit:5 %}
  <h2><a href="{{ post.url }}"><span class="faded">{{ post.date | date: '%e %b %Y' }} &mdash;</span> {{ post.title }}</a></h2>
{% endfor %}
