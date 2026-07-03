import LegalPage from "@/components/layout/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      blurb="What personal data we collect, why we collect it, and your rights under UK data protection law."
      lastUpdated="29 June 2026"
      crumbLabel="Privacy"
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            "AfroMart Ltd (\"AfroMart\", \"we\", \"us\", \"our\") is the data controller for personal information collected on afromart.co.uk. We are registered with the Information Commissioner's Office (ICO) under registration number ZB678912.",
            "Our registered office is at 124 Commercial Street, London, E1 6BG, United Kingdom. Our data protection representative can be contacted at privacy@afromart.co.uk.",
          ],
        },
        {
          heading: "What personal data we collect",
          paragraphs: [
            "We collect the following categories of personal data when you use our Site:",
            "Identity and contact data: full name, email address, phone number, delivery address, and billing address. This is collected when you create an account, place an order, or contact us.",
            "Account data: username, password (stored as a salted hash — we never see your raw password), order history, wishlist items, and saved delivery addresses.",
            "Financial data: payment card tokens and transaction identifiers. We do not store full card numbers, CVV codes, or expiry dates. All payment processing is handled by Stripe, our PCI Level 1-compliant payment provider.",
            "Communication data: emails you send us, responses to customer satisfaction surveys, and records of phone calls or live chat interactions.",
            "Technical data: IP address, browser type and version, device type, operating system, and browsing behaviour on our Site including pages viewed, products searched for, and referring URL.",
            "Cookie data: we use essential cookies to operate the Site (e.g. to remember your cart contents and login status) and analytics cookies (with your consent) to understand how shoppers use the Site. For full details see our Cookie Policy.",
          ],
        },
        {
          heading: "Lawful basis for processing",
          paragraphs: [
            "We process your personal data only where we have a lawful basis under UK GDPR. The bases we rely on are:",
            "Contract performance: to fulfil orders, process payments, and provide customer service relating to your purchases (Article 6(1)(b) UK GDPR).",
            "Legitimate interest: to send transactional emails (order confirmations, dispatch notices), to prevent fraud, to analyse Site usage and improve our service, and to maintain the security of our systems (Article 6(1)(f) UK GDPR).",
            "Consent: to send marketing newsletters, to place non-essential cookies, and to process your data for any purpose where we specifically ask for your permission (Article 6(1)(a) UK GDPR). You can withdraw consent at any time.",
            "Legal obligation: to retain order records for tax purposes, to comply with HMRC requirements, and to respond to lawful requests from regulators or law enforcement (Article 6(1)(c) UK GDPR).",
          ],
        },
        {
          heading: "How we use your data",
          paragraphs: [
            "We use your personal data for the following purposes:",
            "To process and fulfil your orders, including taking payment, arranging delivery, and sending order confirmations and dispatch updates.",
            "To manage your account, including password resets, address management, and order history.",
            "To provide customer support, including handling returns, refunds, and complaints.",
            "To send transactional communications that are necessary for your orders or account (e.g. order confirmations, delivery updates, policy changes). These are not marketing emails and cannot be opted out of.",
            "With your consent, to send our weekly newsletter featuring recipes, product launches, and offers. You can unsubscribe at any time using the link in each email or by updating your account preferences.",
            "To improve our Site and product range through analytics, trend analysis, and customer feedback.",
            "To detect and prevent fraud, unauthorised transactions, and other prohibited activity.",
          ],
        },
        {
          heading: "Who we share your data with",
          paragraphs: [
            "We share your personal data only where necessary and only to the extent required for the specific purpose:",
            "Delivery couriers (e.g. Royal Mail, DPD, Evri): name, phone number, and delivery address to deliver your order.",
            "Stripe (our payment processor): payment information to process transactions. Stripe acts as an independent data controller for the payment data it processes. See stripe.com/gb/privacy for their privacy policy.",
            "Email service providers (e.g. Resend, Mailchimp): email address to send transactional and marketing emails.",
            "Analytics providers (e.g. Vercel Analytics, Google Analytics): anonymised technical and behavioural data to help us understand Site usage. Where analytics cookies require consent, we only activate them after you accept.",
            "HMRC and law enforcement: where we are legally obliged to share data in response to a lawful request.",
            "We do not sell, rent, or trade your personal data to third parties for their own marketing purposes.",
          ],
        },
        {
          heading: "International transfers",
          paragraphs: [
            "Most of our service providers are based in the UK and European Economic Area (EEA). Where we use providers in jurisdictions outside the UK or EEA (such as the United States), we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) and the UK International Data Transfer Agreement (IDTA), or a finding of adequacy by the UK government.",
            "You can request a copy of the safeguards we use for international transfers by emailing privacy@afromart.co.uk.",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected:",
            "Order records: 6 years after the order date to comply with HMRC tax and accounting requirements.",
            "Account data: until you close your account. If your account is inactive for 5 years we will contact you before deleting it.",
            "Marketing subscriptions: until you unsubscribe, after which we retain a suppression list to ensure we do not contact you again.",
            "Communication records: 2 years after the last contact.",
            "Analytics data: anonymised after 26 months. Raw analytics logs are retained for 6 months.",
          ],
        },
        {
          heading: "Your rights under UK GDPR",
          paragraphs: [
            "You have the following rights in relation to your personal data:",
            "Right of access (Article 15): you can request a copy of the personal data we hold about you.",
            "Right to rectification (Article 16): you can ask us to correct inaccurate or incomplete data.",
            "Right to erasure (Article 17): you can request deletion of your personal data where there is no compelling reason for us to keep it.",
            "Right to restrict processing (Article 18): you can ask us to limit how we use your data while a dispute is being resolved.",
            "Right to data portability (Article 20): you can request your data in a structured, machine-readable format.",
            "Right to object (Article 21): you can object to processing based on legitimate interests, including direct marketing.",
            "Rights in relation to automated decision-making (Article 22): we do not use fully automated decision-making processes that produce legal effects concerning you.",
            "To exercise any of these rights, email privacy@afromart.co.uk. We will respond within 30 days. If you are unsatisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ico.org.uk).",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "Our Site uses cookies and similar technologies. Essential cookies are necessary for the Site to function (e.g. cart and session cookies). Analytics and preference cookies are used only with your consent.",
            "You can manage your cookie preferences at any time through the cookie banner or your account settings. For full details see our Cookie Policy at /cookies.",
          ],
        },
        {
          heading: "Children's privacy",
          paragraphs: [
            "AfroMart is not directed at children under the age of 16. We do not knowingly collect personal data from anyone under 16. If you become aware that a child has provided us with personal data without parental consent, please contact us at privacy@afromart.co.uk and we will take steps to delete the information.",
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "We implement appropriate technical and organisational measures to protect your personal data, including SSL/TLS encryption for all data transmitted through our Site, password hashing, restricted access to personal data on a need-to-know basis, and regular security audits of our systems.",
            "While we take every reasonable precaution, no method of transmission over the internet is completely secure. We cannot guarantee the absolute security of your data.",
          ],
        },
        {
          heading: "Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. Material changes will be notified by email and by updating the \"Last updated\" date on this page.",
            "We encourage you to review this policy periodically. Continued use of the Site after changes take effect constitutes acceptance of the updated policy.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Representative:",
            "Email: privacy@afromart.co.uk\nPost: AfroMart Ltd, 124 Commercial Street, London, E1 6BG, United Kingdom\nICO Registration Number: ZB678912",
          ],
        },
      ]}
    />
  );
}
