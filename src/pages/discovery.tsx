import type { GetServerSideProps } from "next";

/** Legacy URL: discovery is now the landing page at `/`. */
export default function DiscoveryRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/", permanent: true },
});
