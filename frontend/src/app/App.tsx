import { lazy, Suspense, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MainNavigation } from './components/MainNavigation';
import { MainFooter } from './components/MainFooter';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DevDisclaimer } from './components/DevDisclaimer';
import { PageLoader } from './components/PageLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { bootstrapProduction } from './lib/production';
import { getToken } from './lib/api';
import MainHomePage from './pages/main/MainHomePage';
import VerifyMembershipPage from './pages/VerifyMembershipPage';

// Bootstrap SEO, error handlers, CSP, service worker once at module load
bootstrapProduction();

// ── Main campaign site pages ─────────────────────────────────────────────────
const AboutPage         = lazy(() => import('./pages/main/AboutPage'));
const CampaignPage      = lazy(() => import('./pages/main/CampaignPage'));
const PagesPage         = lazy(() => import('./pages/main/PagesPage'));
const ContactDonatePage    = lazy(() => import('./pages/main/ContactDonatePage'));
const ShopPage             = lazy(() => import('./pages/main/ShopPage'));
const MaleCandidatesPage   = lazy(() => import('./pages/main/MaleCandidatesPage'));
const FemaleCandidatesPage = lazy(() => import('./pages/main/FemaleCandidatesPage'));
const OpportunitiesPage    = lazy(() => import('./pages/main/OpportunitiesPage'));
const ChambersPage         = lazy(() => import('./pages/main/ChambersPage'));
const DonatePage           = lazy(() => import('./pages/main/DonatePage'));
const PaymentCompletePage  = lazy(() => import('./pages/main/PaymentCompletePage'));
const LiveStreamingPage    = lazy(() => import('./pages/main/LiveStreamingPage'));
const DocumentsPage        = lazy(() => import('./pages/main/DocumentsPage'));
const NewsPage             = lazy(() => import('./pages/main/NewsPage'));
const PartyMusicPage       = lazy(() => import('./pages/main/PartyMusicPage'));
const EventsGalleryPage    = lazy(() => import('./pages/main/EventsGalleryPage'));
const AboutEventsPage      = lazy(() => import('./pages/main/AboutEventsPage'));
const TermsOfServicePage   = lazy(() => import('./pages/main/TermsOfServicePage'));
const PressStatementsPage  = lazy(() => import('./pages/main/PressStatementsPage'));

// ── Registration pages ───────────────────────────────────────────────────────
const MemberRegistration         = lazy(() => import('./pages/registration/MemberRegistration'));
const CooperativeRegistration    = lazy(() => import('./pages/registration/CooperativeRegistration'));
const ChamberRegistration        = lazy(() => import('./pages/registration/ChamberRegistration'));
const IntlPartyRegistration      = lazy(() => import('./pages/registration/IntlPartyRegistration'));
const InternshipRegistration     = lazy(() => import('./pages/registration/InternshipRegistration'));
const PollingAgentRegistration   = lazy(() => import('./pages/registration/PollingAgentRegistration'));

// ── Dashboard pages ──────────────────────────────────────────────────────────
const DashboardLogin       = lazy(() => import('./pages/DashboardLogin'));
const MemberDashboard      = lazy(() => import('./pages/dashboards/MemberDashboard'));
const CooperativeDashboard = lazy(() => import('./pages/dashboards/CooperativeDashboard'));
const ChamberDashboard     = lazy(() => import('./pages/dashboards/ChamberDashboard'));
const IntlPartyDashboard   = lazy(() => import('./pages/dashboards/IntlPartyDashboard'));
const InternshipDashboard  = lazy(() => import('./pages/dashboards/InternshipDashboard'));
const ElectionAgentDashboard = lazy(() => import('./pages/dashboards/ElectionAgentDashboard'));
const ManagerDashboard     = lazy(() => import('./pages/dashboards/ManagerDashboard'));
const ElectionDashboard    = lazy(() => import('./pages/dashboards/ElectionDashboard'));
const BuyerDashboard       = lazy(() => import('./pages/dashboards/BuyerDashboard'));

// ── Election results portal pages ────────────────────────────────────────────
const HomePage         = lazy(() => import('./pages/HomePage'));
const PresidentialPage = lazy(() => import('./pages/PresidentialPage'));
const ParliamentPage   = lazy(() => import('./pages/ParliamentPage'));
const MayoralPage      = lazy(() => import('./pages/MayoralPage'));
const CouncillorPage   = lazy(() => import('./pages/CouncillorPage'));
const DataEntryPage    = lazy(() => import('./pages/DataEntryPage'));
const ECZEntryPage     = lazy(() => import('./pages/ECZEntryPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));

// ── Route guard ─────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader variant="dark" message="Verifying session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// A second, separate auth system: DashboardLogin (the /dashboard-login
// flow used by members, cooperatives, election agents/managers, and the
// super_admin/admin/manager content-management dashboard) stores its
// session directly via setToken()/sessionStorage rather than through
// AuthContext — so it needs its own guard, not the one above, which
// checks a completely different session store and would incorrectly
// reject every legitimately logged-in dashboard user.
//
// Previously none of these /dashboard/* routes had ANY route-level
// guard at all — navigating straight to a URL like /dashboard/manager
// (the super_admin/admin dashboard, with News, Shop, Music, Events,
// Security Centre, System Setup, etc.) rendered the full dashboard
// shell for anyone, logged in or not, regardless of role. Individual
// admin API calls inside it would fail without a valid token, but the
// UI itself — navigation, section list, layout — was fully visible.
function DashboardProtectedRoute({ allowedRoles, children }: { allowedRoles?: string[]; children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/dashboard-login" replace />;
  if (allowedRoles) {
    let role: string | undefined;
    try {
      const stored = sessionStorage.getItem('boz_election_user');
      role = stored ? JSON.parse(stored).role : undefined;
    } catch { /* malformed session — treat as no role, redirect below */ }
    if (!role || !allowedRoles.includes(role)) return <Navigate to="/dashboard-login" replace />;
  }
  return <>{children}</>;
}

// ── Main campaign site layout ─────────────────────────────────────────────────

const MainLayout = memo(function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#007A30' }}>
      <MainNavigation />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader variant="dark" />}>
            <Routes>
              <Route index                        element={<MainHomePage />} />
              <Route path="/"                    element={<MainHomePage />} />
              <Route path="/home"                element={<Navigate to="/" replace />} />
              <Route path="/about"               element={<AboutPage />} />
              <Route path="/about/events"       element={<AboutEventsPage />} />
              <Route path="/terms"              element={<TermsOfServicePage />} />
              <Route path="/campaign"            element={<CampaignPage />} />
              <Route path="/pages"               element={<PagesPage />} />
              <Route path="/contact"             element={<ContactDonatePage />} />
              <Route path="/donate"              element={<DonatePage />} />
              <Route path="/payment/complete"    element={<PaymentCompletePage />} />
              <Route path="/news/live"          element={<LiveStreamingPage />} />
              <Route path="/news/documents"         element={<DocumentsPage />} />
              <Route path="/news/latest"            element={<NewsPage />} />
              <Route path="/news/music"             element={<PartyMusicPage />} />
              <Route path="/news/gallery"           element={<EventsGalleryPage />} />
              <Route path="/news/press-statements"  element={<PressStatementsPage />} />
              <Route path="/shop"               element={<ShopPage />} />
              <Route path="/verify/:membershipNumber" element={<VerifyMembershipPage />} />
              <Route path="/home/male"           element={<MaleCandidatesPage />} />
              <Route path="/home/female"         element={<FemaleCandidatesPage />} />
              <Route path="/home/opportunities"  element={<OpportunitiesPage />} />
              {/* /home/chambers removed — chambers are private to dashboards only */}
              <Route path="/register/member"        element={<MemberRegistration />} />
              <Route path="/register/cooperative"  element={<CooperativeRegistration />} />
              <Route path="/register/chamber"      element={<ChamberRegistration />} />
              <Route path="/register/intl-party"   element={<IntlPartyRegistration />} />
              <Route path="/register/internship"   element={<InternshipRegistration />} />
              <Route path="/register/agent"        element={<PollingAgentRegistration />} />
              <Route path="*"         element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <MainFooter />
    </div>
  );
});

// ── Election results portal layout ───────────────────────────────────────────

const PortalLayout = memo(function PortalLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* MARKER-MAKE-KIT-INVOKED */}
      <Navigation />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index                element={<HomePage />} />
              <Route path="presidential"  element={<PresidentialPage />} />
              <Route path="parliament"    element={<ParliamentPage />} />
              <Route path="mayoral"       element={<MayoralPage />} />
              <Route path="councillor"    element={<CouncillorPage />} />
              <Route path="data-entry"    element={<Navigate to="/dashboard-login" replace />} />
              <Route path="ecz-entry"     element={<Navigate to="/dashboard-login" replace />} />
              <Route path="*"             element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <MainFooter />
    </div>
  );
});

// ── Root routes ─────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader variant="dark" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Login and Dashboards */}
        <Route path="/dashboard-login" element={<DashboardLogin />} />
        <Route path="/dashboard/member" element={<DashboardProtectedRoute allowedRoles={['member']}><MemberDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/cooperative" element={<DashboardProtectedRoute allowedRoles={['cooperative']}><CooperativeDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/chamber" element={<DashboardProtectedRoute allowedRoles={['chamber']}><ChamberDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/intl-party" element={<DashboardProtectedRoute allowedRoles={['intl_party']}><IntlPartyDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/internship" element={<DashboardProtectedRoute allowedRoles={['internship']}><InternshipDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/agent"      element={<DashboardProtectedRoute allowedRoles={['polling_agent', 'agent', 'election_agent', 'ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager', 'province_manager', 'national_manager']}><ElectionAgentDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/manager"    element={<DashboardProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><ManagerDashboard /></DashboardProtectedRoute>} />
        <Route path="/dashboard/election"   element={<DashboardProtectedRoute allowedRoles={['polling_agent', 'agent', 'election_agent', 'ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager', 'province_manager', 'national_manager']}><ElectionDashboard /></DashboardProtectedRoute>} />
        <Route path="/shop/account"         element={<BuyerDashboard />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <AdminPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Election results portal lives under /results */}
        <Route path="/results/*" element={<PortalLayout />} />

        {/* Legacy portal direct paths — redirect into /results/ */}
        <Route path="/presidential" element={<Navigate to="/results/presidential" replace />} />
        <Route path="/parliament"   element={<Navigate to="/results/parliament" replace />} />
        <Route path="/mayoral"      element={<Navigate to="/results/mayoral" replace />} />
        <Route path="/councillor"   element={<Navigate to="/results/councillor" replace />} />


        {/* Main campaign site */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Suspense>
  );
}

// ── App root ────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <DevDisclaimer />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4500,
                style: {
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#f9fafb',
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}