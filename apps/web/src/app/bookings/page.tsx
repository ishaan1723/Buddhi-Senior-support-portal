export default function BookingsPage() {
  return (
    <div className="page-shell">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <div className="panel mt-5">
        <p className="text-lg text-gray-800">
          Booking requests are created from a vendor details page. Buddhi support will call you after the request is submitted.
        </p>
        <a className="touch-button mt-5 block bg-trust text-center text-white" href="/services">
          Find a Service
        </a>
      </div>
    </div>
  );
}
