import Link from "next/link";
import { Button } from "@repo/ui";
import SectionWrapper from "./SectionWrapper";

export default function CTASection() {
  return (
    <SectionWrapper className="bg-gradient-to-br from-white/70 to-white/40">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-3">Sẵn sàng đặt món?</h3>
        <p className="text-gray-600 mb-6">Khám phá hàng ngàn nhà hàng và ưu đãi hấp dẫn.</p>
        <Link href="/booking">
          <Button variant="primary" size="lg" className="rounded-full px-8">Bắt đầu ngay</Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}