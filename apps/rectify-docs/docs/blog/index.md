---
title: Rectify Blog
aside: false
---

<script setup>
import { data as posts } from "./posts.data";
</script>

# Rectify Blog

Release announcements and updates from the Rectify team.

<ul class="post-list">
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url" class="post-title">{{ post.title }}</a>
    <time :datetime="post.date">{{ post.date }}</time>
    <p>{{ post.description }}</p>
  </li>
</ul>

<style>
.post-list { list-style: none; padding: 0; }
.post-list li { margin: 1.5rem 0; padding: 0; }
.post-list .post-title { font-size: 1.15rem; font-weight: 600; }
.post-list time { margin-left: 0.75rem; font-size: 0.85rem; color: var(--vp-c-text-3); }
.post-list p { margin: 0.25rem 0 0; color: var(--vp-c-text-2); }
</style>
