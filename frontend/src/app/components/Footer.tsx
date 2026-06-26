import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#198754] to-[#DC2626] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">BZ</span>
              </div>
              <h3 className="font-bold text-foreground">Build One Zambia</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Independent election observation platform providing transparent, real-time results
              from the 2026 Zambian General Elections.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Build One Zambia</li>
              <li>Our Polling Agents</li>
              <li>Methodology</li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Transparency Principles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#198754] rounded-full"></div>
                Independent Verification
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#DC2626] rounded-full"></div>
                Real-time Reporting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                Full Data Transparency
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Auditable Trail
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Build One Zambia. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="/pages#transparency" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/pages#transparency" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Help Center</a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            This is an independent citizen observation platform. Official results are published by
            the Electoral Commission of Zambia (ECZ).
          </p>
        </div>
      </div>
    </footer>
  );
}
