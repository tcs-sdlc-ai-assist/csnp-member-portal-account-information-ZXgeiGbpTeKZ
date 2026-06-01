import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 * Displays a friendly message with a link back to the dashboard/account page.
 * Accessible heading and navigation.
 *
 * @returns {JSX.Element}
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <svg
          className="mx-auto h-16 w-16 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>

        <h1 className="mt-6 text-4xl font-bold text-primary-800">404</h1>
        <h2 className="mt-2 text-xl font-bold text-neutral-700">Page Not Found</h2>
        <p className="mt-4 text-sm text-neutral-600">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-8">
          <Link
            to="/account"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}