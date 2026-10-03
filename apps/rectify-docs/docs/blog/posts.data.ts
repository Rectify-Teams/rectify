import { createContentLoader } from "vitepress";

export interface Post {
  title: string;
  url: string;
  date: string;
  description: string;
}

declare const data: Post[];
export { data };

export default createContentLoader("blog/*.md", {
  excerpt: false,
  transform(raw): Post[] {
    return raw
      .filter((p) => p.url !== "/blog/")
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title,
        description: frontmatter.description ?? "",
        date: new Date(frontmatter.date).toISOString().slice(0, 10),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
});
