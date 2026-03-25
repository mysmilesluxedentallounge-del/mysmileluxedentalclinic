import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import DoctorProfile from "@/components/DoctorProfile";
import Accolades from "@/components/Accolades";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import PhotoGallery from "@/components/PhotoGallery";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <DoctorProfile />
        <Accolades />
        <Testimonials />
        <PhotoGallery />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
