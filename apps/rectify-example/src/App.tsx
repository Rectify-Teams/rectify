import { lazy, Suspense, useState, Component } from "@rectify-dev/core";

const LazyChild = lazy(() => import("./LazyChild"));

class Counter extends Component<{}, { count: number }> {
  state = { count: 0 };

  componentDidMount() {
    console.log("mounted");
  }

  componentWillUnmount() {
    console.log("unmounted");
  }

  componentDidUpdate(prevProps: {}, prevState: { count: number }): void {
    console.log("updated", { prevProps, prevState });
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}{" "}
      </button>
    );
  }
}

const A = () => {
  console.log("A");

  return <div>A</div>;
};

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
      <A />
      <Counter />
    </div>
  );
};

export default App;
