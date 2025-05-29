import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Simple footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300">
                © {new Date().getFullYear()} Pet-à-Vet. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
