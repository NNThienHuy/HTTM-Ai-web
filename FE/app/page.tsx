import { CategoryMenu, Hero, Incentives, IntroducingSection, Newsletter, ProductsSection,RecommendedSection } from "@/components";

export default function Home() {
  return (
    <>
    <Hero />
      <IntroducingSection />
      <CategoryMenu />
      
      {/* Thay thế ProductsSection cũ bằng RecommendedSection */}
      <RecommendedSection />
      
      {/* Các component khác nếu cần dùng (dựa trên import của bạn) */}
      {/* <Incentives /> */}
      {/* <Newsletter /> */}
    </>
  );
}
