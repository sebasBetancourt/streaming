import { Outlet } from "react-router-dom";
import { Header } from "./header/index";

export default function ClientLayout() {
  return (
    <>
      <Header />
      <main className="">
        <Outlet />
      </main>
    </>
  );
}
