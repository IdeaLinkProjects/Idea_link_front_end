import Head from "next/head";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <section className="grid gap-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="w-fit rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">
          Production Starter
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900">
          Next.js Pages Router + TypeScript + Tailwind CSS
        </h1>
        <p className="max-w-2xl text-zinc-600">
          This project is configured with a clean folder structure and reusable
          building blocks so you can ship features quickly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="https://nextjs.org/docs/pages" className="min-w-40">
            Pages Router Docs
          </Button>
          <Button
            href="https://tailwindcss.com/docs/installation/framework-guides/nextjs"
            className="min-w-40 bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
          >
            Tailwind Docs
          </Button>
        </div>
      </section>
    </>
  );
}
