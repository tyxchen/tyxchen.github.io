---
title: Portfolio
description: Projects I've worked on and stuff I've helped build.
subtitle: >
  Stuff I've built before.
layout: page
permalink: /portfolio
clr: Rd
---

# Showcase

{% include showcase.html
  id="mss-csec"
  title="Markville CSEC"
  summary="Markville Secondary School's Computer Science Education Club needed a better system than Google Drive to store and disseminate its lessons. A new website let us carry out our mission of teaching competitive programming to high school students."
  link="https://mss-csec.github.io"
  color="#ed0b0b"
  cover="home" %}

{% include showcase.html
  id="evdo"
  title="Everything Dojo"
  summary="When it came time to redesign and rebuild this website from scratch, I designed mockups, refined the UI, and helped write a custom CMS to replace phpBB."
  link="http://www.everythingdojo.com"
  cover="home" %}

{% include showcase.html
  id="chem"
  title="Chemistry visualizations"
  summary="Sometimes, chemistry can be a little hard to understand. The lack of good interactive visualizations of key chemistry concepts doesn't help either. That's where I decided to step in and help my peers."
  link="https://tyxchen.github.io/chem-visualizations"
  color="#3e7af9"
  cover="equilibrium" %}

<a href="#" class="showcase-show-more">Show more {% include icons/chevron-down.svg %}</a>
<div class="showcase-more">
  {% include showcase.html
    id="ics4ufp"
    title="Calculation Solitaire"
    summary="For my Grade 12 final project, I had an idea: why build just a solitaire game, when you can try implementing [Flux](https://facebook.github.io/flux/) using a limited subset of Java and work based on that?"
    color="#135513"
    cover="main" %}
  
  {% include showcase.html
    id="city"
    title="City.css"
    summary="A theme I developed for blogs on Art of Problem Solving. One of the most popular and well-liked themes in the history of the community."
    color="#bea19e"
    cover="city" %}
  
  <a href="#" class="showcase-show-less">Show less {% include icons/chevron-up.svg %}</a>
</div>

# Side projects

My side projects, in reverse chronological order.

{% include showcase-mini.html title="Racket lists" link="/racket-lists" summary="An interactive visualization of linked lists using box-and-pointer representation, and how it relates to the syntax of lists in Racket. Built with Inferno." %}

{% include showcase-mini.html title="Statboard" link="https://github.com/tyxchen/statboard" summary="A dashboard to track various softball-related statistics. Built with Foundation and Dexie.js." %}

{% include showcase-mini.html title="Turing Autoformatter" link="/turing-autoformat" summary="A website to format Turing code to meet my grade 11 CS teacher's style guidelines, similar to `go fmt`." %}
