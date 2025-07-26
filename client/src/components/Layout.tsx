import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Navigation/Header";
import { NotificationCenter } from "./Dashboard/NotificationCenter";
import Sidebar from "./Navigation/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to YUTHUB
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Housing management platform for UK councils
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              onClick={() => (window.location.href = "/auth/google")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => (window.location.href = "/auth/microsoft")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Microsoft
            </button>
            <button
              onClick={() => (window.location.href = "/auth/replit")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Replit
            </button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Call our support line:
              <br />
              <span className="font-medium text-blue-600">+44 161 123 4568</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <NotificationCenter />
    </div>
  );
}