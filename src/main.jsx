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

    if (page === pages['index.html']) {
      html = html
        .replace('assets/images/backgrounds/slider-1-2.jpg', 'assets/images/backgrounds/slider-2.png')
        .replace('assets/images/backgrounds/slider-1-3.jpg', 'assets/images/backgrounds/slider-3.png')
        .replace('assets/images/about/about-1-1.jpg', 'assets/images/about/about-001.png')
        .replace('assets/images/shapes/image-logo.png', 'assets/images/shapes/image-logo-blue.png')
        .replace('assets/images/shapes/shape-about-1-1.png', 'assets/images/shapes/shape-about-1-1-blue.png')
        .replace('assets/images/resources/donation-2-1.jpg', 'assets/images/resources/contact-us.png')
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
        );
    }

    return html.replace(
      /href=(["'])([a-z0-9-]+)\.html(#[^"']*)?\1/gi,
      (_, quote, name, hash = '') => {
        const path = name === 'index' ? '/' : `/${name}`;
        return `href=${quote}${path}${hash}${quote}`;
      }
    );
  }, [page]);

  useEffect(() => {
    document.title = page.title || 'Hosmed AI';
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
