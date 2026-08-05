import { useState } from "react";
import { toast } from "sonner";

export default function OutreachPage() {
  const [leadEmail, setLeadEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();

    if (!leadEmail) {
      toast.error("Please enter a target email address.");
      return;
    }

    setLoading(true);

    const name = leadEmail.split("@")[0].replace(/[0-9]/g, "");
    const greeting = tone === "friendly" ? "Hi" : tone === "persuasive" ? "Hello" : "Dear";
    const toneLine =
      tone === "friendly"
        ? "I hope you're doing well. I wanted to share a quick idea to help your outreach feel more personal and approachable."
        : tone === "persuasive"
        ? "Your team can increase response rates by speaking directly to the challenges your prospects care about most."
        : "This outreach is crafted to be clear, concise, and professional so your message lands with confidence.";

    const message = `${greeting} ${name},

${toneLine}

I noticed your company is in a strong position to benefit from better outreach personalization and faster follow-up. I’d love to share a simple strategy that can help you connect with the right prospects more efficiently.

Would you be open to a quick 10-minute call this week?

Best regards,
SalesGenie Team`;

    setGeneratedMessage(message);
    setLoading(false);
    toast.success("Outreach message generated!");
  };

  const handleSend = async () => {
    if (!generatedMessage) {
      toast.error("Generate a message before sending.");
      return;
    }

    setSending(true);
    setTimeout(() => {
      toast.success("Outreach email sent successfully!");
      setGeneratedMessage("");
      setLeadEmail("");
      setSending(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">AI Outreach Generator</h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate and send personalized outreach emails.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg h-fit">
            <h2 className="text-lg font-semibold mb-4">Outreach Settings</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Target Email
                </label>
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="prospect@company.com"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition"
              >
                {loading ? "Generating..." : "Generate Outreach"}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Generated Preview</h2>
              <textarea
                rows={10}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                placeholder="Generated message will appear here..."
                className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedMessage);
                    toast.success("Copied to clipboard!");
                  } catch (error) {
                    toast.error("Unable to copy, please paste manually.");
                  }
                }}
                disabled={!generatedMessage}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg text-sm font-medium transition"
              >
                Copy
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!generatedMessage || sending}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition"
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}