import { Copy, Mail, Phone, Clock, User } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [copiedAirtel, setCopiedAirtel] = useState(false);
  const [copiedZamtel, setCopiedZamtel] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = (text: string, type: 'airtel' | 'zamtel' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'airtel') {
      setCopiedAirtel(true);
      setTimeout(() => setCopiedAirtel(false), 2000);
    } else if (type === 'zamtel') {
      setCopiedZamtel(true);
      setTimeout(() => setCopiedZamtel(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
            Support This Initiative
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This website is currently under development. Your donation helps us present verified 2026 election result disputes to the public and sustain the platform.
          </p>
          <p className="text-lg font-semibold text-foreground mt-2">
            Every contribution matters.
          </p>
        </div>

        {/* Donation Section */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            Donate via Mobile Money
          </h2>

          <div className="space-y-6">
            {/* Airtel Money */}
            <div className="bg-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Airtel Money</h3>
                <button
                  onClick={() => copyToClipboard('+260 571 224 047', 'airtel')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copiedAirtel ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">+260 571 224 047</p>
            </div>

            {/* Zamtel Money */}
            <div className="bg-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Zamtel Money</h3>
                <button
                  onClick={() => copyToClipboard('+260 955 548 500', 'zamtel')}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-foreground text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copiedZamtel ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">+260 955 548 500</p>
            </div>
          </div>
        </div>

        {/* Contact Person Section */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Contact Person
          </h2>

          <div className="space-y-6">
            {/* Name */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">VK</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-xl font-semibold text-foreground">Vincent Kafula</p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-muted rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="text-sm text-muted-foreground">Email address</h3>
                </div>
                <button
                  onClick={() => copyToClipboard('vincent.kafula@gmail.com', 'email')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copiedEmail ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <a
                href="mailto:vincent.kafula@gmail.com"
                className="text-lg font-mono text-foreground hover:text-primary transition-colors"
              >
                vincent.kafula@gmail.com
              </a>
            </div>

            {/* Response Time */}
            <div className="flex items-center gap-3 bg-accent/30 rounded-xl p-4 border border-accent">
              <Clock className="w-5 h-5 text-accent-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">Response time</p>
                <p className="text-sm text-muted-foreground">Within 24–48 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-muted border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            This website is currently in development. For partnerships, media enquiries, or general questions about the 2026 election dispute coverage, please reach out via email above.
          </p>
        </div>
      </div>
    </div>
  );
}
