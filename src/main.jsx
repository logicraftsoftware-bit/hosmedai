import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import pages from './pages.generated.js';

const scripts = [
  '/assets/vendors/jquery/jquery-3.7.1.min.js',
  '/assets/vendors/bootstrap/js/bootstrap.bundle.min.js',
  '/assets/vendors/bootstrap-select/bootstrap-select.min.js',
  '/assets/vendors/jarallax/jarallax.min.js',
  '/assets/vendors/jquery-ui/jquery-ui.js',
  '/assets/vendors/jquery-ajaxchimp/jquery.ajaxchimp.min.js',
  '/assets/vendors/jquery-appear/jquery.appear.min.js',
  '/assets/vendors/jquery-circle-progress/jquery.circle-progress.min.js',
  '/assets/vendors/jquery-magnific-popup/jquery.magnific-popup.min.js',
  '/assets/vendors/jquery-validate/jquery.validate.min.js',
  '/assets/vendors/nouislider/nouislider.min.js',
  '/assets/vendors/wnumb/wNumb.min.js',
  '/assets/vendors/owl-carousel/js/owl.carousel.min.js',
  '/assets/vendors/wow/wow.js',
  '/assets/vendors/imagesloaded/imagesloaded.min.js',
  '/assets/vendors/isotope/isotope.js',
  '/assets/vendors/slick/slick.min.js',
  '/assets/vendors/countdown/countdown.min.js',
  '/assets/vendors/jquery-circleType/jquery.circleType.js',
  '/assets/vendors/jquery-lettering/jquery.lettering.min.js',
  '/assets/vendors/gsap/gsap.js',
  '/assets/vendors/gsap/scrolltrigger.min.js',
  '/assets/vendors/gsap/splittext.min.js',
  '/assets/vendors/gsap/heartox-split.js',
  '/assets/js/heartox.js'
];

function loadScript(src) {
  return new Promise((resolve) => {
    const element = document.createElement('script');
    element.src = src;
    element.onload = resolve;
    element.onerror = resolve;
    document.body.appendChild(element);
  });
}

function App() {
  const routeName = useMemo(() => {
    const route = location.pathname.split('/').filter(Boolean).pop() || 'index';
    return route.replace(/\.html$/i, '');
  }, []);

  const page = useMemo(() => {
    const requested = `${routeName}.html`;
    if (routeName === 'contact' && !pages[requested]) return pages['about.html'];
    return pages[requested] || pages['404.html'] || pages['index.html'];
  }, [routeName]);

  const markup = useMemo(() => {
    let html = page.html;

    const primaryNavigation = `<ul class="main-menu__list hosmed-navigation">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/hospital-planning">Hospital Planning</a></li>
      <li><a href="/nabh-nabl">NABH / NABL</a></li>
      <li><a href="/hospital-software">Hospital Software</a></li>
      <li><a href="/ai-healthcare">AI Healthcare</a></li>
      <li><a href="/services">Solutions</a></li>
      <li><a href="/who-we-serve">Who We Serve</a></li>
      <li><a href="/portfolio">Projects</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>`;

    html = html.replace(
      /<ul class="main-menu__list">[\s\S]*?<\/ul>\s*<\/nav>/,
      `${primaryNavigation}</nav>`
    )
      .replace(/needhelp@company\.com/g, 'hello@hosmedai.com')
      .replace(/Visit Our Social Pages:/g, 'Connect with HosmedAI:')
      .replace(/Become a Volunteer/g, 'Book a Consultation')
      .replace(
        /<a[^>]*class="[^"]*main-header__info__item[^"]*"[^>]*>\s*<i class="icon-trolley-cart_4175270"><\/i>\s*<\/a>/g,
        ''
      )
      .replace(/<div class="main-header__info">[\s\S]*?<\/div>/g, '')
      .replace(/<div class="main-header__btn">[\s\S]*?<\/div>/g, '');

    if (page === pages['index.html']) {
      html = html
        .replace('assets/images/backgrounds/slider-1-2.jpg', 'assets/images/backgrounds/slider-2.png')
        .replace('assets/images/backgrounds/slider-1-3.jpg', 'assets/images/backgrounds/slider-3.png')
        .replace('assets/images/about/about-1-1.jpg', 'assets/images/about/about-001.png')
        .replace('assets/images/shapes/image-logo.png', 'assets/images/shapes/image-logo-blue.png')
        .replace('assets/images/shapes/shape-about-1-1.png', 'assets/images/shapes/shape-about-1-1-blue.png')
        .replace('assets/images/resources/donation-2-1.jpg', 'assets/images/resources/contact-us.png')
        .replace('Our Core Solutions', 'Our 3 Core Solutions')
        .replace(
          'From hospital planning to digital healthcare, HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance and technology together.',
          'From Hospital Planning to Digital Healthcare — We Do It All. HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance, accreditation and technology together through one integrated platform.'
        )
        .replace(
          'Feasibility, master planning, clinical planning, architecture, equipment planning, workflows and project management.',
          'From concept to commissioning. Hospital feasibility • Master planning • Clinical planning • Architectural design • Department planning • Equipment planning • Workflow design • Project management'
        )
        .replace(
          'Quality systems, SOP development, documentation, training, audits and accreditation readiness.',
          'Build systems that meet standards. NABH consultancy • NABL consultancy • SOP development • Quality systems • Documentation • Accreditation readiness • Training • Audit preparation'
        )
        .replace(
          'Connect ERP, HIS, EMR, billing, pharmacy, laboratory, radiology, inventory, HR, finance, analytics and AI-powered workflows.',
          'Turn your hospital into a connected digital ecosystem. Hospital ERP • HIS • EMR • Billing • Pharmacy • Laboratory • Radiology • Inventory • HR • Finance • Analytics • AI-powered workflows'
        )
        .replace(
          'ERP, HIS, EMR, billing, diagnostics, inventory, finance, analytics and AI-powered workflows.',
          'Turn your hospital into a connected digital ecosystem. Hospital ERP • HIS • EMR • Billing • Pharmacy • Laboratory • Radiology • Inventory • HR • Finance • Analytics • AI-powered workflows'
        )
        .replace('>Hospital Planning & Design</a>', '>01 — Hospital Planning & Design</a>')
        .replace('>NABH / NABL & Healthcare Compliance</a>', '>02 — NABH / NABL & Healthcare Compliance</a>')
        .replace('>Hospital Software & AI</a>', '>03 — Hospital Software & AI</a>')
        .replace(
          /<div class="item">\s*<div class="donation-one__item[\s\S]*?End-to-End Hospital Operations[\s\S]*?<\/div><!-- \/.item -->/,
          ''
        )
        .replace(
          'Support for eating funds <br> for hungry people',
          'From an Idea on Paper to a <br> Fully Operational Hospital.'
        )
        .replace(
          'HosmedAI stays with you throughout the complete hospital journey.',
          'Concept → Feasibility → Planning → Design → Construction Support → Equipment → Compliance → Accreditation → Software → Operations. HosmedAI stays with you throughout the journey.'
        )
        .replace('Get Inspire Hospital Planning Consultation <br> Change a Life', 'Discuss Your Hospital Project With Our Experts')
        .replace(
          /<div class="donate-now__funfact">[\s\S]*?<\/div>\s*<\/div><!-- \/.donate-now__left -->/,
          `<div class="consultation-now__intro">
            <h3>Plan Your Hospital With Confidence</h3>
            <p>Share your requirements and our healthcare planning team will contact you.</p>
          </div>
          </div><!-- /.donate-now__left -->`
        )
        .replace(
          /<form action="#" class="donate-now-form[\s\S]*?<\/form><!-- \/.donate-form -->/,
          `<form action="#" class="donate-now-form consultation-form wow fadeInUp" data-wow-duration="1500ms">
            <div class="consultation-form__grid">
              <div class="consultation-form__control">
                <input type="text" name="contact_name" id="contact_name" placeholder="Contact Person Name" autocomplete="name" required>
              </div>
              <div class="consultation-form__control">
                <input type="text" name="hospital_name" id="hospital_name" placeholder="Hospital Name" autocomplete="organization" required>
              </div>
              <div class="consultation-form__control">
                <input type="tel" name="phone" id="phone" placeholder="Phone Number" autocomplete="tel" required>
              </div>
              <div class="consultation-form__control">
                <input type="email" name="email" id="consultation_email" placeholder="Email Address" autocomplete="email" required>
              </div>
              <div class="consultation-form__control consultation-form__control--full">
                <textarea name="address" id="address" placeholder="Address" autocomplete="street-address" rows="3" required></textarea>
              </div>
            </div>
            <button type="submit" class="heartox-btn heartox-btn--base">Contact Us</button>
          </form><!-- /.consultation-form -->`
        )
        .replace(
          /<div class="charity-cause-donate wow[\s\S]*?<\/div><!-- \/.charity-cause-donate -->/,
          `<section class="hospital-journey wow fadeInUp" data-wow-duration="1500ms">
            <div class="hospital-journey__inner">
              <div class="hospital-journey__intro">
                <p class="hospital-journey__eyebrow"><i class="fas fa-shield-alt"></i> One Partner. Every Hospital Need.</p>
                <h2>From an Idea<br>on Paper to a<br>Fully<br>Operational<br>Hospital<span>.</span></h2>
                <span class="hospital-journey__accent"></span>
              </div>
              <div class="hospital-journey__process">
                <div class="hospital-journey__steps">
                  <div class="hospital-journey__step"><span><i class="fas fa-lightbulb"></i></span><strong>Concept</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-clipboard-check"></i></span><strong>Feasibility</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-map-marked-alt"></i></span><strong>Planning</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-pencil-ruler"></i></span><strong>Design</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-hard-hat"></i></span><strong>Construction<br>Support</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-laptop-medical"></i></span><strong>Equipment</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-award"></i></span><strong>Compliance<br>&amp; Accreditation</strong></div>
                  <div class="hospital-journey__step"><span><i class="fas fa-desktop"></i></span><strong>Software &amp;<br>Operations</strong></div>
                </div>
                <p class="hospital-journey__promise">HosmedAI stays with you throughout the journey.</p>
              </div>
              <div class="hospital-journey__action">
                <a href="/services" class="heartox-btn heartox-btn--secondary">Explore Solutions</a>
                <p>End-to-End <i class="fas fa-arrow-right"></i></p>
              </div>
              <div class="hospital-journey__progress">
                <div class="hospital-journey__bar"><span></span><b>35.66%</b></div>
                <div class="hospital-journey__figures">
                  <div><i class="fas fa-hospital-alt"></i><p><strong>3,912</strong><span>Integrated</span></p></div>
                  <div><i class="fas fa-bullseye"></i><p><strong>4,343</strong><span>Goal</span></p></div>
                </div>
              </div>
            </div>
          </section>`
        );
    }

    if (routeName === 'about') {
      const aboutPage = `<main class="hosmed-about">
        <section class="hosmed-about__hero">
          <div class="container">
            <p class="hosmed-about__eyebrow wow fadeInDown" data-wow-duration="1200ms">About Us</p>
            <h1 class="wow fadeInUp" data-wow-duration="1200ms">We Understand Hospitals Because We Understand Healthcare.</h1>
            <span class="hosmed-about__hero-accent"></span>
            <p class="wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="150ms">HosmedAI brings hospital planning, design, compliance, accreditation, technology and operations together through one integrated healthcare platform.</p>
          </div>
          <div class="container hosmed-about__stats-wrap">
            <div class="hosmed-about__stats wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="200ms">
              <div class="hosmed-about__stat"><i class="fas fa-hospital"></i><p><strong>200+</strong><span>Hospitals Supported</span></p></div>
              <div class="hosmed-about__stat"><i class="fas fa-users"></i><p><strong>50+</strong><span>Healthcare Experts</span></p></div>
              <div class="hosmed-about__stat"><i class="fas fa-award"></i><p><strong>100%</strong><span>Quality &amp; Compliance</span></p></div>
              <div class="hosmed-about__stat"><i class="fas fa-handshake"></i><p><strong>End-to-End</strong><span>Integrated Solutions</span></p></div>
            </div>
          </div>
        </section>

        <section class="hosmed-about__story section-space">
          <div class="container">
            <div class="row align-items-center gutter-y-30">
              <div class="col-lg-6">
                <div class="hosmed-about__image wow fadeInLeft" data-wow-duration="1300ms">
                  <img src="/assets/images/about/about-001.png" alt="Healthcare professional working in a modern hospital">
                </div>
              </div>
              <div class="col-lg-6">
                <div class="hosmed-about__copy wow fadeInRight" data-wow-duration="1300ms">
                  <p class="hosmed-about__eyebrow">Our Vision</p>
                  <h2>HosmedAI was created with a simple vision:</h2>
                  <blockquote>Make Hospital Development Simpler, Smarter &amp; More Integrated.</blockquote>
                  <p>Healthcare organisations often work with multiple consultants for planning, architecture, compliance, accreditation, technology and operations.</p>
                  <p><strong>HosmedAI brings these capabilities together.</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="hosmed-about__integration section-space">
          <div class="container">
            <div class="hosmed-about__heading wow fadeInUp" data-wow-duration="1200ms">
              <p class="hosmed-about__eyebrow">What We Do</p>
              <h2>Everything Required to Plan, Build and Run Better Hospitals.</h2>
              <p>One coordinated team connects every stage of hospital development, reducing complexity and helping healthcare organisations make better decisions.</p>
            </div>
            <div class="hosmed-about__capabilities">
              <article class="wow fadeInUp" data-wow-delay="0ms"><i class="fas fa-drafting-compass"></i><h3>Hospital Planning</h3><p>Feasibility, clinical planning, architecture, infrastructure and equipment planning.</p></article>
              <article class="wow fadeInUp" data-wow-delay="80ms"><i class="fas fa-award"></i><h3>Quality &amp; Accreditation</h3><p>NABH, NABL, quality systems, SOPs, documentation, training and audit readiness.</p></article>
              <article class="wow fadeInUp" data-wow-delay="160ms"><i class="fas fa-laptop-medical"></i><h3>Hospital Technology</h3><p>ERP, HIS, EMR, analytics, connected workflows and purposeful healthcare AI.</p></article>
              <article class="wow fadeInUp" data-wow-delay="240ms"><i class="fas fa-hospital-user"></i><h3>Hospital Operations</h3><p>Operational planning, process design, performance improvement and ongoing support.</p></article>
              <article class="wow fadeInUp" data-wow-delay="320ms"><i class="fas fa-shield-alt"></i><h3>Compliance &amp; Legal</h3><p>Regulatory approvals, policies, legal compliance and risk management.</p></article>
              <article class="wow fadeInUp" data-wow-delay="400ms"><i class="fas fa-headset"></i><h3>Training &amp; Support</h3><p>Staff training, change management and continuous operational support.</p></article>
            </div>
          </div>
        </section>

        <section class="hosmed-about__philosophy section-space">
          <div class="container">
            <div class="hosmed-about__philosophy-card wow fadeInUp" data-wow-duration="1300ms">
              <div>
                <p class="hosmed-about__eyebrow">Our Philosophy</p>
                <h2>Healthcare First. Technology With Purpose. Quality By Design.</h2>
              </div>
              <p>We believe the best hospitals are created when clinical expertise, engineering, management, compliance and technology work together.</p>
            </div>
          </div>
        </section>

        <section class="hosmed-about__cta">
          <div class="container">
            <div class="hosmed-about__cta-inner wow fadeInUp" data-wow-duration="1200ms">
              <div><h2>Planning a New Hospital or Transforming an Existing One?</h2><p>Talk to our healthcare experts and move forward with confidence.</p></div>
              <a href="/contact" class="heartox-btn heartox-btn--secondary">Talk to Our Experts <i class="fas fa-arrow-right"></i></a>
              <span class="hosmed-about__cta-visual" aria-hidden="true"><i class="fas fa-stethoscope"></i></span>
            </div>
          </div>
        </section>
      </main>`;

      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        aboutPage
      );
    }

    if (routeName === 'contact') {
      const contactPage = `<main class="hosmed-contact">
        <section class="hosmed-contact__hero">
          <div class="container">
            <div class="hosmed-contact__hero-copy">
              <p class="hosmed-contact__eyebrow wow fadeInDown" data-wow-duration="1000ms">Contact</p>
              <h1 class="wow fadeInUp" data-wow-duration="1200ms">Let’s Build the Future of Healthcare.</h1>
              <span class="hosmed-contact__accent"></span>
              <p class="wow fadeInUp" data-wow-delay="150ms">Whether you are planning, expanding, accrediting or digitising a hospital, our healthcare experts are ready to help you move forward with clarity.</p>
              <a href="#consultation" class="heartox-btn heartox-btn--secondary wow fadeInUp" data-wow-delay="250ms">Book a Consultation <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </section>

        <section class="hosmed-contact__needs section-space">
          <div class="container">
            <div class="hosmed-contact__heading wow fadeInUp">
              <p class="hosmed-contact__eyebrow">How Can We Help?</p>
              <h2>Tell Us Where You Are in Your Hospital Journey.</h2>
            </div>
            <div class="hosmed-contact__needs-grid">
              <article class="wow fadeInUp" data-wow-delay="0ms"><i class="fas fa-hospital"></i><h3>Planning a New Hospital?</h3><span>01</span></article>
              <article class="wow fadeInUp" data-wow-delay="80ms"><i class="fas fa-expand-arrows-alt"></i><h3>Expanding an Existing Hospital?</h3><span>02</span></article>
              <article class="wow fadeInUp" data-wow-delay="160ms"><i class="fas fa-award"></i><h3>Preparing for NABH/NABL?</h3><span>03</span></article>
              <article class="wow fadeInUp" data-wow-delay="240ms"><i class="fas fa-laptop-medical"></i><h3>Looking for Hospital Software?</h3><span>04</span></article>
              <article class="wow fadeInUp" data-wow-delay="320ms"><i class="fas fa-brain"></i><h3>Want to Bring AI Into Your Hospital?</h3><span>05</span></article>
            </div>
          </div>
        </section>

        <section class="hosmed-contact__consultation section-space" id="consultation">
          <div class="container">
            <div class="hosmed-contact__consultation-grid">
              <div class="hosmed-contact__intro wow fadeInLeft" data-wow-duration="1200ms">
                <p class="hosmed-contact__eyebrow">Let’s Talk.</p>
                <h2>Start a Conversation With Our Healthcare Experts.</h2>
                <p>Share your hospital requirements with us. Our team will understand your priorities and connect you with the right planning, compliance or technology experts.</p>
                <div class="hosmed-contact__channel"><i class="fas fa-envelope"></i><div><span>Email Us</span><a href="mailto:hello@hosmedai.com">hello@hosmedai.com</a></div></div>
                <div class="hosmed-contact__channel"><i class="fas fa-comments"></i><div><span>Consultation</span><strong>Hospital Planning &amp; Digital Healthcare</strong></div></div>
              </div>
              <form class="hosmed-contact__form wow fadeInRight" data-wow-duration="1200ms" action="#">
                <div class="hosmed-contact__form-grid">
                  <label><span>Your Name</span><input type="text" name="name" placeholder="Enter your name" autocomplete="name" required></label>
                  <label><span>Hospital / Organisation</span><input type="text" name="organisation" placeholder="Organisation name" autocomplete="organization" required></label>
                  <label><span>Phone Number</span><input type="tel" name="phone" placeholder="Enter phone number" autocomplete="tel" required></label>
                  <label><span>Email Address</span><input type="email" name="email" placeholder="Enter email address" autocomplete="email" required></label>
                  <label class="hosmed-contact__form-full"><span>How Can We Help?</span><select name="requirement" required><option value="">Select your requirement</option><option>New Hospital Planning</option><option>Hospital Expansion</option><option>NABH / NABL Accreditation</option><option>Hospital Software</option><option>AI Healthcare Solutions</option><option>Other</option></select></label>
                  <label class="hosmed-contact__form-full"><span>Tell Us About Your Project</span><textarea name="message" rows="4" placeholder="Share your requirements"></textarea></label>
                </div>
                <button type="submit" class="heartox-btn heartox-btn--secondary">Book a Consultation <i class="fas fa-arrow-right"></i></button>
              </form>
            </div>
          </div>
        </section>

        <section class="hosmed-contact__brand">
          <div class="container">
            <div class="hosmed-contact__brand-inner wow fadeInUp" data-wow-duration="1200ms">
              <div><p>HosmedAI</p><h2>Complete Hospital Solutions</h2><span>Plan. Build. Comply. Digitise. Grow.</span></div>
              <a href="#consultation" class="heartox-btn heartox-btn--secondary">Book a Consultation</a>
            </div>
          </div>
        </section>
      </main>`;

      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, contactPage);
    }

    if (routeName === 'index' || routeName === 'about') {
      const faqSection = `<section class="hosmed-faq section-space">
        <div class="container">
          <div class="hosmed-faq__inner">
            <div class="hosmed-faq__heading wow fadeInUp" data-wow-duration="1000ms">
              <p>FAQ</p>
              <h2>Frequently Asked Questions</h2>
            </div>
            <div class="hosmed-faq__list wow fadeInUp" data-wow-duration="1200ms" data-wow-delay="100ms">
              <details class="hosmed-faq__item"><summary><span>How does HosmedAI support a hospital from planning to operations?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>HosmedAI works as one integrated healthcare partner across feasibility, clinical planning, architecture, equipment, accreditation, hospital software and operational support.</p></div></details>
              <details class="hosmed-faq__item"><summary><span>Can HosmedAI help us plan a new hospital from the concept stage?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>Yes. We support feasibility studies, service planning, departmental planning, clinical workflows, architecture coordination, infrastructure and equipment planning from concept through commissioning.</p></div></details>
              <details class="hosmed-faq__item"><summary><span>Do you provide NABH and NABL accreditation consultancy?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>Yes. Our team supports gap assessment, SOP development, quality systems, documentation, staff training, internal audits and accreditation readiness for NABH and NABL.</p></div></details>
              <details class="hosmed-faq__item"><summary><span>Can HosmedAI digitise an existing hospital?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>Yes. We help hospitals implement connected ERP, HIS, EMR, billing, pharmacy, laboratory, radiology, inventory, finance, analytics and AI-enabled workflows.</p></div></details>
              <details class="hosmed-faq__item"><summary><span>Does HosmedAI work with small hospitals as well as large healthcare groups?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>Yes. Our solutions are tailored for clinics, diagnostic centres, small and mid-sized hospitals, medical colleges, specialty hospitals and multi-location healthcare groups.</p></div></details>
              <details class="hosmed-faq__item"><summary><span>Can we engage HosmedAI for only one specific service?</span><i class="fas fa-plus"></i></summary><div class="hosmed-faq__answer"><p>Yes. You can engage us for a focused requirement or use HosmedAI as an end-to-end partner across the complete hospital development and operations journey.</p></div></details>
            </div>
          </div>
        </div>
      </section>`;

      html = html.replace(/(?=<footer class=)/, faqSection);
    }

    const sharedFooter = `<footer class="hosmed-footer">
      <div class="hosmed-footer__decor hosmed-footer__decor--one"></div>
      <div class="hosmed-footer__decor hosmed-footer__decor--two"></div>
      <div class="container">
        <div class="hosmed-footer__top">
          <div class="hosmed-footer__brand">
            <a href="/" class="hosmed-footer__logo" aria-label="HosmedAI Home"><img src="/assets/images/hosmed-mark.png" alt=""><span><strong>Hosmed<span>AI</span></strong><small>Smarter Hospitals. Better Care.</small></span></a>
            <p>We partner with healthcare organisations to design, build and operate smarter hospitals through integrated solutions.</p>
            <div class="hosmed-footer__social"><a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a><a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a><a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a><a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a><a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a></div>
          </div>
          <nav class="hosmed-footer__column" aria-label="Footer links"><h3>Links</h3><ul><li><a href="/">Home</a></li><li><a href="/about">About Us</a></li><li><a href="/hospital-planning">Hospital Planning</a></li><li><a href="/nabh-nabl">NABH / NABL</a></li><li><a href="/hospital-software">Hospital Software</a></li><li><a href="/ai-healthcare">AI Healthcare</a></li><li><a href="/services">Solutions</a></li><li><a href="/who-we-serve">Who We Serve</a></li><li><a href="/portfolio">Projects</a></li><li><a href="/contact">Contact</a></li></ul></nav>
          <nav class="hosmed-footer__column" aria-label="Explore"><h3>Explore</h3><ul><li><a href="/hospital-planning">Planning &amp; Design</a></li><li><a href="/nabh-nabl">Quality &amp; Accreditation</a></li><li><a href="/hospital-software">Hospital Technology</a></li><li><a href="/ai-healthcare">Healthcare AI</a></li><li><a href="/portfolio">Our Projects</a></li><li><a href="/contact">Book a Consultation</a></li></ul></nav>
          <div class="hosmed-footer__contact"><h3>Contact</h3><div><i class="fas fa-phone-alt"></i><p><a href="tel:+9138008060">+91 3800 8060</a><a href="tel:+9195550114">+91 9555 0114</a></p></div><div><i class="fas fa-envelope"></i><p><a href="mailto:hello@hosmedai.com">hello@hosmedai.com</a><a href="https://hosmedai.vercel.app">hosmedai.vercel.app</a></p></div><div><i class="fas fa-map-marker-alt"></i><p><span>Healthcare Solutions</span><span>India</span></p></div></div>
        </div>
        <div class="hosmed-footer__subscribe">
          <div class="hosmed-footer__subscribe-icon"><i class="far fa-envelope"></i></div>
          <div><h3>Subscribe to Get Our <span>Important Updates</span></h3><p>Stay updated with our latest news, insights and healthcare solutions.</p></div>
          <form action="#"><input type="email" aria-label="Email Address" placeholder="Email Address" required><button type="submit" aria-label="Subscribe"><i class="fas fa-paper-plane"></i></button></form>
        </div>
      </div>
      <div class="hosmed-footer__bottom"><div class="container"><p><i class="fas fa-shield-alt"></i> © 2026 HosmedAI. All Rights Reserved.</p><nav><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Cookie Policy</a></nav></div></div>
    </footer>`;

    html = html.replace(/<footer class="[^"]*">[\s\S]*?<\/footer>/, sharedFooter);

    html = html.replace(/\$/g, '₹');
    html = html.replace(/href=(['"])contact\.html\1/gi, 'href="/contact"');

    return html.replace(
      /href=(["'])([a-z0-9-]+)\.html(#[^"']*)?\1/gi,
      (_, quote, name, hash = '') => {
        const path = name === 'index' ? '/' : `/${name}`;
        return `href=${quote}${path}${hash}${quote}`;
      }
    );
  }, [page, routeName]);

  useEffect(() => {
    document.title = routeName === 'about'
      ? 'About HosmedAI | Integrated Hospital Development'
      : routeName === 'contact'
        ? 'Contact HosmedAI | Book a Hospital Consultation'
        : (page.title || 'Hosmed AI');
    document.body.className = page.bodyClass || '';
    let active = true;
    (async () => {
      for (const src of scripts) {
        if (!active) return;
        await loadScript(src);
      }
      if (window.jQuery) {
        window.jQuery('.main-slider-one__carousel').each(function () {
          const slider = window.jQuery(this);
          if (!slider.hasClass('owl-loaded') && slider.owlCarousel) {
            slider.owlCarousel(slider.data('owl-options'));
          }
        });
      }
    })();
    return () => { active = false; };
  }, [page, routeName]);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

createRoot(document.getElementById('root')).render(<App />);
