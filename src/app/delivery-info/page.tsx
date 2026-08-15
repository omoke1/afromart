import LegalPage from "@/components/layout/LegalPage";

export default function DeliveryInfoPage() {
  return (
    <LegalPage
      eyebrow="Customer Care"
      title="Delivery Information"
      blurb="Where we deliver, how much it costs, and when your order will arrive."
      lastUpdated="14 August 2026"
      crumbLabel="Delivery info"
      sections={[
        {
          heading: "Where we deliver",
          paragraphs: [
            "We deliver across the whole of the United Kingdom — England, Scotland, Wales and Northern Ireland — using tracked courier services. Most orders reach you within 24–48 hours of dispatch.",
            "Remote postcodes (Scottish Highlands, Northern Ireland and certain offshore islands) may take 48–72 hours. We'll show you the accurate delivery window for your postcode at checkout before you pay.",
          ],
        },
        {
          heading: "Delivery costs",
          paragraphs: [
            "Standard delivery is £4.99 for orders under £40. Delivery is free on all orders over £40, before any promotional discounts are applied.",
            "Where available, express and timed delivery slots are shown at checkout with their applicable charges. Charges are confirmed before you place your order — there are no hidden fees.",
          ],
        },
        {
          heading: "Order cutoff and dispatch",
          paragraphs: [
            "Orders placed before 3pm on a working day are picked and dispatched the same day. Orders placed after the cutoff are dispatched on the next working day.",
            "Frozen and chilled orders ship in insulated cold-chain packaging. To avoid weekend transit, we dispatch cold-chain orders on Monday to Wednesday.",
            "You'll receive a confirmation email when your order is dispatched, followed by a tracking link from our courier so you can follow your delivery in real time.",
          ],
        },
        {
          heading: "Same-day delivery",
          paragraphs: [
            "Same-day delivery is available in Greater London for orders placed before 11am. Availability is confirmed at checkout and depends on postcode and courier capacity.",
          ],
        },
        {
          heading: "Receiving your order",
          paragraphs: [
            "Our couriers deliver to your front door. If you won't be home, choose a safe place or a neighbour at checkout — your courier will follow your instructions. If a delivery is missed, the courier will leave a calling card and attempt redelivery or arrange a local pickup.",
            "Frozen and chilled items should be refrigerated or frozen as soon as possible after delivery.",
          ],
        },
        {
          heading: "Tracking your order",
          paragraphs: [
            "Once your order is dispatched you'll receive a tracking link by email. You can also track your order at any time on our Track Order page at /track-order.",
          ],
        },
        {
          heading: "Delays and problems",
          paragraphs: [
            "We're not liable for delays caused by events outside our reasonable control, including extreme weather, courier strikes, or public health emergencies. We'll always let you know if an event is likely to delay your delivery.",
            "If your order hasn't arrived within the estimated window, email hello@afromart.co.uk with your order number and we'll investigate with the courier and, if necessary, arrange a redelivery or refund.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For questions about your delivery, email hello@afromart.co.uk. Our team responds within 24 hours on weekdays.",
          ],
        },
      ]}
    />
  );
}
