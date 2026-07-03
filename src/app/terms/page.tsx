import LegalPage from "@/components/layout/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      blurb="The agreement between you and AfroMart when you shop with us."
      lastUpdated="29 June 2026"
      crumbLabel="Terms"
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            "AfroMart Ltd (\"AfroMart\", \"we\", \"us\", \"our\") is a company registered in England and Wales under company number 14782391. Our registered office is at 124 Commercial Street, London, E1 6BG, United Kingdom. Our VAT number is GB 123 4567 89.",
            "We operate the website afromart.co.uk (the \"Site\") and sell African and Nigerian grocery products for delivery across the United Kingdom. To contact us, email hello@afromart.co.uk or write to our registered address above.",
          ],
        },
        {
          heading: "Acceptance of terms",
          paragraphs: [
            "By accessing or using the Site, registering an account, or placing an order, you agree to be bound by these Terms of Service (the \"Terms\"). If you do not agree, do not use the Site or place an order.",
            "These Terms apply to all visitors, users, account holders, and customers. They supplement, and do not replace, your statutory rights as a consumer under UK consumer law.",
          ],
        },
        {
          heading: "Changes to terms",
          paragraphs: [
            "We may revise these Terms from time to time. Changes will be posted on this page with an updated \"Last updated\" date. The version in force at the time you place an order governs that order.",
            "It is your responsibility to review the Terms periodically. Continued use of the Site after a change constitutes acceptance of the updated Terms.",
          ],
        },
        {
          heading: "Eligibility",
          paragraphs: [
            "To place an order you must be at least 18 years old and have a valid UK delivery address. By ordering you confirm that all details you provide are accurate and complete.",
            "We reserve the right to refuse service, close accounts, or cancel orders at our discretion, including where we suspect fraud, unauthorised use, or a breach of these Terms.",
          ],
        },
        {
          heading: "Registration and account security",
          paragraphs: [
            "When you create an account you must provide a valid email address and choose a secure password. You are responsible for all activity under your account.",
            "You must notify us immediately at hello@afromart.co.uk if you believe your account has been compromised. We are not liable for any loss arising from unauthorised use of your account.",
            "We may suspend or terminate accounts that violate these Terms or engage in abusive, fraudulent, or unlawful behaviour.",
          ],
        },
        {
          heading: "Orders and contract formation",
          paragraphs: [
            "When you place an order through the Site, you make an offer to purchase the items in your cart at the prices displayed. We will send an acknowledgement email confirming receipt of your order.",
            "A binding contract is formed only when we send you a \"Dispatch Confirmation\" email confirming that your items have been dispatched. We may reject an order for any reason before dispatch, including if an item is out of stock, mispriced, or payment is not authorised.",
            "If we reject your order we will notify you and refund any payment taken within 14 days.",
          ],
        },
        {
          heading: "Pricing and payment",
          paragraphs: [
            "All prices are in pounds sterling (£) and include VAT at the applicable rate. Delivery charges are shown at checkout and are additional unless free delivery thresholds are met.",
            "We take reasonable care to ensure prices are accurate, but errors may occur. If an item is priced incorrectly we will contact you before dispatching and give you the option to confirm the corrected price or cancel.",
            "Payment is due at the time of order. We accept major debit and credit cards, Apple Pay, Google Pay, and Klarna (where available). All payments are processed securely by our PCI-compliant payment provider Stripe. We never store full card numbers.",
          ],
        },
        {
          heading: "Promotions and discounts",
          paragraphs: [
            "Promotional codes and discounts are subject to specific terms stated at the time of issue. They cannot be combined unless explicitly stated, have no cash value, and may be withdrawn or amended at any time.",
            "Promotional prices apply only while displayed and only to the items they reference. We reserve the right to limit quantities on promotional items.",
          ],
        },
        {
          heading: "Delivery",
          paragraphs: [
            "We deliver across the United Kingdom using tracked third-party couriers. Estimated delivery times are 24–48 hours from dispatch for most postcodes, and 48–72 hours for remote areas including Scottish Highlands, Northern Ireland, and certain offshore postcodes.",
            "Delivery is free on orders over £40. Orders under £40 incur a £4.99 delivery fee. Any additional shipping options (e.g. express or timed delivery) are shown at checkout with applicable charges.",
            "Risk of loss or damage to products passes to you upon delivery. You must inspect your delivery promptly and report any issues in accordance with our Returns Policy.",
            "We are not liable for delays caused by events outside our reasonable control, including extreme weather, courier strikes, or public health emergencies.",
          ],
        },
        {
          heading: "Returns, refunds, and cancellations",
          paragraphs: [
            "You have the right to cancel your order within 14 days of receiving your items under the Consumer Contracts Regulations 2013, subject to the exceptions below. To cancel, email hello@afromart.co.uk or use the cancellation form on our Returns page.",
            "Frozen, chilled, and perishable goods are not eligible for cancellation or return once delivered, except where damaged or faulty. This is because these items are exempt under regulation 28 of the Consumer Contracts Regulations.",
            "Unopened pantry items with a shelf life of more than 3 months may be returned within 14 days of delivery for a full refund. Items must be unused, unopened, and in their original packaging. You are responsible for the cost of return postage unless the item was faulty or incorrect.",
            "Refunds will be issued to the original payment method within 14 days of our receipt of returned goods (or, for cancellations, within 14 days of your cancellation notice).",
            "If an item arrives damaged, faulty, or incorrect, email hello@afromart.co.uk within 48 hours with your order number, photos of the item and packaging. We will arrange a free replacement or full refund including delivery costs.",
            "For full details, see our Returns Policy at /returns.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "All content on the Site — including text, images, logos, product descriptions, and the AfroMart brand — is owned by or licensed to AfroMart Ltd. It is protected by UK and international copyright, trade mark, and database rights.",
            "You may not reproduce, distribute, modify, or commercially exploit any content from the Site without our prior written permission.",
          ],
        },
        {
          heading: "User conduct",
          paragraphs: [
            "You agree not to use the Site for any unlawful purpose, to upload or transmit any viruses or malicious code, to attempt to gain unauthorised access to our systems, or to interfere with the proper functioning of the Site.",
            "We reserve the right to monitor activity on the Site and to take appropriate action, including reporting to law enforcement, where we detect prohibited conduct.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by UK law.",
            "Subject to the above, our total liability to you in connection with any order is limited to the total value of that order. We are not liable for any indirect or consequential losses, including loss of profits, business interruption, or loss of data.",
            "We provide the Site on an \"as is\" and \"as available\" basis. We do not guarantee that the Site will be uninterrupted, error-free, or secure, and we are not liable for temporary unavailability due to maintenance or technical issues.",
          ],
        },
        {
          heading: "Privacy and data protection",
          paragraphs: [
            "We collect, use, and protect your personal data in accordance with our Privacy Policy, which forms part of these Terms. By using the Site you consent to the practices described in the Privacy Policy.",
            "Please read our Privacy Policy carefully to understand how we handle your information.",
          ],
        },
        {
          heading: "Third-party links",
          paragraphs: [
            "The Site may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of those third parties. You access them at your own risk.",
          ],
        },
        {
          heading: "Governing law and jurisdiction",
          paragraphs: [
            "These Terms are governed by the laws of England and Wales. Any dispute arising out of or relating to these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
            "If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "If you have any questions about these Terms, please contact us at hello@afromart.co.uk or write to AfroMart Ltd, 124 Commercial Street, London, E1 6BG, United Kingdom.",
          ],
        },
      ]}
    />
  );
}
