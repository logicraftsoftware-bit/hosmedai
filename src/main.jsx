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
  const page = useMemo(() => {
    const route = location.pathname.split('/').filter(Boolean).pop() || 'index';
    const requested = route.endsWith('.html') ? route : `${route}.html`;
    return pages[requested] || pages['404.html'] || pages['index.html'];
  }, []);

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

    if (page === pages['about.html']) {
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

    if (page === pages['index.html'] || page === pages['about.html']) {
      const faqSection = `<section class="hosmed-faq section-space">
        <div class="container">
          <div class="hosmed-faq__inner wow fadeInUp" data-wow-duration="1200ms">
            <div class="hosmed-faq__heading">
              <p>Frequently Asked Question</p>
              <h2>How does HosmedAI support a hospital from planning to operations?</h2>
            </div>
            <details class="hosmed-faq__item">
              <summary><span>View Answer</span><i class="fas fa-plus"></i></summary>
              <div class="hosmed-faq__answer">
                <p>HosmedAI works as one integrated healthcare partner across the complete hospital journey—from feasibility, clinical planning, architecture and equipment planning to NABH/NABL readiness, hospital software, AI-enabled workflows and operational support. This coordinated approach reduces complexity, improves decision-making and keeps every stage aligned with quality healthcare outcomes.</p>
              </div>
            </details>
          </div>
        </div>
      </section>`;

      html = html.replace(/(?=<footer class=)/, faqSection);
    }

    html = html.replace(/\$/g, '₹');

    return html.replace(
      /href=(["'])([a-z0-9-]+)\.html(#[^"']*)?\1/gi,
      (_, quote, name, hash = '') => {
        const path = name === 'index' ? '/' : `/${name}`;
        return `href=${quote}${path}${hash}${quote}`;
      }
    );
  }, [page]);

  useEffect(() => {
    document.title = page === pages['about.html']
      ? 'About HosmedAI | Integrated Hospital Development'
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
  }, [page]);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

createRoot(document.getElementById('root')).render(<App />);
