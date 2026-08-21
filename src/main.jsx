import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import pages from './pages.generated.js';
import AdminApp from './AdminApp.jsx';

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
    if (routeName === 'projects' || routeName === 'portfolio') return pages['about.html'];
    if (routeName === 'services') return pages['about.html'];
    if (routeName === 'why-hosmedai') return pages['about.html'];
    if (routeName === 'ai-healthcare') return pages['about.html'];
    if (routeName === 'hospital-software') return pages['about.html'];
    if (routeName === 'nabh-nabl') return pages['about.html'];
    if (routeName === 'hospital-planning') return pages['about.html'];
    return pages[requested] || pages['404.html'] || pages['index.html'];
  }, [routeName]);

  const markup = useMemo(() => {
    let html = page.html;

    const navItem = (name, href, label, icon, aliases = []) => {
      const active = [name, ...aliases].includes(routeName);
      return `<li${active ? ' class="current"' : ''}><a href="${href}"${active ? ' aria-current="page"' : ''}><i class="${icon}" aria-hidden="true"></i><span>${label}</span></a></li>`;
    };
    const primaryNavigation = `<ul class="main-menu__list hosmed-navigation">
      ${navItem('index', '/', 'Home', 'fas fa-home')}
      ${navItem('why-hosmedai', '/why-hosmedai', 'Why HosmedAI', 'fas fa-shield-alt')}
      ${navItem('about', '/about', 'About', 'fas fa-hospital-user')}
      ${navItem('hospital-planning', '/hospital-planning', 'Hospital Planning', 'fas fa-drafting-compass')}
      ${navItem('nabh-nabl', '/nabh-nabl', 'NABH / NABL', 'fas fa-award')}
      ${navItem('hospital-software', '/hospital-software', 'Hospital Software', 'fas fa-laptop-medical')}
      ${navItem('ai-healthcare', '/ai-healthcare', 'AI Healthcare', 'fas fa-brain')}
      ${navItem('services', '/services', 'Solutions', 'fas fa-th-large')}
      ${navItem('who-we-serve', '/who-we-serve', 'Who We Serve', 'fas fa-users')}
      ${navItem('projects', '/projects', 'Projects', 'fas fa-briefcase-medical', ['portfolio'])}
      ${navItem('contact', '/contact', 'Contact', 'fas fa-envelope')}
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
        .replace("Send a Gift for <br> Children's", "Send a Gift for <br> Doctor's")
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

    if (routeName === 'projects' || routeName === 'portfolio') {
      const projectCards = [
        ['150 Beds', '/assets/images/backgrounds/slider-1-1.jpg', 'Hospital Planning & Digital Transformation', '150-Bed Multi-Specialty Hospital', 'Pune, Maharashtra', 'Planning • Clinical Design • Compliance • Technology'],
        ['300 Beds', '/assets/images/backgrounds/slider-1-2.jpg', 'Integrated Hospital Development', '300-Bed Super Specialty Hospital', 'Hyderabad, Telangana', 'Feasibility • Architecture • Equipment • Technology'],
        ['100 Beds', '/assets/images/backgrounds/slider-1-3.jpg', 'Healthcare Technology Integration', '100-Bed Women & Child Hospital', 'Bengaluru, Karnataka', 'HIS • Operations • Quality • AI Workflows'],
        ['250 Beds', '/assets/images/about/about-2-1.jpg', 'Hospital Expansion & Accreditation', '250-Bed Multi-Specialty Hospital', 'Ahmedabad, Gujarat', 'Expansion • NABH • SOPs • Staff Training'],
        ['500 Beds', '/assets/images/backgrounds/slider-4-1.jpg', 'Smart Hospital Transformation', '500-Bed Tertiary Care Hospital', 'New Delhi', 'Digital Design • EMR • Analytics • Compliance'],
        ['75 Beds', '/assets/images/about/about-4-1.jpg', 'Purpose-Built Community Healthcare', '75-Bed Community Hospital', 'Indore, Madhya Pradesh', 'Planning • Infrastructure • Operations • Support']
      ].map(([beds, image, label, title, location, services], index) => `<article class="hosmed-projects__card wow fadeInUp" data-wow-delay="${index * 70}ms">
          <div class="hosmed-projects__image"><img src="${image}" alt="${title}"><span>${beds}</span></div>
          <div class="hosmed-projects__card-body"><p>${label}</p><h3>${title}</h3><div class="hosmed-projects__meta"><span><i class="fas fa-map-marker-alt"></i>${location}</span></div><p class="hosmed-projects__services">${services}</p><a href="/contact">View Case Study <i class="fas fa-arrow-right"></i></a></div>
        </article>`).join('');

      const projectsPage = `<main class="hosmed-projects">
        <section class="hosmed-projects__hero">
          <div class="container hosmed-projects__hero-grid">
            <div class="hosmed-projects__hero-copy">
              <p class="hosmed-projects__eyebrow wow fadeInDown">Projects / Case Studies</p>
              <h1 class="wow fadeInUp">From Vision to Reality.<br>Healthcare Projects. Designed With Purpose.</h1>
              <span class="hosmed-projects__accent"></span>
              <p class="wow fadeInUp" data-wow-delay="120ms">We partner with healthcare organisations to plan, build and transform hospitals that deliver better care and better outcomes.</p>
            </div>
            <div class="hosmed-projects__impact wow fadeInRight" data-wow-duration="1200ms">
              <div><i class="fas fa-hospital"></i><p><strong>200+</strong><span>Projects Completed</span></p></div>
              <div><i class="fas fa-history"></i><p><strong>25+</strong><span>Cities Served</span></p></div>
              <div><i class="fas fa-ruler-combined"></i><p><strong>50M+</strong><span>Sq. Ft. Planned</span></p></div>
              <div><i class="fas fa-check-circle"></i><p><strong>100%</strong><span>Client Satisfaction</span></p></div>
            </div>
          </div>
        </section>

        <section class="hosmed-projects__showcase section-space">
          <div class="container">
            <div class="hosmed-projects__filters wow fadeInUp" aria-label="Project categories"><button class="active">All Projects</button><button>Hospital Planning</button><button>Compliance</button><button>Digital Transformation</button><button>Hospital Design</button><button>Technology</button><span>All Locations <i class="fas fa-chevron-down"></i></span></div>
            <div class="hosmed-projects__grid">${projectCards}</div>
          </div>
        </section>

        <section class="hosmed-projects__promise">
          <div class="container"><div class="hosmed-projects__promise-inner wow fadeInUp">
            <div><p class="hosmed-projects__eyebrow">Why Choose HosmedAI?</p><h2>Every Project Has a Story.</h2></div>
            <div><i class="fas fa-hospital-user"></i><h3>Integrated Approach</h3><p>Planning, compliance, technology and operations—all in one place.</p></div>
            <div><i class="fas fa-clipboard-check"></i><h3>Experienced Team</h3><p>Healthcare experts, architects, engineers and IT professionals.</p></div>
            <div><i class="fas fa-award"></i><h3>Quality by Design</h3><p>Built around safety, compliance and operational excellence.</p></div>
            <div><i class="fas fa-headset"></i><h3>End-to-End Support</h3><p>From concept to commissioning and beyond.</p></div>
          </div></div>
        </section>

        <section class="hosmed-projects__cta"><div class="container"><div class="hosmed-projects__cta-inner wow fadeInUp"><div><h2>Have a Project in Mind?</h2><p>Let's build the future of healthcare together. Plan better, build smarter &amp; deliver impact.</p></div><a href="/contact" class="heartox-btn">View Our Projects <i class="fas fa-arrow-right"></i></a><i class="fas fa-stethoscope" aria-hidden="true"></i></div></div></section>
      </main>`;

      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, projectsPage);
    }

    if (routeName === 'services') {
      const solutions = [
        ['STARTING A HOSPITAL?', 'fas fa-hospital', 'Hospital Planning & Design', 'Feasibility studies, architectural master planning, clinical layouts, equipment planning and functional design.'],
        ['BUILDING A HOSPITAL?', 'fas fa-users-cog', 'Project & Clinical Consultancy', 'End-to-end project management, clinical workflow planning, vendor coordination and quality assurance.'],
        ['SEEKING ACCREDITATION?', 'fas fa-award', 'NABH / NABL Consultancy', 'Complete support for NABH, NABL accreditation, documentation, training and compliance readiness.'],
        ['RUNNING A HOSPITAL?', 'fas fa-cogs', 'Hospital Management Solutions', 'Operations management, HR, finance, supply chain, patient experience and performance improvement.'],
        ['DIGITISING YOUR HOSPITAL?', 'fas fa-desktop', 'Hospital ERP / HIS', 'Integrated Hospital Information Systems, EMR, billing, inventory, pharmacy and reporting.'],
        ['WANT SMARTER OPERATIONS?', 'fas fa-brain', 'AI & Healthcare Analytics', 'AI-powered insights, predictive analytics, dashboards and decision support for better outcomes.']
      ].map(([eyebrow, icon, title, copy], index) => `<article class="hosmed-solutions__card wow fadeInUp" data-wow-delay="${index * 80}ms"><div class="hosmed-solutions__icon"><i class="${icon}"></i></div><p>${eyebrow}</p><h3>${title}</h3><span></span><div>${copy}</div><a href="/contact">Learn More <i class="fas fa-arrow-right"></i></a></article>`).join('');

      const solutionsPage = `<main class="hosmed-solutions">
        <section class="hosmed-solutions__hero"><div class="container"><div class="hosmed-solutions__hero-copy"><p class="hosmed-solutions__eyebrow wow fadeInDown">Our Solutions</p><h1 class="wow fadeInUp">Solutions for Every Stage of Your Healthcare Journey.</h1><span></span><p class="wow fadeInUp" data-wow-delay="120ms">From planning to operations, our complete end-to-end solutions help you build smarter, compliant and future-ready hospitals.</p></div></div></section>
        <section class="hosmed-solutions__content section-space"><div class="container"><div class="hosmed-solutions__grid">${solutions}</div>
          <div class="hosmed-solutions__stats wow fadeInUp"><div><i class="fas fa-hospital"></i><p><strong>200+</strong><span>Projects Completed</span></p></div><div><i class="fas fa-map-marker-alt"></i><p><strong>25+</strong><span>Cities Served</span></p></div><div><i class="fas fa-users-cog"></i><p><strong>50M+</strong><span>Sq. Ft. Planned</span></p></div><div><i class="fas fa-award"></i><p><strong>100%</strong><span>Client Satisfaction</span></p></div></div>
          <div class="hosmed-solutions__cta wow fadeInUp"><div><h2>Need a Custom Solution for Your Hospital?</h2><p>Let's discuss how we can help you build a smarter, more efficient and future-ready healthcare facility.</p></div><a href="/contact" class="heartox-btn">Talk to Our Experts <i class="fas fa-arrow-right"></i></a><i class="fas fa-stethoscope" aria-hidden="true"></i></div>
        </div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, solutionsPage);
    }

    if (routeName === 'why-hosmedai') {
      const reasons = [
        ['01', 'fas fa-route', 'End-to-End Expertise', 'From hospital concept to digital operations.'],
        ['02', 'fas fa-heartbeat', 'Healthcare-Focused', 'Solutions designed specifically around healthcare workflows.'],
        ['03', 'fas fa-puzzle-piece', 'Integrated Approach', 'Planning, compliance and technology designed to work together.'],
        ['04', 'fas fa-microchip', 'Technology Driven', 'Modern hospital management powered by cloud technology and AI.'],
        ['05', 'fas fa-chart-line', 'Scalable', 'Designed for clinics, nursing homes, diagnostic centres and multi-specialty hospitals.'],
        ['06', 'fas fa-handshake', 'Long-Term Partnership', 'We do not disappear after implementation. We help you build and evolve.']
      ].map(([number, icon, title, copy], index) => `<article class="hosmed-why__reason hosmed-why__reason--${index % 2 ? 'right' : 'left'} wow fadeIn${index % 2 ? 'Right' : 'Left'}" data-wow-delay="${index * 70}ms"><b>${number}</b><div class="hosmed-why__reason-icon"><i class="${icon}"></i></div><div><h3>${title}</h3><span></span><p>${copy}</p></div></article>`).join('');
      const whyPage = `<main class="hosmed-why">
        <section class="hosmed-why__hero"><div class="container"><div class="hosmed-why__hero-copy"><p class="wow fadeInDown">WHY HOSMEDAI</p><h1 class="wow fadeInUp">Why Choose HosmedAI?</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">One Ecosystem. Multiple Capabilities.</h2><p class="wow fadeInUp" data-wow-delay="150ms">We bring together healthcare expertise, management consulting and technology to deliver better hospitals and better outcomes.</p></div></div></section>
        <section class="hosmed-why__reasons section-space"><div class="container"><div class="hosmed-why__reasons-grid">${reasons}<span class="hosmed-why__timeline" aria-hidden="true"></span></div></div></section>
        <section class="hosmed-why__advantage"><div class="container"><div class="hosmed-why__advantage-inner wow fadeInUp"><h2>The Hosmed<span>AI</span> Advantage</h2><div class="hosmed-why__advantage-grid"><div><i class="fas fa-users-cog"></i><h3>Healthcare Experts</h3><p>Deep domain knowledge that drives better decisions.</p></div><div><i class="fas fa-lightbulb"></i><h3>Innovative Solutions</h3><p>Using the latest technology to create future-ready hospitals.</p></div><div><i class="fas fa-shield-alt"></i><h3>Trusted Partner</h3><p>Transparency, commitment and reliability in everything we do.</p></div><div><i class="fas fa-bullseye"></i><h3>Better Outcomes</h3><p>Efficient operations and better patient care.</p></div></div></div></div></section>
        <section class="hosmed-why__cta"><div class="container"><div class="hosmed-why__cta-inner wow fadeInUp"><div><h2>Ready to Build a Smarter Hospital?</h2><p>Let's work together to design, build and manage hospitals that make a real difference.</p></div><a href="/contact" class="heartox-btn">Talk to Our Experts <i class="fas fa-arrow-right"></i></a></div></div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, whyPage);
    }

    if (routeName === 'ai-healthcare') {
      const aiCapabilities = [
        ['fas fa-tachometer-alt', 'Management Dashboards', 'Real-time overview of key hospital metrics in one intelligent dashboard.'],
        ['fas fa-chart-pie', 'Operational Analytics', 'Deep insights into daily operations to improve efficiency and outcomes.'],
        ['fas fa-chart-line', 'Predictive Insights', 'AI models predict trends and help you stay ahead of challenges.'],
        ['fas fa-file-medical-alt', 'Automated Reporting', 'Reduce manual work with smart, automated and accurate reports.'],
        ['fas fa-project-diagram', 'Workflow Optimisation', 'Identify bottlenecks and optimise processes across departments.'],
        ['fas fa-rupee-sign', 'Revenue Intelligence', 'Track performance, detect opportunities and improve financial outcomes.'],
        ['fas fa-users-cog', 'Resource Utilisation', 'Optimise the use of beds, staff, OT, equipment and other resources.'],
        ['fas fa-procedures', 'Patient-Flow Analytics', 'Monitor patient journeys and improve flow from admission to discharge.'],
        ['fas fa-shield-alt', 'Quality Monitoring', 'Track quality indicators and ensure compliance with standards.'],
        ['fas fa-brain', 'Decision-Support Tools', 'AI-driven recommendations to support smarter clinical and operational decisions.']
      ].map(([icon, title, copy], index) => `<article class="hosmed-ai__card wow fadeInUp" data-wow-delay="${index * 60}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><p>${copy}</p></article>`).join('');
      const aiPage = `<main class="hosmed-ai">
        <section class="hosmed-ai__hero"><div class="container"><div class="hosmed-ai__hero-copy"><p class="wow fadeInDown">AI FOR HEALTHCARE</p><h1 class="wow fadeInUp">Intelligence Behind<br>Every Hospital Decision.</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">The Future of Hospital Management Is Intelligent.</h2><p class="wow fadeInUp" data-wow-delay="140ms">HosmedAI combines hospital data, workflows and artificial intelligence to help healthcare organisations operate more efficiently.</p><a href="#ai-possibilities" class="heartox-btn wow fadeInUp" data-wow-delay="220ms">Explore HosmedAI <i class="fas fa-arrow-right"></i></a></div></div></section>
        <section class="hosmed-ai__possibilities section-space" id="ai-possibilities"><div class="container"><div class="hosmed-ai__heading wow fadeInUp"><h2><span>AI</span>-Powered Possibilities</h2><i></i></div><div class="hosmed-ai__grid">${aiCapabilities}</div></div></section>
        <section class="hosmed-ai__decisions"><div class="container"><div class="hosmed-ai__decisions-inner wow fadeInUp"><div class="hosmed-ai__decisions-copy"><h2>From <span>Data</span> to Decisions.</h2><p>Your hospital generates thousands of data points every day.</p><i></i><p>HosmedAI helps transform that data into meaningful intelligence.</p><a href="/contact" class="heartox-btn">Explore HosmedAI <i class="fas fa-arrow-right"></i></a></div><div class="hosmed-ai__visual" aria-label="AI healthcare intelligence visual"><img src="/assets/images/ai-bg.png" alt="HosmedAI connected healthcare intelligence"></div></div></div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, aiPage);
    }

    if (routeName === 'hospital-software') {
      const softwareModules = [
        ['fas fa-user-injured', 'Patient Management', ['Registration', 'Appointment', 'OPD', 'IPD', 'Emergency', 'Discharge']],
        ['fas fa-stethoscope', 'Clinical', ['EMR', 'Doctor Dashboard', 'Nursing', 'OT Management', 'ICU', 'Clinical Documentation']],
        ['fas fa-flask', 'Diagnostics', ['Laboratory', 'Radiology', 'PACS Integration', 'Pathology', 'Reporting']],
        ['fas fa-cogs', 'Hospital Operations', ['Pharmacy', 'Inventory', 'Purchase', 'Stores', 'Biomedical Equipment', 'Housekeeping']],
        ['fas fa-chart-bar', 'Business', ['Billing', 'Insurance', 'TPA', 'Finance', 'HR & Payroll', 'MIS']]
      ].map(([icon, title, items], index) => `<article class="hosmed-software__module wow fadeInUp" data-wow-delay="${index * 80}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><i></i><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></article>`).join('');
      const softwarePage = `<main class="hosmed-software">
        <section class="hosmed-software__hero"><div class="container"><div class="hosmed-software__hero-copy"><p class="wow fadeInDown">HOSPITAL SOFTWARE</p><h1 class="wow fadeInUp">Your Hospital.<br>One Intelligent <span>Digital Ecosystem.</span></h1><h2 class="wow fadeInUp" data-wow-delay="80ms">Replace Fragmented Systems With One Connected Platform.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">HosmedAI Hospital Software is designed to connect the critical functions of a modern hospital through a single digital ecosystem.</p><a href="#software-demo" class="heartox-btn wow fadeInUp" data-wow-delay="220ms">Request a Software Demo <i class="fas fa-arrow-right"></i></a></div><div class="hosmed-software__dashboard wow fadeInRight" data-wow-duration="1300ms"><div class="hosmed-software__screen"><div><b>Hosmed<span>AI</span></b><small>Hospital Command Centre</small></div><section><p><span>Patients</span><strong>1,248</strong></p><p><span>Occupancy</span><strong>87%</strong></p><p><span>Revenue</span><strong>2.45M</strong></p></section><i class="fas fa-chart-line"></i></div><div class="hosmed-software__phone"><i class="fas fa-heartbeat"></i><b>HosmedAI</b><span>Connected Care</span></div></div></div></section>
        <section class="hosmed-software__modules section-space"><div class="container"><div class="hosmed-software__heading wow fadeInUp"><h2>Core <span>Modules</span></h2><i></i></div><div class="hosmed-software__module-grid">${softwareModules}</div></div></section>
        <section class="hosmed-software__ai"><div class="container"><div class="hosmed-software__ai-inner wow fadeInUp"><div><p>And Then Comes</p><h2>AI<span>.</span></h2><i></i><p>HosmedAI is designed to bring Artificial Intelligence into hospital operations, helping organisations turn healthcare data into actionable intelligence.</p><div class="hosmed-software__flow"><span><i class="fas fa-database"></i>Data</span><b>→</b><span><i class="fas fa-brain"></i>Intelligence</span><b>→</b><span><i class="fas fa-bullseye"></i>Better Decisions</span></div></div><img src="/assets/images/ai-bg.png" alt="Artificial intelligence connecting hospital operations"></div></div></section>
        <section class="hosmed-software__truth"><div class="container"><div class="hosmed-software__truth-inner wow fadeInUp"><div><i class="fas fa-hospital-alt"></i><h2>One Hospital.<br>One Platform.<br><span>One Source of Truth.</span></h2></div><div><span><i class="fas fa-link"></i><b>Integrated Data</b></span><span><i class="fas fa-eye"></i><b>Real-time Visibility</b></span><span><i class="fas fa-check-circle"></i><b>Better Outcomes</b></span><span><i class="fas fa-cogs"></i><b>Smarter Operations</b></span></div></div></div></section>
        <section class="hosmed-software__cta" id="software-demo"><div class="container"><div class="hosmed-software__cta-inner wow fadeInUp"><i class="fas fa-headset"></i><div><h2>Ready to Transform Your Hospital?</h2><p>See how HosmedAI Hospital Software can streamline operations, improve efficiency and deliver better patient care.</p></div><a href="/contact" class="heartox-btn">Request a Software Demo <i class="fas fa-arrow-right"></i></a></div></div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, softwarePage);
    }

    if (routeName === 'nabh-nabl') {
      const nabhJourney = [['fas fa-clipboard-check','Assessment'],['fas fa-file-alt','Documentation'],['fas fa-cogs','Implementation'],['fas fa-chalkboard-teacher','Training'],['fas fa-tasks','Internal Audit'],['fas fa-shield-alt','Readiness'],['fas fa-award','Accreditation']].map(([icon, label], index) => `<div class="wow fadeInUp" data-wow-delay="${index * 70}ms"><span><i class="${icon}"></i></span><b>${label}</b>${index < 6 ? '<em>→</em>' : ''}</div>`).join('');
      const nablItems = [['fas fa-shield-alt','Quality management systems'],['fas fa-file-alt','Documentation'],['fas fa-book-open','SOPs'],['fas fa-cogs','Process standardisation'],['fas fa-chart-line','Quality indicators'],['fas fa-search','Internal audits'],['fas fa-users','Staff training'],['fas fa-vials','Laboratory workflow'],['fas fa-medal','Accreditation readiness']].map(([icon,label], index) => `<div class="wow fadeInUp" data-wow-delay="${index * 50}ms"><i class="${icon}"></i><span>${label}</span></div>`).join('');
      const ecosystem = [['N','NABH'],['fas fa-certificate','NABL'],['fas fa-shield-alt','Quality'],['fas fa-users-cog','Patient Safety'],['fas fa-hand-sparkles','Infection Control'],['fas fa-book-open','SOPs'],['fas fa-file-alt','Documentation'],['fas fa-chalkboard-teacher','Training'],['fas fa-search','Audit']].map(([icon,label]) => `<div><span>${icon.length === 1 ? icon : `<i class="${icon}"></i>`}</span><b>${label}</b></div>`).join('');
      const accreditationPage = `<main class="hosmed-accreditation">
        <section class="hosmed-accreditation__hero"><div class="container"><div class="hosmed-accreditation__hero-copy"><p class="wow fadeInDown">NABH / NABL &amp; COMPLIANCE</p><h1 class="wow fadeInUp">Accreditation Is More<br>Than a Certificate.</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">It’s a Culture of Quality.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">HosmedAI helps hospitals and diagnostic laboratories build systems that are quality-driven, patient-centric and accreditation-ready.</p></div></div></section>
        <section class="hosmed-accreditation__content"><div class="container"><article class="hosmed-accreditation__panel hosmed-accreditation__nabh wow fadeInUp"><div class="hosmed-accreditation__panel-icon"><i class="fas fa-hospital-alt"></i></div><div class="hosmed-accreditation__panel-content"><h2><span>NABH</span> CONSULTANCY</h2><p>We support hospitals through the journey of:</p><div class="hosmed-accreditation__journey">${nabhJourney}</div></div></article>
          <article class="hosmed-accreditation__panel hosmed-accreditation__nabl wow fadeInUp"><div class="hosmed-accreditation__panel-icon"><i class="fas fa-microscope"></i></div><div class="hosmed-accreditation__panel-content"><h2><span>NABL</span> CONSULTANCY</h2><p>For diagnostic laboratories, we help establish robust systems covering:</p><div class="hosmed-accreditation__nabl-grid">${nablItems}</div></div></article>
          <section class="hosmed-accreditation__ecosystem wow fadeInUp"><h2>Our Compliance <span>Ecosystem</span></h2><div>${ecosystem}</div></section>
          <section class="hosmed-accreditation__cta wow fadeInUp"><div><h2>Don’t Prepare for Accreditation<br>at the Last Minute.</h2><p>Build Accreditation Into Your Hospital<br>From Day One.</p><i></i></div><a href="/contact" class="heartox-btn">Talk to Our Accreditation Team <i class="fas fa-arrow-right"></i></a></section>
        </div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, accreditationPage);
    }

    if (routeName === 'hospital-planning') {
      const planningServices = [
        ['fas fa-file-medical-alt','Hospital feasibility studies','Evaluate opportunities, risks and viability to ensure the right start.'],['fas fa-chart-line','Business & project planning','Comprehensive business models and project roadmaps for success.'],['fas fa-bed','Bed-capacity planning','Optimal bed mix and capacity planning for current and future demand.'],['fas fa-stethoscope','Clinical department planning','Designing efficient, connected clinical departments.'],['fas fa-hospital','Hospital master planning','Strategic master plans that align growth, infrastructure and vision.'],['fas fa-ruler-combined','Architectural planning','Functional, aesthetic and sustainable architectural designs.'],
        ['fas fa-project-diagram','Functional & workflow planning','Smart workflows that improve efficiency and patient experience.'],['fas fa-procedures','OT & ICU planning','Specialized planning for OT suites, ICU and critical care areas.'],['fas fa-ambulance','Emergency department planning','Designing high-performance EDs for faster care and better outcomes.'],['fas fa-user-md','OPD planning','Patient-friendly OPD layouts that reduce wait times and crowding.'],['fas fa-microscope','Diagnostic department planning','Efficient layouts for labs, radiology and advanced diagnostics.'],['fas fa-clipboard-list','Equipment planning','Right equipment, right quantity, right placement.'],
        ['fas fa-fire-extinguisher','Medical gas planning','Safe, compliant and future-ready medical gas systems.'],['fas fa-wind','HVAC & MEP coordination','Integrated HVAC, electrical and MEP for seamless operations.'],['fas fa-shield-alt','Infection-control planning','Spaces and systems designed to minimize infection risks.'],['fas fa-laptop-medical','Biomedical equipment planning','Planning for BMET, maintenance and equipment life-cycle.'],['fas fa-tasks','Project management & commissioning support','End-to-end support from planning to commissioning and handover.']
      ].map(([icon,title,copy], index) => `<article class="hosmed-planning__service wow fadeInUp" data-wow-delay="${(index % 6) * 50}ms"><span><i class="${icon}"></i></span><div><h3>${title}</h3><p>${copy}</p></div></article>`).join('');
      const approach = [['fas fa-comments','Understand','We understand your vision, needs, patient profile and operational goals.'],['fas fa-clipboard-check','Plan','We plan every detail with data, strategy and real-world insight.'],['fas fa-drafting-compass','Design','We design spaces that are functional, safe, sustainable and future-ready.'],['fas fa-chart-line','Optimise','We optimise workflows, resources and systems for maximum efficiency.'],['fas fa-hard-hat','Execute','We support execution, commissioning and a successful launch.']].map(([icon,title,copy], index) => `<div class="wow fadeInUp" data-wow-delay="${index * 80}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><p>${copy}</p>${index < 4 ? '<b>→</b>' : ''}</div>`).join('');
      const planningPage = `<main class="hosmed-planning">
        <section class="hosmed-planning__hero"><div class="container"><div class="hosmed-planning__hero-copy"><p class="wow fadeInDown">HOSPITAL PLANNING &amp; DESIGN</p><i></i><h1 class="wow fadeInUp">Your Hospital<br><span>Starts With<br>the Right Plan.</span></h1><h2 class="wow fadeInUp" data-wow-delay="80ms">Design for Patients. Plan for Efficiency.<br>Build for the Future.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">A successful hospital isn’t simply a beautiful building.<br>It is a carefully engineered healthcare ecosystem where patients, doctors, nurses, technology, equipment and information move efficiently.</p></div></div></section>
        <section class="hosmed-planning__services section-space"><div class="container"><div class="hosmed-planning__heading wow fadeInUp"><i></i><h2>WHAT WE DO</h2><i></i></div><div class="hosmed-planning__services-grid">${planningServices}</div></div></section>
        <section class="hosmed-planning__approach"><div class="container"><div class="hosmed-planning__approach-inner"><div class="hosmed-planning__heading wow fadeInUp"><i></i><h2>OUR APPROACH</h2><i></i></div><div class="hosmed-planning__approach-grid">${approach}</div></div></div></section>
        <section class="hosmed-planning__cta"><div class="container"><div class="hosmed-planning__cta-inner wow fadeInUp"><div><h2>Build a Hospital That Works<br><span>Before You Build the Hospital.</span></h2><i></i><p>The right planning today reduces costs, improves efficiency, ensures compliance and delivers better care for years to come.</p><a href="/contact" class="heartox-btn">Plan My Hospital <i class="fas fa-arrow-right"></i></a></div></div><div class="hosmed-planning__benefits"><div><i class="far fa-heart"></i><p><b>Patient-Centric</b><span>Designed around patient comfort and safety.</span></p></div><div><i class="fas fa-bullseye"></i><p><b>Efficient &amp; Scalable</b><span>Built for efficiency, scalability and growth.</span></p></div><div><i class="fas fa-shield-alt"></i><p><b>Compliant &amp; Safe</b><span>Aligned with NABH, NABL and global standards.</span></p></div><div><i class="fas fa-leaf"></i><p><b>Sustainable Design</b><span>Environment-friendly and future-ready.</span></p></div><div><i class="fas fa-handshake"></i><p><b>End-to-End Support</b><span>From concept to commissioning.</span></p></div></div></div></section>
      </main>`;
      html = html.replace(/<section class="page-header[\s\S]*?(?=<footer class=)/, planningPage);
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
            <a href="/" class="hosmed-footer__logo" aria-label="HosmedAI Home"><img src="/assets/images/footer_logo.png" alt="HosmedAI - Smarter Hospitals. Better Care."></a>
            <p>We partner with healthcare organisations to design, build and operate smarter hospitals through integrated solutions.</p>
            <div class="hosmed-footer__social"><a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a><a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a><a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a><a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a><a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a></div>
          </div>
          <nav class="hosmed-footer__column" aria-label="Footer links"><h3>Links</h3><ul><li><a href="/">Home</a></li><li><a href="/why-hosmedai">Why HosmedAI</a></li><li><a href="/about">About Us</a></li><li><a href="/hospital-planning">Hospital Planning</a></li><li><a href="/nabh-nabl">NABH / NABL</a></li><li><a href="/hospital-software">Hospital Software</a></li><li><a href="/ai-healthcare">AI Healthcare</a></li><li><a href="/services">Solutions</a></li><li><a href="/who-we-serve">Who We Serve</a></li><li><a href="/projects">Projects</a></li><li><a href="/contact">Contact</a></li></ul></nav>
          <nav class="hosmed-footer__column" aria-label="Explore"><h3>Explore</h3><ul><li><a href="/hospital-planning">Planning &amp; Design</a></li><li><a href="/nabh-nabl">Quality &amp; Accreditation</a></li><li><a href="/hospital-software">Hospital Technology</a></li><li><a href="/ai-healthcare">Healthcare AI</a></li><li><a href="/projects">Our Projects</a></li><li><a href="/contact">Book a Consultation</a></li></ul></nav>
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
        : routeName === 'projects' || routeName === 'portfolio'
          ? 'Projects & Case Studies | HosmedAI'
          : routeName === 'services'
            ? 'Healthcare Solutions | HosmedAI'
            : routeName === 'why-hosmedai'
              ? 'Why HosmedAI | Integrated Healthcare Expertise'
              : routeName === 'ai-healthcare'
                ? 'AI for Healthcare | HosmedAI'
                : routeName === 'hospital-software'
                  ? 'Hospital Software & HIS | HosmedAI'
                  : routeName === 'nabh-nabl'
                    ? 'NABH / NABL Accreditation Consultancy | HosmedAI'
                    : routeName === 'hospital-planning'
                      ? 'Hospital Planning & Design | HosmedAI'
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

createRoot(document.getElementById('root')).render(location.pathname.replace(/\/$/, '') === '/admin' ? <AdminApp /> : <App />);
