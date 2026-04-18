import { BrowserRouter, Routes, Route } from "@rectify-dev/router";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { UserList } from "./pages/UserList";
import { UserDetail } from "./pages/UserDetail";
import { Benchmark } from "./pages/Benchmark";
import { NotFound } from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="benchmark" element={<Benchmark />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
