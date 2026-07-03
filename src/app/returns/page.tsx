import LegalPage from "@/components/layout/LegalPage";

export default function ReturnsPage() {
  return (
    <LegalPage
      eyebrow="Customer Care"
      title="Returns & Refunds"
      blurb="Our policy on returns, refunds, cancellations, and damaged items."
      lastUpdated="29 June 2026"
      crumbLabel="Returns"
      sections={[
        {
          heading: "Our promise",
          paragraphs: [
            "We want you to love every item you order from AfroMart. If something isn't right, we're here to make it right. This policy explains your rights under the Consumer Contracts Regulations 2013 and our own extended guarantees.",
            "For the purposes of this policy, \"items\" means any products purchased on afromart.co.uk, and \"order\" means the entire purchase made in a single transaction.",
          ],
        },
        {
          heading: "Your right to cancel",
          paragraphs: [
            "Under the Consumer Contracts Regulations 2013, you have the right to cancel any order (except for the items listed in the exceptions section below) within 14 calendar days of receiving your items.",
            "To cancel your order, email hello@afromart.co.uk with your order number and the items you wish to cancel. Alternatively, use the cancellation form at the bottom of this page.",
            "If you cancel, you must return the items within 14 days of telling us. Items must be unused, unopened, and in their original packaging. We will refund the full order value including standard delivery costs within 14 days of receiving the returned items.",
          ],
        },
        {
          heading: "Exceptions — items that cannot be returned",
          paragraphs: [
            "The following items are exempt from the 14-day cancellation right under regulation 28 of the Consumer Contracts Regulations:",
            "Frozen and chilled goods: including frozen meat, fish, vegetables, and any item shipped in our cold-chain packaging.",
            "Perishable goods: including fresh produce, fresh herbs, and items with a short shelf life (less than 3 months).",
            "Sealed goods that have been opened or unsealed after delivery for hygiene reasons, where the seal was broken by you.",
            "Allergen and dietary-specific products that have been personalised or customised for you.",
            "If any of these items arrive damaged or faulty, please see the \"Damaged, faulty, or incorrect items\" section below.",
          ],
        },
        {
          heading: "Returning non-exempt items",
          paragraphs: [
            "For items eligible for return, please follow these steps:",
            "1. Email hello@afromart.co.uk with your order number and the items you wish to return. We will confirm whether the items qualify and provide a returns address.",
            "2. Pack the items securely in their original packaging, including any labels or tags. Include your order number inside the package.",
            "3. Send the items to the returns address we provide. We recommend using a tracked service and keeping proof of postage.",
            "You are responsible for the cost of return postage unless the item was damaged, faulty, or incorrect at the time of delivery. Return postage costs are non-refundable.",
          ],
        },
        {
          heading: "Damaged, faulty, or incorrect items",
          paragraphs: [
            "If any item in your order arrives damaged, faulty, or is not what you ordered, please let us know within 48 hours of delivery. Email hello@afromart.co.uk with:",
            "• Your order number\n• A description of the issue\n• Clear photos of the item and its packaging\n• Your preferred resolution (replacement or refund)",
            "We will respond within 24 hours and arrange a free collection or ask you to return the item using a prepaid returns label we provide. Once we receive the item (or, for replacements, once we confirm the issue), we will process your refund or dispatch a replacement.",
            "Refunds for damaged or incorrect items include the full item price, any delivery charges, and your reasonable return postage costs. Refunds are issued to the original payment method within 14 days.",
            "For perishable and frozen items that arrive damaged or have thawed, we ask for photos within 48 hours. We will refund or replace without requiring you to return the item.",
          ],
        },
        {
          heading: "Partial returns and split orders",
          paragraphs: [
            "If your order was dispatched in multiple shipments, the 14-day cancellation period starts from the day you receive the last item in your order.",
            "You may return individual items from a multi-item order without returning the entire order. The delivery charge is refunded proportionally based on the value of the returned items.",
          ],
        },
        {
          heading: "Refund timing",
          paragraphs: [
            "We process refunds within 14 days of receiving returned items (or, for cancellations before dispatch, within 14 days of your cancellation notice). Refunds are made to the original payment method and may take 3–5 working days to appear in your account depending on your card issuer.",
            "We will confirm the refund by email once it has been processed.",
          ],
        },
        {
          heading: "Quality guarantee",
          paragraphs: [
            "We take pride in sourcing authentic African grocery products. If you are unsatisfied with the quality of any pantry item, contact us within 7 days of delivery with your order number and feedback. While taste is subjective, we will review each case and offer a refund or credit if the product does not meet reasonable quality standards.",
            "This quality guarantee does not apply to frozen, chilled, or perishable items once delivered in good condition, as we cannot control storage and handling after delivery.",
          ],
        },
        {
          heading: "How to contact us",
          paragraphs: [
            "For all returns, refunds, and cancellation requests, please contact our Customer Care team:",
            "Email: hello@afromart.co.uk\nResponse time: within 24 hours on weekdays",
            "We aim to resolve all issues within 5 working days of receiving the necessary information and photos.",
          ],
        },
      ]}
    />
  );
}
