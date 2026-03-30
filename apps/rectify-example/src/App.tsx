import { lazy, Suspense, useState } from "@rectify-dev/core";

const LazyChild = lazy(() => import("./LazyChild"));

const App = () => {
  const [mount, setMount] = useState(false);

  return (
    <div>
      <button onClick={() => setMount(!mount)}>Toggle Lazy Child</button>
      {mount && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyChild />
        </Suspense>
      )}
    </div>
  );
};

export default App;
