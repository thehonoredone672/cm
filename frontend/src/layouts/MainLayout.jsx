import Navbar from "../components/layout/Navbar/Navbar";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="layout-container">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}