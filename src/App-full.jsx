import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load all pages
const HomePage = lazy(() => import("./pages/HomePage"));
const LMS = lazy(() => import("./pages/LMS"));
const LMSLanding = lazy(() => import("./pages/LMSLanding"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Core Pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Connect"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Programs = lazy(() => import("./pages/Programs"));
const Partners = lazy(() => import("./pages/Partners"));
const Donate = lazy(() => import("./pages/Donate"));
const Pay = lazy(() => import("./pages/Pay"));
const Hub = lazy(() => import("./pages/Hub"));

// Student Portal
const Student = lazy(() => import("./pages/Student"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentHub = lazy(() => import("./pages/StudentHub"));
const StudentHandbook = lazy(() => import("./pages/StudentHandbook"));

// Learning Pages
const CourseCatalog = lazy(() => import("./pages/CourseCatalog"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseLibrary = lazy(() => import("./pages/CourseLibrary"));
const CourseBuilder = lazy(() => import("./pages/CourseBuilder"));
const Assignment = lazy(() => import("./pages/Assignment"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Certificates = lazy(() => import("./pages/Certificates"));

// Admin & Instructor
const AdminConsole = lazy(() => import("./pages/AdminConsole"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Instructor = lazy(() => import("./pages/Instructor"));
const InstructorNew = lazy(() => import("./pages/InstructorNew"));
const InstructorEdit = lazy(() => import("./pages/InstructorEdit"));
const EducatorHub = lazy(() => import("./pages/EducatorHub"));
const UserManagement = lazy(() => import("./pages/UserManagement"));

// AI Tools
const AITutor = lazy(() => import("./pages/AITutor"));
const NotebookLM = lazy(() => import("./pages/NotebookLM"));
const ElevateBrain = lazy(() => import("./pages/ElevateBrain"));

// Productivity
const Email = lazy(() => import("./pages/Email"));
const Calendar = lazy(() => import("./pages/Calendar"));
const VideoMeeting = lazy(() => import("./pages/VideoMeeting"));
const Docs = lazy(() => import("./pages/Docs"));

// Government & Compliance
const Government = lazy(() => import("./pages/Government"));
const Compliance = lazy(() => import("./pages/Compliance"));
const FundingImpact = lazy(() => import("./pages/FundingImpact"));

// Community
const Community = lazy(() => import("./pages/Community"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const Support = lazy(() => import("./pages/Support"));

// Business
const BusinessHub = lazy(() => import("./pages/BusinessHub"));
const Philanthropy = lazy(() => import("./pages/Philanthropy"));
const Ecommerce = lazy(() => import("./pages/Ecommerce"));

// Sister Sites
const KingdomKonnect = lazy(() => import("./pages/KingdomKonnect"));
const UrbanBuildCrew = lazy(() => import("./pages/UrbanBuildCrew"));
const SereneComfortCare = lazy(() => import("./pages/SereneComfortCare"));

// Sister Site Community Pages
const Mentorship = lazy(() => import("./pages/sisters/Mentorship"));
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const MentorSignup = lazy(() => import("./pages/sisters/MentorSignup"));
const PeerSupport = lazy(() => import("./pages/sisters/PeerSupport"));
const Volunteer = lazy(() => import("./pages/sisters/Volunteer"));
const VolunteerOpportunities = lazy(() => import("./pages/sisters/VolunteerOpportunities"));
const VolunteerStories = lazy(() => import("./pages/sisters/VolunteerStories"));
const Wellness = lazy(() => import("./pages/sisters/Wellness"));
const WellnessResources = lazy(() => import("./pages/sisters/WellnessResources"));

// Auth
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// Legal
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// Other
const Account = lazy(() => import("./pages/Account"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Branding = lazy(() => import("./pages/Branding"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Ecosystem = lazy(() => import("./pages/Ecosystem"));
const MobileApp = lazy(() => import("./pages/MobileApp"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const CurriculumUpload = lazy(() => import("./pages/CurriculumUpload"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading...
        </div>
      }>
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />
          
          {/* LMS */}
          <Route path="/lms" element={<LMSLanding />} />
          <Route path="/lms/dashboard" element={<LMS />} />
          <Route path="/lms/courses" element={<CourseCatalog />} />
          <Route path="/lms/progress" element={<LMS />} />
          
          {/* Core Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/hub" element={<Hub />} />
          
          {/* Student Portal */}
          <Route path="/students" element={<Student />} />
          <Route path="/student" element={<Student />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/handbook" element={<StudentHandbook />} />
          <Route path="/student-hub" element={<StudentHub />} />
          
          {/* Learning */}
          <Route path="/course-catalog" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course-library" element={<CourseLibrary />} />
          <Route path="/course-builder" element={<CourseBuilder />} />
          <Route path="/assignment/:id" element={<Assignment />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/curriculum-upload" element={<CurriculumUpload />} />
          
          {/* Admin & Instructor */}
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/instructor/new" element={<InstructorNew />} />
          <Route path="/instructor/edit/:id" element={<InstructorEdit />} />
          <Route path="/educator-hub" element={<EducatorHub />} />
          <Route path="/user-management" element={<UserManagement />} />
          
          {/* AI Tools */}
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/notebook-lm" element={<NotebookLM />} />
          <Route path="/elevate-brain" element={<ElevateBrain />} />
          
          {/* Productivity */}
          <Route path="/email" element={<Email />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/video-meeting" element={<VideoMeeting />} />
          <Route path="/docs" element={<Docs />} />
          
          {/* Government & Compliance */}
          <Route path="/government" element={<Government />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/funding-impact" element={<FundingImpact />} />
          
          {/* Community */}
          <Route path="/community" element={<Community />} />
          <Route path="/community-hub" element={<CommunityHub />} />
          <Route path="/support" element={<Support />} />
          
          {/* Business */}
          <Route path="/business-hub" element={<BusinessHub />} />
          <Route path="/philanthropy" element={<Philanthropy />} />
          <Route path="/ecommerce" element={<Ecommerce />} />
          
          {/* Sister Sites */}
          <Route path="/kingdom-konnect" element={<KingdomKonnect />} />
          <Route path="/urban-build-crew" element={<UrbanBuildCrew />} />
          <Route path="/serene-comfort-care" element={<SereneComfortCare />} />
          
          {/* Sister Site Community */}
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/mentor-directory" element={<MentorDirectory />} />
          <Route path="/mentor-signup" element={<MentorSignup />} />
          <Route path="/peer-support" element={<PeerSupport />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-opportunities" element={<VolunteerOpportunities />} />
          <Route path="/volunteer-stories" element={<VolunteerStories />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/wellness-resources" element={<WellnessResources />} />
          
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Legal */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/policies/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/policies/terms" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/policies/refund" element={<RefundPolicy />} />
          <Route path="/policies/compliance" element={<Compliance />} />
          
          {/* Account */}
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
          
          {/* Other */}
          <Route path="/branding" element={<Branding />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/mobile-app" element={<MobileApp />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
