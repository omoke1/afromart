import LegalPage from "@/components/layout/LegalPage";

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      blurb="What cookies we use, why, and how you can control them."
      lastUpdated="1 June 2026"
      crumbLabel="Cookies"
      sections={[
        {
          heading: "What cookies are",
          paragraphs: [
            "Cookies are small text files stored on your device when you visit a website. They let the site remember things like what is in your basket, whether you are signed in, and how you got to the page.",
          ],
        },
        {
          heading: "Strictly necessary",
          paragraphs: [
            "These cookies make the site work — they remember your basket, your sign-in state and your delivery postcode. They cannot be switched off.",
          ],
        },
        {
          heading: "Performance",
          paragraphs: [
            "These cookies let us count visits and traffic sources so we can measure and improve the site. They collect data in an aggregated, anonymous form.",
          ],
        },
        {
          heading: "Marketing",
          paragraphs: [
            "If you give consent, these cookies help us show relevant ads on other sites and measure their effectiveness. You can withdraw consent at any time from the cookie banner.",
          ],
        },
        {
          heading: "Managing cookies",
          paragraphs: [
            "You can clear or block cookies in your browser settings. Blocking strictly necessary cookies will prevent parts of the site from working — for example, your basket will reset between pages.",
          ],
        },
      ]}
    />
  );
}
