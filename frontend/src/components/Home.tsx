export default function Home() {
  return (
    <div className=" flex justify-center items-center w-[900px] max-w-[99%] h-[100] grow">
      <div className="bg-black shadow-inner text-sm bg-opacity-10 rounded-lg p-2 text-white">
        <h1 className="text-center text-3xl c">
          Welcome to Miniu: Simplify Your Links
        </h1>
        <p className="text-xl">
          Say goodbye to long, messy URLs. With <strong>Miniu</strong>, you can
          create sleek, shareable links in seconds. Whether you're promoting
          your brand, sharing content, or just keeping things tidy, Miniu makes
          it easy.
        </p>
        <ul className="text-xl">
          <li className="text-xl">
            <strong>Fast and Reliable</strong>: Get your short link instantly,
            and count on it to work anytime.
          </li>
          <li className="text-xl">
            <strong>Track Your Success</strong>: Monitor clicks and performance
            with built-in analytics.
          </li>
          <li className="text-xl">
            <strong>Free and Secure</strong>: Shorten links at no cost with
            privacy at the core.
          </li>
        </ul>
        <p className="text-xl">
          Start shortening now and make your links as concise as your ideas!
        </p>
      </div>
    </div>
  );
}
