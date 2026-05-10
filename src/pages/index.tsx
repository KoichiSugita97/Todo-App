import Head from "next/head";
import ChatUI from "@/components/ChatUI";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>ToDoDOlist Chat</title>
        <meta name="description" content="Collaborative chat playground backed by Prisma." />
      </Head>
      <main>
        <ChatUI />
      </main>
    </>
  );
};

export default HomePage;
