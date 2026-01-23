import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full relative pt-[95px] md:pt-[75px]">
      <Header />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
