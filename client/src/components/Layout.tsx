import { ReactNode } from "react";
import Sidebar from "./Layout/Sidebar";
import Header from "./Layout/Header";
import UniversalFooter from "./Layout/UniversalFooter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
        <UniversalFooter />
      </div>
    </div>
  );
}