import { cookies } from "next/headers";
import AuthControls from "@/components/site-header-auth";
import UserNav from "@/components/site-header-usernav";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get("tw_session");

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
        <a href={hasSession ? "/feed" : "/"} className="flex items-center gap-2 font-semibold tracking-tight">
          {/* tiny logo placeholder */}
          <span className="inline-block h-6 w-6 rounded bg-neutral-900" />
          <span>TeamWisp</span>
        </a>

        {hasSession ? <UserNav /> : <AuthControls />}
      </div>
    </header>
  );
}
