import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FreeCourses from "@/components/FreeCourses";
// import PaidCourses from "@/components/PaidCourses";
import PaidCourseContent from "@/components/PaidCourseContent";
import TeacherSection from "@/components/TeacherSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FreeCourses />
      {/* <PaidCourses /> */}
      <PaidCourseContent />

      <TeacherSection />
      <Footer />
    </div>
  );
};

export default Index;