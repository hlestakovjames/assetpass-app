import Image from "next/image";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3"><Image src="/brand/Assetpass%20Marketplace%20icon.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" /><p className="text-sm font-semibold uppercase tracking-widest text-teal-600">AssetPass Marketplace</p></div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Discover assets listed on AssetPass</h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600">
          The public marketplace workspace is established. Public listings, search, filters and asset details will be implemented in a later phase.
        </p>
      </div>
    </main>
  );
}
