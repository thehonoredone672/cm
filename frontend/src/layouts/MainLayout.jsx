import Navbar from "../components/layout/Navbar/Navbar";
import Sidebar from "../components/layout/Sidebar/Sidebar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "24px",
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}