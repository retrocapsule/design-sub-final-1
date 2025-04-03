import { Navigation } from '@/components/layout/navigation'; // Assuming this path is correct

export default function TermsPage() {
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const lastUpdated = currentDate.toLocaleDateString('en-US', options); // e.g., "April 3, 2025"

  return (
    <>
      <Navigation />
      <main className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">Terms of Service</h1>
          <p className="text-center text-muted-foreground mb-10">Last Updated: {lastUpdated}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-h2:mt-10 prose-h2:mb-4">
            
            <p>
              Welcome to DesignSub! These Terms of Service ("Terms") govern your use of the DesignSub website (the "Site") and the design subscription services offered (the "Service"). By accessing the Site or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h2>1. Service Description</h2>
            <p>
              DesignSub provides a subscription-based graphic design service. For a flat monthly fee, subscribers receive access to unlimited design requests and revisions for various creative needs, including but not limited to social media graphics, merchandise designs, branding assets, marketing materials, web design elements, and print materials. Designs are typically delivered digitally through the user dashboard.
            </p>
            <p>
              This service does not include coding, video editing (except potentially under the Enterprise plan as separately agreed), or the delivery of source files requiring specific software (unless subscribed to the Enterprise plan). DesignSub reserves the right to reject requests deemed outside the scope of service, overly complex for the chosen plan, or violating user conduct rules.
            </p>

            <h2>2. Subscription and Payment</h2>
            <p>
              Access to the Service requires an active subscription. Subscription plans, features, and pricing are detailed on our Pricing page. Subscriptions are billed on a recurring monthly basis on the date you originally signed up. You agree to provide current, complete, and accurate purchase and account information. Failure to pay may result in suspension or termination of your service. All payments are processed through a secure third-party payment processor.
            </p>

            <h2>3. Design Process and Delivery</h2>
            <ul>
              <li><strong>Requests:</strong> Subscribers can submit unlimited design requests through their dashboard. Each request should be clear and provide sufficient detail for our designers.</li>
              <li><strong>Revisions:</strong> Unlimited revisions are included on submitted designs. Revisions should be requested clearly and promptly.</li>
              <li><strong>Turnaround Time:</strong> Estimated turnaround times for initial concepts or revisions vary by plan: approximately 72 business hours for Basic, 48 business hours for Pro, and 24 business hours for Enterprise (Monday-Friday, excluding holidays), after receiving a clear and complete request. These are estimates, not guarantees. Revisions, request complexity, or unclear instructions can extend delivery times.</li>
              <li><strong>Queue:</strong> Requests are generally processed one at a time per subscription, based on the order they are received and clarified.</li>
              <li><strong>Communication:</strong> Primary communication regarding requests and revisions occurs through the user dashboard.</li>
              <li><strong>File Formats:</strong> Final approved designs are typically delivered in standard image formats such as PNG, JPG, or PDF. Source files (e.g., .ai, .psd, .fig) are only included as part of the Enterprise subscription plan.</li>
            </ul>

            <h2>4. Intellectual Property Rights</h2>
            <p>
              You, the subscriber, retain ownership of all final, approved design files delivered to you by DesignSub for requests made during an active subscription period. You grant DesignSub a limited license to use the designs created for you for our internal use and portfolio/marketing purposes (e.g., on our website or social media). We will request your permission before using your designs publicly whenever feasible. DesignSub retains ownership of all preliminary concepts, draft designs, and any materials not part of the final approved deliverables. Your subscription fee covers the license for the final, approved design output only. It does not extend to licenses for any specific underlying stock photos or fonts that may be used; while we often utilize assets with open commercial licenses (including AI-generated elements), you are responsible for securing appropriate licenses if you require rights beyond the final delivered image.
            </p>

            <h2>5. User Conduct</h2>
            <p>
              You agree not to use the Service for any unlawful purpose or to request designs that are offensive, infringing, or violate the rights of others. You are responsible for maintaining the confidentiality of your account information.
            </p>

            <h2>6. Guarantee and Refund Policy</h2>
            <p>
              We offer a satisfaction guarantee. Eligibility for a refund under the satisfaction guarantee typically requires that the request for refund is made within the first 14 days of the *initial* subscription period. The guarantee primarily applies when the service fails to meet objective quality standards or follow clearly provided instructions, assuming clear and sufficient information was provided in the request brief. The guarantee may be void if project descriptions were unclear or insufficient. To prevent abuse, refunds may be prorated based on the extent of service usage prior to the refund request, or denied if significant service value has already been delivered. Please contact support to discuss your specific situation.
            </p>

            <h2>7. Cancellation and Termination</h2>
            <p>
              You may cancel your subscription at any time through your account dashboard or by contacting support. Cancellation will be effective at the end of your current billing cycle. No refunds will be provided for partial subscription periods. DesignSub reserves the right to suspend or terminate your access to the Service at any time, with or without cause or notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
            </p>

            <h2>8. Disclaimers and Limitation of Liability</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. DesignSub does not warrant that the service will be uninterrupted, timely, secure, or error-free. To the fullest extent permitted by law, DesignSub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting the new Terms on the Site and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of California, USA, without regard to its conflict of law provisions.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at help@designsub.com.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

// Basic styling using Tailwind prose plugin assumed for readability
// Add necessary imports and potentially a Footer component if you have one. 