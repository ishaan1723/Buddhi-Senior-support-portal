export default function SosPage() {
  return (
    <div className="page-shell">
      <h1 className="text-3xl font-bold">Emergency SOS</h1>
      <div className="panel mt-5">
        <p className="text-lg text-gray-800">
          Use the red SOS button on this screen. Buddhi alerts your family contact, a local responder, and support executive.
        </p>
        <a className="touch-button mt-5 block bg-danger text-center text-white" href="tel:112">
          Call 112 Now
        </a>
      </div>
    </div>
  );
}
