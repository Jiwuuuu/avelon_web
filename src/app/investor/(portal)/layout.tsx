import { InvestorPortalLayout } from "@/components/investor/InvestorPortalLayout";

export default function InvestorPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InvestorPortalLayout>{children}</InvestorPortalLayout>;
}
