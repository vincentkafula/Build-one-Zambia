import { Link } from 'react-router';

const SECTIONS = [
  {
    num: '1', title: 'Privacy Policy',
    body: 'Please refer to our Privacy Policy for details on how we collect, use, store and disclose personal information from users of the Sites, in accordance with the Data Protection Act No. 3 of 2021 of the Republic of Zambia.',
  },
  {
    num: '2', title: 'Copyright and Limited License',
    body: `Unless otherwise indicated, all content on the Sites — including the BOZ name and logo, designs, text, graphics, images, data, software, audio and video files, and the selection and arrangement of such content (the "Site Materials") — is the proprietary property of BOZ or its licensors and is protected under the Copyright and Performance Rights Act of Zambia and applicable international copyright treaties.

You are granted a limited, non-transferable, revocable licence to access and use the Sites and Site Materials solely for personal, non-commercial, informational purposes. This licence does not permit you to: resell or commercially exploit the Sites or any Site Materials; reproduce, distribute, publicly display or perform any Site Materials; modify or create derivative works; use bots, scrapers, or similar automated data-collection tools; download any portion of the Sites beyond ordinary page caching; or use the Sites for any purpose other than their intended use.`,
  },
  {
    num: '3', title: 'Repeat Infringer Policy',
    body: 'BOZ reserves the right, at its sole discretion, to suspend or terminate access to the Sites for any user found to have repeatedly infringed the intellectual property rights of BOZ or any third party, whether or not formal legal proceedings have been initiated.',
  },
  {
    num: '4', title: 'Trademarks',
    body: 'All names, logos, emblems and slogans appearing on the Sites are trademarks of BOZ or its affiliates and may not be copied, imitated or used without our prior written consent. You may not use any metatags or hidden text incorporating "Build One Zambia", "BOZ", or any related name without our prior written permission.',
  },
  {
    num: '5', title: 'Hyperlinks',
    body: 'You may not use any BOZ logo or proprietary graphic to link to the Sites, or frame any part of the Sites, without our express written consent. BOZ is not responsible for the content, accuracy, or practices of any third-party websites linked to or from the Sites.',
  },
  {
    num: '6', title: 'Third-Party Content and Services',
    body: 'The Sites may reference or provide access to third-party information, products or services. Any dealings you have with such third parties are strictly between you and them. BOZ does not endorse, control, or assume responsibility for third-party content.',
  },
  {
    num: '7', title: 'Submissions',
    body: 'Any feedback, ideas, suggestions or other communications you send to BOZ are considered non-confidential. By submitting such material, you grant BOZ an unrestricted, royalty-free right to use it for any lawful purpose.',
  },
  {
    num: '8', title: 'User Content and Interactive Areas',
    body: 'You agree not to post content that is unlawful, defamatory, obscene, abusive, harassing, or misleading; promotes violence, hate speech, or ethnic division; infringes any copyright or trademark; impersonates any person; or contains malicious code. BOZ reserves the right to monitor, edit or remove any User Content at its sole discretion.',
  },
  {
    num: '9', title: 'Registration Data and Account Security',
    body: 'If you register an account on the Sites, you agree to provide accurate and current information, keep your login credentials confidential, and promptly update your details as needed. You are solely responsible for maintaining the confidentiality of your account.',
  },
  {
    num: '10', title: 'Indemnification',
    body: 'You agree to indemnify and hold harmless BOZ, its officials, employees, volunteers and agents from any claims, damages, losses or expenses arising from your use of the Sites, any User Content you submit, or your violation of these Terms.',
  },
  {
    num: '11', title: 'Disclaimers',
    body: 'The Sites and all related content and services are provided on an "as is" and "as available" basis, without warranties of any kind. BOZ does not warrant that the Sites will be uninterrupted, error-free, or free of viruses or harmful components.',
  },
  {
    num: '12', title: 'Limitation of Liability',
    body: 'To the fullest extent permitted under the laws of Zambia, BOZ, its officials, employees, volunteers and agents shall not be liable for any direct, indirect, incidental, special or consequential damages arising from your use of, or inability to use, the Sites.',
  },
  {
    num: '13', title: 'Dispute Resolution',
    body: 'Any dispute arising out of or relating to these Terms shall first be addressed through good-faith negotiation. If unresolved within thirty (30) days, either party may refer the matter to mediation or arbitration under the Arbitration Act No. 19 of 2000 of Zambia, with proceedings conducted in Lusaka, Zambia.',
  },
  {
    num: '14', title: 'Termination',
    body: 'BOZ reserves the right, without notice and at its sole discretion, to suspend, restrict or terminate your access to the Sites at any time, for any reason, including violation of these Terms.',
  },
  {
    num: '15', title: 'Severability',
    body: 'If any provision of these Terms is found to be unlawful, void or unenforceable under the laws of Zambia, that provision shall be deemed severable and shall not affect the validity of the remaining provisions.',
  },
  {
    num: '16', title: 'Political Contributions and Donations',
    body: 'All donations made to BOZ must be from the contributor\'s own funds and not reimbursed by any other person or entity, in compliance with the Political Parties Act and the Electoral Process Act No. 35 of 2016 of Zambia. Donations may not be accepted from foreign governments or other prohibited sources under Zambian electoral law.',
  },
  {
    num: '17', title: 'Contribution Refunds and Cancellations',
    body: 'All donations made to BOZ are generally considered final. Refunds may be issued at the sole discretion of BOZ, including in cases of demonstrable error. Contact donations@bozplans.org to raise any concerns.',
  },
  {
    num: '18', title: 'Contribution Confirmations',
    body: 'Confirmation of online donations will be sent to the email address you provide. It is your responsibility to ensure that your contact details are accurate and current.',
  },
  {
    num: '19', title: 'Mobile and SMS Communications',
    body: 'If you opt in to receive updates via SMS or mobile messaging, you consent to receive messages from BOZ or a third-party provider acting on our behalf, in accordance with the Electronic Communications and Transactions Act No. 4 of 2021 of Zambia. Standard messaging and data rates may apply. You may opt out by texting "STOP" or contacting info@bozplans.org.',
  },
  {
    num: '20', title: 'Governing Law',
    body: 'These Terms shall be governed by and construed in accordance with the laws of the Republic of Zambia, without regard to conflict-of-law principles. Any legal action shall be brought exclusively before the courts of Zambia.',
  },
  {
    num: '21', title: 'Contact Information',
    body: 'Questions or comments regarding these Terms may be directed to Build One Zambia at info@bozplans.org or privacy@bozplans.org.',
  },
];

export function TermsOfServicePage() {
  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'Open Sans, sans-serif', color: '#1a1a1a' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #007A30 0%, #005a22 60%, #1a0000 100%)', padding: 'clamp(64px, 8vw, 96px) 16px 72px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.25em', color: '#dc2626', marginBottom: '12px' }}>
            BUILD ONE ZAMBIA
          </p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
            TERMS OF SERVICE
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>Last updated: 17 June 2026</p>
        </div>
      </section>

      {/* Preamble */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl border-l-4 p-6 mb-10" style={{ borderColor: '#dc2626', backgroundColor: '#fff7f7' }}>
          <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.8, fontWeight: 600 }}>
            PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THIS WEBSITE OR ANY ASSOCIATED MOBILE APPLICATION OR DIGITAL PLATFORM. BY ACCESSING OR USING THIS SITE, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, PLEASE DO NOT USE THIS SITE.
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.9, marginBottom: '24px' }}>
          This website and any associated mobile application or digital platform (collectively, the "Platform") is operated by <strong>Build One Zambia</strong> ("BOZ", "we", "us" or "our"), a registered political party in the Republic of Zambia under the leadership of Vincent Kafula. These Terms of Service govern your access to and use of <strong>www.bozplans.org</strong> and any other BOZ digital platforms that reference these Terms.
        </p>

        <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.9, marginBottom: '24px' }}>
          We may update or amend these Terms at any time. Continued use of the Sites after changes are posted constitutes your acceptance of the revised Terms. Questions or comments about the Sites should be directed to <a href="mailto:privacy@bozplans.org" style={{ color: '#007A30' }}>privacy@bozplans.org</a>.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map(section => (
            <div key={section.num}>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.06em', color: '#007A30', marginBottom: '8px' }}>
                {section.num}. {section.title.toUpperCase()}
              </h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#dc2626', marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
            Build One Zambia — Paid for and authorised by Build One Zambia, under the leadership of Vincent Kafula.
          </p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '16px', fontSize: '13px', color: '#007A30', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
            ← RETURN TO HOME
          </Link>
        </div>
      </section>
    </div>
  );
}
