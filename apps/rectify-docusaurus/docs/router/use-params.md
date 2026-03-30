---
id: use-params
title: useParams
sidebar_position: 10
slug: /router/use-params
---

# `useParams`

```ts
function useParams<T extends Record<string, string>>(): T
```

Returns an object of URL parameters extracted by the currently matched route.

## Usage

```tsx
// Route definition:
<Route path="/users/:userId/posts/:postId" element={<Post />} />

// Inside Post:
import { useParams } from "@rectify-dev/router";

function Post() {
  const { userId, postId } = useParams<{
    userId: string;
    postId: string;
  }>();

  return <p>User {userId}, Post {postId}</p>;
}
```

## Notes

- Param values are always `string`.
- Returns an empty object `{}` if the current route has no params.
- The generic `T` is for TypeScript convenience — it isn't validated at runtime.
