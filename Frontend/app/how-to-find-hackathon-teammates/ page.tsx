export const metadata = {
  title: "How to Find Hackathon Teammates (Even If You Have None) | CollabVault",
  description:
    "Struggling to find teammates for hackathons? Learn the best ways to build a team and collaborate effectively using CollabVault.",
};

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">
        How to Find Teammates for Hackathons (Even If You Have None)
      </h1>

      <p className="mb-4">
        <strong>Struggling to find a team for hackathons?</strong> You're not alone.
      </p>

      <p className="mb-6">
        Most students don’t lack skills — they lack access to the right people.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Best Ways to Find Teammates</h2>

      <ol className="list-decimal ml-6 mb-6 space-y-2">
        <li>Ask in college groups (WhatsApp, clubs)</li>
        <li>Use Discord or Reddit communities</li>
        <li>Join hackathon networking sessions</li>
        <li>
          Use platforms like <strong>CollabVault</strong>
        </li>
      </ol>

      <h2 className="text-2xl font-semibold mb-3">Why Use CollabVault?</h2>

      <ul className="list-disc ml-6 mb-6 space-y-2">
        <li>Find teammates based on skills</li>
        <li>Connect with students across colleges</li>
        <li>Build teams faster</li>
      </ul>

      <p className="mb-6">
        👉{" "}
        <a
          href="https://collabvault.vercel.app/landing"
          className="text-blue-600 underline"
        >
          Try CollabVault here
        </a>
      </p>

      <h2 className="text-2xl font-semibold mb-3">Tips to Build a Strong Team</h2>

      <ul className="list-disc ml-6 mb-6 space-y-2">
        <li>Have a mix of developers, designers, and idea people</li>
        <li>Communication matters more than skills</li>
        <li>Don’t wait until the last minute</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Conclusion</h2>

      <p>
        You don’t need to know people — you just need the right platform.
      </p>
    </main>
  );
}
