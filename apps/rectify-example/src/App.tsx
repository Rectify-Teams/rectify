import {
  lazy,
  Suspense,
  useState,
  Component,
  memo,
  useEffect,
} from "@rectify-dev/core";

const LazyChild = lazy(() => import("./LazyChild"));

class Counter extends Component<{ mount: boolean }, { count: number }> {
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
    console.log("Counter render", { mount: this.props.mount });
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
      <Counter mount={mount} />
    </div>
  );
};

export default App;
