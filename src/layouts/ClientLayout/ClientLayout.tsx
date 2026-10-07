import { Outlet } from "react-router-dom";
import { Header } from "./header";

export default function ClientLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
