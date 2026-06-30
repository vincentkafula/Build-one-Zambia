import { lazy, Suspense, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MainNavigation } from './components/MainNavigation';
import { MainFooter } from './components/MainFooter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DevDisclaimer } from './components/DevDisclaimer';
import { PageLoader } from './components/PageLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { bootstrapProduction } from './lib/production';
import MainHomePage from './pages/main/MainHomePage';

// Bootstrap SEO, error handlers, CSP, service worker once at module load
bootstrapProduction();

// ── Main campaign site pages ─────────────────────────────────────────────────
const AboutPage         = lazy(() => import('./pages/main/AboutPage').then(m => ({ default: m.AboutPage })));
const CampaignPage      = lazy(() => import('./pages/main/CampaignPage').then(m => ({ default: m.CampaignPage })));
const PagesPage         = lazy(() => import('./pages/main/PagesPage').then(m => ({ default: m.PagesPage })));
const ContactDonatePage    = lazy(() => import('./pages/main/ContactDonatePage').then(m => ({ default: m.ContactDonatePage })));
const ShopPage             = lazy(() => import('./pages/main/ShopPage').then(m => ({ default: m.ShopPage })));
const MaleCandidatesPage   = lazy(() => import('./pages/main/MaleCandidatesPage').then(m => ({ default: m.MaleCandidatesPage })));
const FemaleCandidatesPage = lazy(() => import('./pages/main/FemaleCandidatesPage').then(m => ({ default: m.FemaleCandidatesPage })));
const OpportunitiesPage    = lazy(() => import('./pages/main/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const ChambersPage         = lazy(() => import('./pages/main/ChambersPage').then(m => ({ default: m.ChambersPage })));
const DonatePage           = lazy(() => import('./pages/main/DonatePage').then(m => ({ default: m.DonatePage })));
const LiveStreamingPage    = lazy(() => import('./pages/main/LiveStreamingPage').then(m => ({ default: m.LiveStreamingPage })));
const DocumentsPage        = lazy(() => import('./pages/main/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const NewsPage             = lazy(() => import('./pages/main/NewsPage').then(m => ({ default: m.NewsPage })));
const PartyMusicPage       = lazy(() => import('./pages/main/PartyMusicPage').then(m => ({ default: m.PartyMusicPage })));
const EventsGalleryPage    = lazy(() => import('./pages/main/EventsGalleryPage').then(m => ({ default: m.EventsGalleryPage })));
const AboutEventsPage      = lazy(() => import('./pages/main/AboutEventsPage').then(m => ({ default: m.AboutEventsPage })));
const TermsOfServicePage   = lazy(() => import('./pages/main/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const PressStatementsPage  = lazy(() => import('./pages/main/PressStatementsPage').then(m => ({ default: m.PressStatementsPage })));

// ── Registration pages ───────────────────────────────────────────────────────
const MemberRegistration         = lazy(() => import('./pages/registration/MemberRegistration'));
const CooperativeRegistration    = lazy(() => import('./pages/registration/CooperativeRegistration'));
const InternshipRegistration     = lazy(() => import('./pages/registration/InternshipRegistration'));
const PollingAgentRegistration   = lazy(() => import('./pages/registration/PollingAgentRegistration'));

// ── Dashboard pages ──────────────────────────────────────────────────────────
const DashboardLogin       = lazy(() => import('./pages/DashboardLogin'));
const MemberDashboard      = lazy(() => import('./pages/dashboards/MemberDashboard'));
const CooperativeDashboard = lazy(() => import('./pages/dashboards/CooperativeDashboard'));
const ChamberDashboard     = lazy(() => import('./pages/dashboards/ChamberDashboard'));
const InternshipDashboard  = lazy(() => import('./pages/dashboards/InternshipDashboard'));
const ElectionAgentDashboard = lazy(() => import('./pages/dashboards/ElectionAgentDashboard'));
const ManagerDashboard     = lazy(() => import('./pages/dashboards/ManagerDashboard'));
const ElectionDashboard    = lazy(() => import('./pages/dashboards/ElectionDashboard'));

// ── Election results portal pages ────────────────────────────────────────────
const HomePage         = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const PresidentialPage = lazy(() => import('./pages/PresidentialPage').then(m => ({ default: m.PresidentialPage })));
const ParliamentPage   = lazy(() => import('./pages/ParliamentPage').then(m => ({ default: m.ParliamentPage })));
const MayoralPage      = lazy(() => import('./pages/MayoralPage').then(m => ({ default: m.MayoralPage })));
const CouncillorPage   = lazy(() => import('./pages/CouncillorPage').then(m => ({ default: m.CouncillorPage })));
const DataEntryPage    = lazy(() => import('./pages/DataEntryPage').then(m => ({ default: m.DataEntryPage })));
const ECZEntryPage     = lazy(() => import('./pages/ECZEntryPage').then(m => ({ default: m.ECZEntryPage })));
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
              <Route path="/news/live"          element={<LiveStreamingPage />} />
              <Route path="/news/documents"         element={<DocumentsPage />} />
              <Route path="/news/latest"            element={<NewsPage />} />
              <Route path="/news/music"             element={<PartyMusicPage />} />
              <Route path="/news/gallery"           element={<EventsGalleryPage />} />
              <Route path="/news/press-statements"  element={<PressStatementsPage />} />
              <Route path="/shop"               element={<ShopPage />} />
              <Route path="/home/male"           element={<MaleCandidatesPage />} />
              <Route path="/home/female"         element={<FemaleCandidatesPage />} />
              <Route path="/home/opportunities"  element={<OpportunitiesPage />} />
              {/* /home/chambers removed — chambers are private to dashboards only */}
              <Route path="/register/member"        element={<MemberRegistration />} />
              <Route path="/register/cooperative"  element={<CooperativeRegistration />} />
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
        <Route path="/dashboard/member" element={<MemberDashboard />} />
        <Route path="/dashboard/cooperative" element={<CooperativeDashboard />} />
        <Route path="/dashboard/chamber" element={<ChamberDashboard />} />
        <Route path="/dashboard/internship" element={<InternshipDashboard />} />
        <Route path="/dashboard/agent"      element={<ElectionAgentDashboard />} />
        <Route path="/dashboard/manager"    element={<ManagerDashboard />} />
        <Route path="/dashboard/election"   element={<ElectionDashboard />} />

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