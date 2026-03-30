import { memo, useLayoutEffect, useState } from "react";

const Tooltip = memo(() => {
  console.log("Tooltip");

  return (
    <div>
      <div>{`Tooltip count:`}</div>
    </div>
  );
});

const App = () => {
  const [mount, setMount] = useState(false);
  return (
    <div id="root" className="hello" onClick={() => setMount(!mount)}>
      {mount && <div>Mounted</div>}
      <Tooltip />
    </div>
  );
};

export default App;
