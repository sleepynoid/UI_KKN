import GuruScanPage, { clientLoader } from "~/guru/scan";

export default function GuruScan() {
  return <GuruScanPage />;
}

// Export the loader from this route file
export { clientLoader };