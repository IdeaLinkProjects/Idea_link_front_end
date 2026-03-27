import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const featuredProjects = [
    {
      name: "Solar Irrigation for Oromia Farms",
      categoryIcon: "🌱",
      fundedPercent: 72,
      daysRemaining: 14,
    },
    {
      name: "Local Textile Export Marketplace",
      categoryIcon: "🧵",
      fundedPercent: 54,
      daysRemaining: 21,
    },
    {
      name: "Smart Learning App in Amharic",
      categoryIcon: "📱",
      fundedPercent: 88,
      daysRemaining: 7,
    },
  ];

  const statistics = [
    { label: "Projects Created", value: "50+" },
    { label: "ETB Pledged", value: "2.5M+" },
    { label: "Registered Users", value: "200+" },
  ];

  return (
    <>
      <Head>
        <title>IdealLink | Ethiopian Crowdfunding Platform</title>
        <meta
          name="description"
          content="Connecting Ethiopian innovators with investors through a modern crowdfunding platform."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-zinc-900">
        <header className="border-b border-zinc-200">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              <span style={{ color: "#10B981" }}>Ideal</span>
              <span style={{ color: "#3B82F6" }}>Link</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 sm:px-4"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-4"
                style={{ backgroundColor: "#10B981" }}
              >
                Register
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Connecting Ethiopian Innovators with Investors
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg">
              Discover impactful ideas, fund local innovation, and grow Ethiopia&apos;s
              future together.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register?role=innovator"
                className="rounded-lg px-6 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#10B981" }}
              >
                Register as Innovator
              </Link>
              <Link
                href="/register?role=investor"
                className="rounded-lg px-6 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Register as Investor
              </Link>
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {statistics.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center"
                >
                  <p className="text-3xl font-extrabold tracking-tight text-zinc-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-600">{stat.label}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Featured Projects
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <article
                  key={project.name}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">{project.name}</h3>
                    <span className="text-xl" aria-hidden="true">
                      {project.categoryIcon}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.fundedPercent}%`,
                          backgroundColor: "#10B981",
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-zinc-800">
                        {project.fundedPercent}% funded
                      </span>
                      <span className="text-zinc-600">{project.daysRemaining} days left</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-200">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 text-sm text-zinc-600 sm:px-6 lg:px-8">
            <Link href="/about" className="hover:text-zinc-900">
              About
            </Link>
            <Link href="/contact" className="hover:text-zinc-900">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
