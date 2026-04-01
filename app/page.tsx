import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import DentalHealthPlans from "@/components/DentalHealthPlans";
import DoctorProfile from "@/components/DoctorProfile";
import Accolades from "@/components/Accolades";
import DirectorsInfo from "@/components/DirectorsInfo";
import Contact from "@/components/Contact";
import FAQ from "@/components/FAQ";
import PhotoGallery from "@/components/PhotoGallery";
import Reviews from "@/components/Reviews";
import Testimonials from "@/components/Testimonials";
import PreAndPostOp from "@/components/PreAndPostOp";
import Footer from "@/components/Footer";
import FreeConsultationPopup from "@/components/FreeConsultationPopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <DentalHealthPlans />
        <DoctorProfile />
        <Accolades />
        <DirectorsInfo />
        <PhotoGallery />
        <PreAndPostOp />
        <Testimonials />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FreeConsultationPopup />
    </>
  );
}
