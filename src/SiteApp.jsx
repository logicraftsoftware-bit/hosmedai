import React, { useEffect, useMemo, useState } from "react";
import pages from "./pages.runtime.generated.js";
import "./cms-page.css";
import "./home-sections.css";
import "./home-carousel.css";
import "./policy-page.css";

const scripts = [
  "/assets/vendors/jquery/jquery-3.7.1.min.js",
  "/assets/vendors/bootstrap/js/bootstrap.bundle.min.js",
  "/assets/vendors/jquery-appear/jquery.appear.min.js",
  "/assets/vendors/jquery-magnific-popup/jquery.magnific-popup.min.js",
  "/assets/vendors/jquery-validate/jquery.validate.min.js",
  "/assets/vendors/owl-carousel/js/owl.carousel.min.js",
  "/assets/js/heartox.js",
];

function loadScript(src) {
  return new Promise((resolve) => {
    const element = document.createElement("script");
    element.src = src;
    element.onload = resolve;
    element.onerror = resolve;
    document.body.appendChild(element);
  });
}

function applyStructuredSections(html, routeName, rawSections) {
  let sections = rawSections;
  if (typeof sections === "string") {
    try {
      sections = JSON.parse(sections);
    } catch {
      sections = {};
    }
  }
  if (
    !sections ||
    typeof sections !== "object" ||
    !Object.keys(sections).length
  )
    return html;
  const documentNode = new DOMParser().parseFromString(
    `<body>${html}</body>`,
    "text/html",
  );
  const setText = (selector, value) => {
    const node = documentNode.querySelector(selector);
    if (node && value !== undefined && value !== null && value !== "")
      node.textContent = value;
  };
  const setImage = (selector, value, background = false) => {
    const node = documentNode.querySelector(selector);
    if (!node || !value) return;
    if (background) node.style.backgroundImage = `url('${value}')`;
    else node.setAttribute("src", value);
  };
  const iconCard = (item, className = "") => {
    const article = documentNode.createElement("article");
    article.className = className;
    const icon = documentNode.createElement("i");
    icon.className = item.icon || "fas fa-hospital";
    const title = documentNode.createElement("h3");
    title.textContent = item.title || "";
    const copy = documentNode.createElement("p");
    copy.textContent = item.description || "";
    article.append(icon, title, copy);
    return article;
  };
  const applyPageContent = (heroSelector) => {
    if (!sections.page_content) return;
    const hero = documentNode.querySelector(heroSelector);
    if (!hero) return;
    const section = documentNode.createElement("section");
    section.className = "cms-page";
    const container = documentNode.createElement("div");
    container.className = "container cms-page__inner";
    const content = String(sections.page_content);
    if (/<[a-z][\s\S]*>/i.test(content)) {
      const richDocument = new DOMParser().parseFromString(
        content,
        "text/html",
      );
      richDocument
        .querySelectorAll("script,style,iframe,object,embed")
        .forEach((node) => node.remove());
      richDocument.querySelectorAll("*").forEach((node) => {
        [...node.attributes].forEach((attribute) => {
          if (
            /^on/i.test(attribute.name) ||
            (/^(href|src)$/i.test(attribute.name) &&
              /^javascript:/i.test(attribute.value.trim()))
          )
            node.removeAttribute(attribute.name);
        });
      });
      container.innerHTML = richDocument.body.innerHTML;
    } else {
      content
        .split(/\r?\n\r?\n/)
        .filter(Boolean)
        .forEach((value) => {
          const paragraph = documentNode.createElement("p");
          paragraph.textContent = value;
          container.append(paragraph);
        });
    }
    section.append(container);
    hero.after(section);
  };
  const applyFaqs = (faqs) => {
    const list = documentNode.querySelector(".hosmed-faq__list");
    const valid = Array.isArray(faqs)
      ? faqs.filter((item) => item.question || item.answer)
      : [];
    if (!list || !valid.length) return;
    list.replaceChildren(
      ...valid.map((item) => {
        const details = documentNode.createElement("details");
        details.className = "hosmed-faq__item";
        const summary = documentNode.createElement("summary");
        const label = documentNode.createElement("span");
        label.textContent = item.question || "";
        const plus = documentNode.createElement("i");
        plus.className = "fas fa-plus";
        summary.append(label, plus);
        const answer = documentNode.createElement("div");
        answer.className = "hosmed-faq__answer";
        const paragraph = documentNode.createElement("p");
        paragraph.textContent = item.answer || "";
        answer.append(paragraph);
        details.append(summary, answer);
        return details;
      }),
    );
  };

  if (routeName === "index") {
    const banners = Array.isArray(sections.banners)
      ? sections.banners.filter((item) => item.title || item.image)
      : [];
    const carousel = documentNode.querySelector(".main-slider-one__carousel");
    if (carousel && banners.length) {
      const template = carousel.querySelector(".item");
      if (template)
        carousel.replaceChildren(
          ...banners.map((item) => {
            const slide = template.cloneNode(true);
            const background = slide.querySelector(".main-slider-one__bg");
            if (background && item.image)
              background.style.backgroundImage = `url('${item.image}')`;
            const shortTitle = slide.querySelector(
              ".main-slider-one__sub-title",
            );
            if (shortTitle) shortTitle.textContent = item.short_title || "";
            const title = slide.querySelector(".main-slider-one__title");
            if (title) title.textContent = item.title || "";
            const subtitle = slide.querySelector(".main-slider-one__text");
            if (subtitle) subtitle.textContent = item.subtitle || "";
            const button = slide.querySelector(".main-slider-one__btn > a");
            if (button) {
              button.textContent = item.button_text || "Explore Solutions";
              button.href = item.button_link || "/services";
            }
            return slide;
          }),
        );
    }
    const serviceCards = Array.isArray(sections.service_cards)
      ? sections.service_cards.filter(
          (item) => item.title || item.background_image,
        )
      : [];
    const serviceGrid = documentNode.querySelector(".banner-one__inner");
    if (serviceGrid && serviceCards.length) {
      const template = serviceGrid.querySelector(".item");
      if (template)
        serviceGrid.replaceChildren(
          ...serviceCards.map((item) => {
            const card = template.cloneNode(true);
            const background = card.querySelector(".banner-one__item__bg");
            if (background && item.background_image)
              background.style.backgroundImage = `url('${item.background_image}')`;
            const shortTitle = card.querySelector(
              ".banner-one__item__sub-title",
            );
            if (shortTitle) shortTitle.textContent = item.short_title || "";
            const title = card.querySelector(".banner-one__item__main-title");
            if (title) title.textContent = item.title || "";
            const link = card.querySelector(".banner-one__item__btn");
            if (link) {
              link.href = item.button_link || "#";
              link.textContent = item.button_text || "Explore Solutions";
            }
            return card;
          }),
        );
    }
    documentNode
      .querySelectorAll(".donation-one__item__image")
      .forEach((galleryImage) => {
        const background = galleryImage.style.backgroundImage || "";
        const match = background.match(/url\(["']?([^"')]+)["']?\)/i);
        if (!match?.[1]) return;
        const link = documentNode.createElement("a");
        link.className = "img-popup hosmed-gallery-popup";
        link.href = match[1];
        link.dataset.group = "1";
        link.setAttribute("aria-label", "Open gallery image");
        link.innerHTML = '<i class="fas fa-search-plus"></i>';
        galleryImage.prepend(link);
      });
    const ctaPoints = [
      "Clinical planning aligned with real hospital workflows",
      "Compliance, infrastructure and equipment coordinated together",
      "Expert support from concept through commissioning",
    ];
    documentNode.querySelectorAll(".cta-one__content").forEach((card) => {
      card.querySelectorAll(".cta-one__list__item").forEach((item, index) => {
        const icon = item.querySelector(".cta-one__list__icon");
        item.textContent = ` ${ctaPoints[index] || "Integrated healthcare delivery"}`;
        if (icon) item.prepend(icon);
      });
    });
    const insightsCarousel = documentNode.querySelector(".blog-one__carousel");
    if (insightsCarousel) {
      const insightItems = Array.from(
        insightsCarousel.querySelectorAll(".item"),
      );
      if (insightItems.length && insightItems.length < 4) {
        const fourth = insightItems[insightItems.length - 1].cloneNode(true);
        const image = fourth.querySelector(".blog-card__image img");
        const title = fourth.querySelector(".blog-card__title a");
        const date = fourth.querySelector(".blog-card__content__month");
        const author = fourth.querySelector(".blog-card__content__name-title");
        if (image) {
          image.src = "assets/images/blog/blog-1-4.jpg";
          image.alt = "AI and analytics for smarter hospital operations";
        }
        if (title)
          title.textContent =
            "AI and Analytics for Smarter Hospital Operations";
        if (date) date.childNodes[0].textContent = "18 ";
        if (author) author.textContent = "HosmedAI Editorial Team";
        insightsCarousel.append(fourth);
      }
      insightsCarousel.dataset.owlOptions = JSON.stringify({
        items: 1,
        margin: 24,
        loop: false,
        smartSpeed: 700,
        nav: false,
        dots: true,
        autoplay: false,
        responsive: {
          0: { items: 1 },
          600: { items: 2 },
          992: { items: 3 },
          1400: { items: 4 },
        },
      });
    }
    const aboutCards = Array.isArray(sections.about?.cards)
      ? sections.about.cards
      : [];
    const aboutSection = documentNode.querySelector(".about-one");
    if (aboutSection && sections.about) {
      const container = documentNode.createElement("div");
      container.className = "container hosmed-home-about__grid";
      const copy = documentNode.createElement("div");
      copy.className = "hosmed-home-about__copy";
      const eyebrow = documentNode.createElement("p");
      eyebrow.className = "hosmed-home-about__eyebrow";
      eyebrow.textContent = sections.about.short_title || "About HosmedAI";
      const heading = documentNode.createElement("h2");
      heading.textContent = sections.about.title || "";
      const description = documentNode.createElement("p");
      description.className = "hosmed-home-about__description";
      description.textContent = sections.about.description || "";
      const cards = documentNode.createElement("div");
      cards.className = "hosmed-home-about__cards";
      aboutCards.slice(0, 2).forEach((item, index) => {
        const fallback =
          index === 0
            ? {
                title: "End-to-End Planning",
                description:
                  "Clinical, architectural and operational planning under one roof.",
              }
            : {
                title: "Smarter Operations",
                description:
                  "Technology and AI that connect teams, workflows and decisions.",
              };
        const card = documentNode.createElement("article");
        const icon = documentNode.createElement("span");
        icon.innerHTML =
          index === 0
            ? '<i class="fas fa-hospital"></i>'
            : '<i class="fas fa-hand-holding-heart"></i>';
        const title = documentNode.createElement("h3");
        title.textContent = item.title || fallback.title;
        const text = documentNode.createElement("p");
        text.textContent = item.description || fallback.description;
        card.append(icon, title, text);
        cards.append(card);
      });
      const button = documentNode.createElement("a");
      button.className = "heartox-btn hosmed-home-about__button";
      button.href = sections.about.button_link || "/about";
      button.textContent = sections.about.button_text || "Discover More";
      copy.append(eyebrow, heading, description, cards, button);
      const media = documentNode.createElement("div");
      media.className = "hosmed-home-about__media";
      const image = documentNode.createElement("img");
      image.src = sections.about.image || "";
      image.alt = sections.about.title || "About HosmedAI";
      image.loading = "lazy";
      image.setAttribute("fetchpriority", "low");
      const badge = documentNode.createElement("div");
      badge.className = "hosmed-home-about__badge";
      const number = documentNode.createElement("strong");
      number.textContent = sections.about.stat_number || "360K";
      const label = documentNode.createElement("span");
      label.textContent = sections.about.stat_text || "Integrated Capabilities";
      badge.append(number, label);
      media.append(image, badge);
      container.append(copy, media);
      aboutSection.replaceChildren(container);
    }
    setImage(
      ".donate-now__bg, .donate-now__left",
      sections.contact?.image,
      true,
    );
    setText(
      ".hosmed-service-showcase .hosmed-section-heading p",
      sections.showcase?.short_title,
    );
    setText(
      ".hosmed-service-showcase .hosmed-section-heading h2",
      sections.showcase?.title,
    );
    const showcaseGrid = documentNode.querySelector(
      ".hosmed-service-showcase__grid",
    );
    const showcaseCards = Array.isArray(sections.showcase?.cards)
      ? sections.showcase.cards.filter((item) => item.title || item.image)
      : [];
    if (showcaseGrid && showcaseCards.length)
      showcaseGrid.replaceChildren(
        ...showcaseCards.map((item) => {
          const article = documentNode.createElement("article");
          const image = documentNode.createElement("img");
          image.src = item.image || "";
          image.alt = item.title || "";
          const icon = documentNode.createElement("i");
          icon.className = item.icon || "fas fa-hospital";
          const title = documentNode.createElement("h3");
          title.textContent = item.title || "";
          const copy = documentNode.createElement("p");
          copy.textContent = item.description || "";
          const link = documentNode.createElement("a");
          link.href = item.button_link || "#";
          link.textContent = item.button_text || "Learn More";
          article.append(image, icon, title, copy, link);
          return article;
        }),
      );
    setText(
      ".hosmed-testimonials .hosmed-section-heading p",
      sections.testimonials?.short_title,
    );
    setText(
      ".hosmed-testimonials .hosmed-section-heading h2",
      sections.testimonials?.title,
    );
    const testimonialItems = Array.isArray(sections.testimonials?.items)
      ? sections.testimonials.items
      : [];
    const testimonialFallbacks = [
      {
        quote:
          "Their planning team translated complex clinical requirements into clear, practical workflows for our hospital.",
        name: "Clinical Planning Team",
        role: "Hospital Development Project",
      },
      {
        quote:
          "The integrated approach to technology and operations gave our leadership team better visibility and control.",
        name: "Digital Transformation Team",
        role: "Connected Hospital Programme",
      },
    ];
    const displayedTestimonials = [...testimonialItems];
    testimonialFallbacks.forEach((item) => {
      if (displayedTestimonials.length < 4) displayedTestimonials.push(item);
    });
    while (displayedTestimonials.length < 4 && testimonialItems.length)
      displayedTestimonials.push(
        testimonialItems[
          displayedTestimonials.length % testimonialItems.length
        ],
      );
    documentNode
      .querySelectorAll(".hosmed-testimonials blockquote")
      .forEach((node, index) => {
        const item = testimonialItems[index];
        if (!item) return;
        const quote = node.querySelector(":scope > p");
        const name = node.querySelector("footer strong");
        const role = node.querySelector("footer span");
        if (quote) quote.textContent = item.quote || "";
        if (name) name.textContent = item.name || "";
        if (role) role.textContent = item.role || "";
      });
    setText(
      ".hosmed-testimonials aside > strong",
      sections.testimonials?.rating,
    );
    setText(
      ".hosmed-testimonials aside > b",
      sections.testimonials?.rating_title,
    );
    setText(
      ".hosmed-testimonials aside > span",
      sections.testimonials?.rating_text,
    );
    setText(
      ".testimonials-one .sec-title__tagline",
      sections.testimonials?.short_title,
    );
    const themeTestimonialTagline = documentNode.querySelector(
      ".testimonials-one .sec-title__tagline",
    );
    if (themeTestimonialTagline) {
      const shield = documentNode.createElement("img");
      shield.src = "assets/images/shapes/shield.png";
      shield.alt = "";
      shield.loading = "lazy";
      themeTestimonialTagline.prepend(shield);
    }
    setText(
      ".testimonials-one .sec-title__title",
      sections.testimonials?.title,
    );
    const themeTestimonialCarousel = documentNode.querySelector(
      ".testimonials-one__carousel",
    );
    if (themeTestimonialCarousel && displayedTestimonials.length) {
      const template = themeTestimonialCarousel.querySelector(".item");
      if (template) {
        themeTestimonialCarousel.replaceChildren(
          ...displayedTestimonials.slice(0, 4).map((item) => {
            const slide = template.cloneNode(true);
            const quote = slide.querySelector(".testimonials-card__text");
            const name = slide.querySelector(".testimonials-card__author-name");
            const role = slide.querySelector(
              ".testimonials-card__author-position",
            );
            if (quote) quote.textContent = item.quote || "";
            if (name) name.textContent = item.name || "";
            if (role) role.textContent = item.role || "";
            return slide;
          }),
        );
        themeTestimonialCarousel.dataset.owlOptions = JSON.stringify({
          items: 1,
          margin: 22,
          loop: true,
          smartSpeed: 800,
          nav: false,
          dots: true,
          autoplay: true,
          autoplayHoverPause: true,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            992: { items: 3 },
            1400: { items: 4 },
          },
        });
      }
    }
    setText(".testimonials-one__rating__number", sections.testimonials?.rating);
    setText(".testimonials-one__title", sections.testimonials?.rating_title);
    setText(
      ".testimonials-one__rating-text",
      sections.testimonials?.rating_text,
    );
    setText(
      ".hosmed-difference__top > div:first-child > p",
      sections.difference?.short_title,
    );
    setText(
      ".hosmed-difference__top > div:first-child > h2",
      sections.difference?.title,
    );
    const featureGrid = documentNode.querySelector(
      ".hosmed-difference__features",
    );
    const features = Array.isArray(sections.difference?.features)
      ? sections.difference.features
      : [];
    if (featureGrid && features.length)
      featureGrid.replaceChildren(
        ...features.map((item) => {
          const span = documentNode.createElement("span");
          const icon = documentNode.createElement("i");
          icon.className = item.icon || "fas fa-check";
          const title = documentNode.createElement("b");
          title.textContent = item.title || "";
          span.append(icon, title);
          return span;
        }),
      );
    setText(
      ".hosmed-difference__cta small",
      sections.difference?.cta_short_title,
    );
    setText(".hosmed-difference__cta h2", sections.difference?.cta_title);
    const differenceButton = documentNode.querySelector(
      ".hosmed-difference__cta a",
    );
    if (differenceButton) {
      if (sections.difference?.button_text)
        differenceButton.textContent = sections.difference.button_text;
      if (sections.difference?.button_link)
        differenceButton.href = sections.difference.button_link;
    }
    setText(".hosmed-faq__heading p", sections.faq_heading?.short_title);
    setText(".hosmed-faq__heading h2", sections.faq_heading?.title);
    applyFaqs(sections.faqs);
  }

  if (routeName === "about") {
    setImage(".hosmed-about__hero", sections.banner?.image, true);
    setText(".hosmed-about__hero h1", sections.banner?.title);
    setText(
      ".hosmed-about__hero .container > p:last-child",
      sections.banner?.description,
    );
    setText(
      ".hosmed-about__copy .hosmed-about__eyebrow",
      sections.vision?.small_heading,
    );
    setText(".hosmed-about__copy h2", sections.vision?.heading);
    setText(".hosmed-about__copy > p:last-child", sections.vision?.description);
    setText(
      ".hosmed-about__philosophy-card .hosmed-about__eyebrow",
      sections.mission?.small_heading,
    );
    setText(".hosmed-about__philosophy-card h2", sections.mission?.heading);
    setText(
      ".hosmed-about__philosophy-card > p",
      sections.mission?.description,
    );
    setText(".hosmed-about__heading h2", sections.what_we_do?.heading);
    setText(
      ".hosmed-about__heading > p:last-child",
      sections.what_we_do?.subheading,
    );
    const grid = documentNode.querySelector(".hosmed-about__capabilities");
    const cards = Array.isArray(sections.what_we_do?.cards)
      ? sections.what_we_do.cards.filter(
          (item) => item.title || item.description,
        )
      : [];
    if (grid && cards.length)
      grid.replaceChildren(
        ...cards.map((item) => iconCard(item, "wow fadeInUp")),
      );
    applyFaqs(sections.faqs);
  }

  if (routeName === "why-hosmedai") {
    setText(".hosmed-why__hero-copy h1", sections.hero?.title);
    setText(".hosmed-why__hero-copy h2", sections.hero?.subtitle);
    setText(
      ".hosmed-why__hero-copy > p:last-child",
      sections.hero?.description,
    );
    const grid = documentNode.querySelector(".hosmed-why__reasons-grid");
    const cards = Array.isArray(sections.cards)
      ? sections.cards.filter((item) => item.title || item.description)
      : [];
    if (grid && cards.length) {
      const timeline = grid.querySelector(".hosmed-why__timeline");
      grid.replaceChildren(
        ...cards.map((item, index) => {
          const card = iconCard(
            item,
            `hosmed-why__reason hosmed-why__reason--${index % 2 ? "right" : "left"}`,
          );
          const number = documentNode.createElement("b");
          number.textContent = String(index + 1).padStart(2, "0");
          card.prepend(number);
          return card;
        }),
        ...(timeline ? [timeline] : []),
      );
    }
  }

  if (routeName === "hospital-planning") {
    setText(".hosmed-planning__hero-copy h1", sections.hero?.title);
    setText(".hosmed-planning__hero-copy h2", sections.hero?.subtitle);
    setText(
      ".hosmed-planning__hero-copy > p:last-child",
      sections.hero?.description,
    );
    const grid = documentNode.querySelector(".hosmed-planning__services-grid");
    const cards = Array.isArray(sections.what_we_do?.cards)
      ? sections.what_we_do.cards.filter(
          (item) => item.title || item.description,
        )
      : [];
    if (grid && cards.length)
      grid.replaceChildren(
        ...cards.map((item) => {
          const article = iconCard(item, "hosmed-planning__service");
          const icon = article.querySelector("i");
          if (icon) {
            const span = documentNode.createElement("span");
            span.append(icon);
            article.prepend(span);
          }
          const title = article.querySelector("h3");
          const copy = article.querySelector("p");
          if (title && copy) {
            const wrapper = documentNode.createElement("div");
            wrapper.append(title, copy);
            article.append(wrapper);
          }
          return article;
        }),
      );
  }

  if (routeName === "nabh-nabl") {
    setText(".hosmed-accreditation__hero-copy h1", sections.hero?.title);
    setText(".hosmed-accreditation__hero-copy h2", sections.hero?.subtitle);
    setText(
      ".hosmed-accreditation__hero-copy > p:last-child",
      sections.hero?.description,
    );
    applyPageContent(".hosmed-accreditation__hero");
  }

  if (routeName === "hospital-software") {
    setText(".hosmed-software__hero-copy h1", sections.hero?.title);
    setText(".hosmed-software__hero-copy h2", sections.hero?.subtitle);
    setText(
      ".hosmed-software__hero-copy > p:last-of-type",
      sections.hero?.description,
    );
    applyPageContent(".hosmed-software__hero");
    const grid = documentNode.querySelector(".hosmed-software__module-grid");
    const modules = Array.isArray(sections.core_modules)
      ? sections.core_modules.filter((item) => item.title || item.points)
      : [];
    if (grid && modules.length)
      grid.replaceChildren(
        ...modules.map((item) => {
          const article = documentNode.createElement("article");
          article.className = "hosmed-software__module wow fadeInUp";
          const span = documentNode.createElement("span");
          const icon = documentNode.createElement("i");
          icon.className = item.icon || "fas fa-hospital";
          span.append(icon);
          const title = documentNode.createElement("h3");
          title.textContent = item.title || "";
          const divider = documentNode.createElement("i");
          const list = documentNode.createElement("ul");
          String(item.points || "")
            .split(",")
            .map((point) => point.trim())
            .filter(Boolean)
            .forEach((point) => {
              const li = documentNode.createElement("li");
              li.textContent = point;
              list.append(li);
            });
          article.append(span, title, divider, list);
          return article;
        }),
      );
  }

  if (routeName === "ai-healthcare") {
    setText(".hosmed-ai__hero-copy h1", sections.hero?.title);
    setText(".hosmed-ai__hero-copy h2", sections.hero?.subtitle);
    setText(
      ".hosmed-ai__hero-copy > p:last-of-type",
      sections.hero?.description,
    );
    applyPageContent(".hosmed-ai__hero");
    const grid = documentNode.querySelector(".hosmed-ai__grid");
    const cards = Array.isArray(sections.possibilities)
      ? sections.possibilities.filter((item) => item.title || item.description)
      : [];
    if (grid && cards.length)
      grid.replaceChildren(
        ...cards.map((item) => {
          const card = iconCard(item, "hosmed-ai__card wow fadeInUp");
          const icon = card.querySelector("i");
          if (icon) {
            const span = documentNode.createElement("span");
            span.append(icon);
            card.prepend(span);
          }
          return card;
        }),
      );
  }

  if (routeName === "services") {
    setText(".hosmed-solutions__hero-copy h1", sections.hero?.title);
    setText(
      ".hosmed-solutions__hero-copy > p:last-child",
      sections.hero?.description,
    );
    setText(".hosmed-solutions__eyebrow", sections.hero?.subtitle);
    applyPageContent(".hosmed-solutions__hero");
    const grid = documentNode.querySelector(".hosmed-solutions__grid");
    const cards = Array.isArray(sections.what_we_serve)
      ? sections.what_we_serve.filter((item) => item.title || item.description)
      : [];
    if (grid && cards.length)
      grid.replaceChildren(
        ...cards.map((item) => {
          const article = documentNode.createElement("article");
          article.className = "hosmed-solutions__card wow fadeInUp";
          const iconBox = documentNode.createElement("div");
          iconBox.className = "hosmed-solutions__icon";
          const icon = documentNode.createElement("i");
          icon.className = item.icon || "fas fa-hospital";
          iconBox.append(icon);
          const shortTitle = documentNode.createElement("p");
          shortTitle.textContent = item.short_title || "";
          const title = documentNode.createElement("h3");
          title.textContent = item.title || "";
          const divider = documentNode.createElement("span");
          const copy = documentNode.createElement("div");
          copy.textContent = item.description || "";
          const link = documentNode.createElement("a");
          link.href = item.button_link || "/contact";
          link.textContent = "Learn More ";
          const arrow = documentNode.createElement("i");
          arrow.className = "fas fa-arrow-right";
          link.append(arrow);
          article.append(iconBox, shortTitle, title, divider, copy, link);
          return article;
        }),
      );
  }

  if (routeName === "contact") {
    setText(".page-header__title, .hosmed-contact h1", sections.hero?.title);
    applyPageContent(".page-header, .hosmed-contact__hero");
  }
  return documentNode.body.innerHTML;
}

export default function SiteApp() {
  const [pageSettings, setPageSettings] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [policyPage, setPolicyPage] = useState(null);
  const routeName = useMemo(() => {
    const route = location.pathname.split("/").filter(Boolean).pop() || "index";
    return route.replace(/\.html$/i, "");
  }, []);
  const policyRoutes = {
    "terms-and-conditions": "terms",
    "privacy-policy": "privacy",
    "cookie-policy": "cookie",
  };
  const policyKey = policyRoutes[routeName] || null;

  const page = useMemo(() => {
    const requested = `${routeName}.html`;
    if (routeName === "contact" && !pages[requested])
      return pages["about.html"];
    if (routeName === "projects" || routeName === "portfolio")
      return pages["about.html"];
    if (routeName === "services") return pages["about.html"];
    if (routeName === "why-hosmedai") return pages["about.html"];
    if (routeName === "ai-healthcare") return pages["about.html"];
    if (routeName === "hospital-software") return pages["about.html"];
    if (routeName === "nabh-nabl") return pages["about.html"];
    if (routeName === "hospital-planning") return pages["about.html"];
    if (policyKey) return pages["about.html"];
    return pages[requested] || pages["404.html"] || pages["index.html"];
  }, [routeName, policyKey]);

  useEffect(() => {
    if (!policyKey) {
      setPolicyPage(null);
      return;
    }
    let active = true;
    setPolicyPage(null);
    fetch(`/api/policies/${policyKey}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setPolicyPage(data || { title: "Policy", body: "" });
      })
      .catch(() => {
        if (active) setPolicyPage({ title: "Policy", body: "" });
      });
    return () => {
      active = false;
    };
  }, [policyKey]);

  useEffect(() => {
    const pageKey =
      routeName === "index"
        ? "home"
        : routeName === "services"
          ? "solutions"
          : routeName;
    let active = true;
    fetch(`/api/pages/${pageKey}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setPageSettings(data);
      })
      .catch(() => {
        if (active) setPageSettings(null);
      });
    return () => {
      active = false;
    };
  }, [routeName]);

  useEffect(() => {
    fetch("/api/website-settings")
      .then((response) => (response.ok ? response.json() : null))
      .then(setWebsiteSettings)
      .catch(() => setWebsiteSettings(null));
  }, []);

  const markup = useMemo(() => {
    // The legacy template preloader is removed here because its hide handler is
    // registered after the window load event by the asynchronously loaded
    // vendor scripts. On slower connections that leaves a full-screen overlay
    // covering an otherwise rendered page indefinitely.
    let html = page.html.replace(
      /<div class="preloader">[\s\S]*?<\/div>\s*<\/div>\s*<!-- \/\.preloader -->/,
      "",
    );

    const navItem = (name, href, label, icon, aliases = []) => {
      const active = [name, ...aliases].includes(routeName);
      return `<li${active ? ' class="current"' : ""}><a href="${href}"${active ? ' aria-current="page"' : ""}><i class="${icon}" aria-hidden="true"></i><span>${label}</span></a></li>`;
    };
    const escapeValue = (value) =>
      String(value || "").replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          })[character],
      );
    const parseValue = (value) => {
      if (value && typeof value === "object") return value;
      try {
        return JSON.parse(value || "{}");
      } catch {
        return {};
      }
    };
    const headerSettings = parseValue(websiteSettings?.header_settings);
    const footerSettings = parseValue(websiteSettings?.footer_settings);
    const dynamicNavigation = Array.isArray(headerSettings.navigation)
      ? headerSettings.navigation.filter((item) => item?.label && item?.link)
      : [];
    const primaryNavigation = dynamicNavigation.length
      ? `<ul class="main-menu__list hosmed-navigation">${dynamicNavigation
          .map((item) => {
            const itemRoute =
              String(item.link).split("/").filter(Boolean).pop() || "index";
            return navItem(
              itemRoute,
              escapeValue(item.link),
              escapeValue(item.label),
              escapeValue(item.icon || "fas fa-link"),
            );
          })
          .join("")}</ul>`
      : `<ul class="main-menu__list hosmed-navigation">
      ${navItem("index", "/", "Home", "fas fa-home")}
      ${navItem("why-hosmedai", "/why-hosmedai", "Why HosmedAI", "fas fa-shield-alt")}
      ${navItem("about", "/about", "About", "fas fa-hospital-user")}
      ${navItem("hospital-planning", "/hospital-planning", "Hospital Planning", "fas fa-drafting-compass")}
      ${navItem("nabh-nabl", "/nabh-nabl", "NABH / NABL", "fas fa-award")}
      ${navItem("hospital-software", "/hospital-software", "Hospital Software", "fas fa-laptop-medical")}
      ${navItem("ai-healthcare", "/ai-healthcare", "AI Healthcare", "fas fa-brain")}
      ${navItem("services", "/services", "Solutions", "fas fa-th-large")}
      ${navItem("projects", "/projects", "Projects", "fas fa-briefcase-medical", ["portfolio"])}
      ${navItem("contact", "/contact", "Contact", "fas fa-envelope")}
    </ul>`;

    html = html
      .replace(
        /<ul class="main-menu__list">[\s\S]*?<\/ul>\s*<\/nav>/,
        `${primaryNavigation}</nav>`,
      )
      .replace(/needhelp@company\.com/g, "hello@hosmedai.com")
      .replace(/Visit Our Social Pages:/g, "Connect with HosmedAI:")
      .replace(/Become a Volunteer/g, "Book a Consultation")
      .replace(
        /<a[^>]*class="[^"]*main-header__info__item[^"]*"[^>]*>\s*<i class="icon-trolley-cart_4175270"><\/i>\s*<\/a>/g,
        "",
      )
      .replace(/<div class="main-header__info">[\s\S]*?<\/div>/g, "")
      .replace(/<div class="main-header__btn">[\s\S]*?<\/div>/g, "");
    if (headerSettings.button_text || headerSettings.button_link)
      html = html.replace(
        /(<div class="main-header__inner__right">\s*<a href=")[^"]+("[^>]*>)[\s\S]*?(<\/a>)/,
        `$1${escapeValue(headerSettings.button_link || "/contact")}$2${escapeValue(headerSettings.button_text || "Book a Consultation")}$3`,
      );

    if (page === pages["index.html"]) {
      html = html
        .replaceAll(
          "assets/images/backgrounds/slider-1-1.jpg",
          "assets/images/backgrounds/slider-1-1.webp",
        )
        .replaceAll(
          "assets/images/backgrounds/slider-1-2.jpg",
          "assets/images/backgrounds/slider-2.webp",
        )
        .replaceAll(
          "assets/images/backgrounds/slider-1-3.jpg",
          "assets/images/backgrounds/slider-3.webp",
        )
        .replaceAll(
          "assets/images/about/about-1-1.jpg",
          "assets/images/about/about-001.webp",
        )
        .replaceAll(
          "assets/images/shapes/image-logo.png",
          "assets/images/shapes/image-logo-blue.webp",
        )
        .replaceAll(
          "assets/images/shapes/shape-about-1-1.png",
          "assets/images/shapes/shape-about-1-1-blue.webp",
        )
        .replaceAll(
          "assets/images/resources/donation-2-1.jpg",
          "assets/images/resources/contact-us.webp",
        )
        .replace(
          "Send a Gift for <br> Children's",
          "Transform Your Hospital <br> Digitally",
        )
        .replace(
          "Join us & Become <br> a Healthcare Solutions",
          "Build Your Hospital <br> With Confidence",
        )
        .replace("Our Core Solutions", "Our Gallery")
        .replace(
          "From hospital planning to digital healthcare, HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance and technology together.",
          "From Hospital Planning to Digital Healthcare — We Do It All. HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance, accreditation and technology together through one integrated platform.",
        )
        .replace(
          "Feasibility, master planning, clinical planning, architecture, equipment planning, workflows and project management.",
          "From concept to commissioning. Hospital feasibility • Master planning • Clinical planning • Architectural design • Department planning • Equipment planning • Workflow design • Project management",
        )
        .replace(
          "Quality systems, SOP development, documentation, training, audits and accreditation readiness.",
          "Build systems that meet standards. NABH consultancy • NABL consultancy • SOP development • Quality systems • Documentation • Accreditation readiness • Training • Audit preparation",
        )
        .replace(
          "Connect ERP, HIS, EMR, billing, pharmacy, laboratory, radiology, inventory, HR, finance, analytics and AI-powered workflows.",
          "Turn your hospital into a connected digital ecosystem. Hospital ERP • HIS • EMR • Billing • Pharmacy • Laboratory • Radiology • Inventory • HR • Finance • Analytics • AI-powered workflows",
        )
        .replace(
          "ERP, HIS, EMR, billing, diagnostics, inventory, finance, analytics and AI-powered workflows.",
          "Turn your hospital into a connected digital ecosystem. Hospital ERP • HIS • EMR • Billing • Pharmacy • Laboratory • Radiology • Inventory • HR • Finance • Analytics • AI-powered workflows",
        )
        .replace(
          ">Hospital Planning & Design</a>",
          ">01 — Hospital Planning & Design</a>",
        )
        .replace(
          ">NABH / NABL & Healthcare Compliance</a>",
          ">02 — NABH / NABL & Healthcare Compliance</a>",
        )
        .replace(
          ">Hospital Software & AI</a>",
          ">03 — Hospital Software & AI</a>",
        )
        .replace(
          /<div class="item">\s*<div class="donation-one__item[\s\S]*?End-to-End Hospital Operations[\s\S]*?<\/div><!-- \/.item -->/,
          "",
        )
        .replace(
          "Support for eating funds <br> for hungry people",
          "From an Idea on Paper to a <br> Fully Operational Hospital.",
        )
        .replace(
          "HosmedAI stays with you throughout the complete hospital journey.",
          "Concept → Feasibility → Planning → Design → Construction Support → Equipment → Compliance → Accreditation → Software → Operations. HosmedAI stays with you throughout the journey.",
        )
        .replace(
          "Get Inspire Hospital Planning Consultation <br> Change a Life",
          "Discuss Your Hospital Project With Our Experts",
        )
        .replace(
          /<div class="donate-now__funfact">[\s\S]*?<\/div>\s*<\/div><!-- \/.donate-now__left -->/,
          `<div class="consultation-now__intro">
            <h3>Plan Your Hospital With Confidence</h3>
            <p>Share your requirements and our healthcare planning team will contact you.</p>
          </div>
          </div><!-- /.donate-now__left -->`,
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
          </form><!-- /.consultation-form -->`,
        )
        .replace(
          /<div class="charity-cause-donate wow[\s\S]*?<\/div><!-- \/.charity-cause-donate -->/,
          `<section class="hospital-journey wow fadeInUp" data-wow-duration="1500ms">
            <div class="hospital-journey__inner">
              <div class="hospital-journey__intro">
                <p class="hospital-journey__eyebrow"><i class="fas fa-shield-alt"></i> One Partner. Every Hospital Need.</p>
                <h2>From an Idea on Paper to a Fully Operational Hospital<span>.</span></h2>
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
          </section>`,
        );
    }

    if (routeName === "about") {
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
                  <img src="/assets/images/about/about-001.webp" alt="Healthcare professional working in a modern hospital" loading="lazy" decoding="async" width="900">
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
        aboutPage,
      );
    }

    if (routeName === "contact") {
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

      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        contactPage,
      );
    }

    if (routeName === "projects" || routeName === "portfolio") {
      const projectCards = [
        [
          "150 Beds",
          "/assets/images/backgrounds/slider-1-1.jpg",
          "Hospital Planning & Digital Transformation",
          "150-Bed Multi-Specialty Hospital",
          "Pune, Maharashtra",
          "Planning • Clinical Design • Compliance • Technology",
        ],
        [
          "300 Beds",
          "/assets/images/backgrounds/slider-1-2.jpg",
          "Integrated Hospital Development",
          "300-Bed Super Specialty Hospital",
          "Hyderabad, Telangana",
          "Feasibility • Architecture • Equipment • Technology",
        ],
        [
          "100 Beds",
          "/assets/images/backgrounds/slider-1-3.jpg",
          "Healthcare Technology Integration",
          "100-Bed Women & Child Hospital",
          "Bengaluru, Karnataka",
          "HIS • Operations • Quality • AI Workflows",
        ],
        [
          "250 Beds",
          "/assets/images/about/about-2-1.jpg",
          "Hospital Expansion & Accreditation",
          "250-Bed Multi-Specialty Hospital",
          "Ahmedabad, Gujarat",
          "Expansion • NABH • SOPs • Staff Training",
        ],
        [
          "500 Beds",
          "/assets/images/backgrounds/slider-4-1.jpg",
          "Smart Hospital Transformation",
          "500-Bed Tertiary Care Hospital",
          "New Delhi",
          "Digital Design • EMR • Analytics • Compliance",
        ],
        [
          "75 Beds",
          "/assets/images/about/about-4-1.jpg",
          "Purpose-Built Community Healthcare",
          "75-Bed Community Hospital",
          "Indore, Madhya Pradesh",
          "Planning • Infrastructure • Operations • Support",
        ],
      ]
        .map(
          (
            [beds, image, label, title, location, services],
            index,
          ) => `<article class="hosmed-projects__card wow fadeInUp" data-wow-delay="${index * 70}ms">
          <div class="hosmed-projects__image"><img src="${image}" alt="${title}"><span>${beds}</span></div>
          <div class="hosmed-projects__card-body"><p>${label}</p><h3>${title}</h3><div class="hosmed-projects__meta"><span><i class="fas fa-map-marker-alt"></i>${location}</span></div><p class="hosmed-projects__services">${services}</p><a href="/contact">View Case Study <i class="fas fa-arrow-right"></i></a></div>
        </article>`,
        )
        .join("");

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

      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        projectsPage,
      );
    }

    if (routeName === "services") {
      const solutions = [
        [
          "STARTING A HOSPITAL?",
          "fas fa-hospital",
          "Hospital Planning & Design",
          "Feasibility studies, architectural master planning, clinical layouts, equipment planning and functional design.",
        ],
        [
          "BUILDING A HOSPITAL?",
          "fas fa-users-cog",
          "Project & Clinical Consultancy",
          "End-to-end project management, clinical workflow planning, vendor coordination and quality assurance.",
        ],
        [
          "SEEKING ACCREDITATION?",
          "fas fa-award",
          "NABH / NABL Consultancy",
          "Complete support for NABH, NABL accreditation, documentation, training and compliance readiness.",
        ],
        [
          "RUNNING A HOSPITAL?",
          "fas fa-cogs",
          "Hospital Management Solutions",
          "Operations management, HR, finance, supply chain, patient experience and performance improvement.",
        ],
        [
          "DIGITISING YOUR HOSPITAL?",
          "fas fa-desktop",
          "Hospital ERP / HIS",
          "Integrated Hospital Information Systems, EMR, billing, inventory, pharmacy and reporting.",
        ],
        [
          "WANT SMARTER OPERATIONS?",
          "fas fa-brain",
          "AI & Healthcare Analytics",
          "AI-powered insights, predictive analytics, dashboards and decision support for better outcomes.",
        ],
      ]
        .map(
          ([eyebrow, icon, title, copy], index) =>
            `<article class="hosmed-solutions__card wow fadeInUp" data-wow-delay="${index * 80}ms"><div class="hosmed-solutions__icon"><i class="${icon}"></i></div><p>${eyebrow}</p><h3>${title}</h3><span></span><div>${copy}</div><a href="/contact">Learn More <i class="fas fa-arrow-right"></i></a></article>`,
        )
        .join("");

      const solutionsPage = `<main class="hosmed-solutions">
        <section class="hosmed-solutions__hero"><div class="container"><div class="hosmed-solutions__hero-copy"><p class="hosmed-solutions__eyebrow wow fadeInDown">Our Solutions</p><h1 class="wow fadeInUp">Solutions for Every Stage of Your Healthcare Journey.</h1><span></span><p class="wow fadeInUp" data-wow-delay="120ms">From planning to operations, our complete end-to-end solutions help you build smarter, compliant and future-ready hospitals.</p></div></div></section>
        <section class="hosmed-solutions__content section-space"><div class="container"><div class="hosmed-solutions__grid">${solutions}</div>
          <div class="hosmed-solutions__stats wow fadeInUp"><div><i class="fas fa-hospital"></i><p><strong>200+</strong><span>Projects Completed</span></p></div><div><i class="fas fa-map-marker-alt"></i><p><strong>25+</strong><span>Cities Served</span></p></div><div><i class="fas fa-users-cog"></i><p><strong>50M+</strong><span>Sq. Ft. Planned</span></p></div><div><i class="fas fa-award"></i><p><strong>100%</strong><span>Client Satisfaction</span></p></div></div>
          <div class="hosmed-solutions__cta wow fadeInUp"><div><h2>Need a Custom Solution for Your Hospital?</h2><p>Let's discuss how we can help you build a smarter, more efficient and future-ready healthcare facility.</p></div><a href="/contact" class="heartox-btn">Talk to Our Experts <i class="fas fa-arrow-right"></i></a><i class="fas fa-stethoscope" aria-hidden="true"></i></div>
        </div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        solutionsPage,
      );
    }

    if (routeName === "why-hosmedai") {
      const reasons = [
        [
          "01",
          "fas fa-route",
          "End-to-End Expertise",
          "From hospital concept to digital operations.",
        ],
        [
          "02",
          "fas fa-heartbeat",
          "Healthcare-Focused",
          "Solutions designed specifically around healthcare workflows.",
        ],
        [
          "03",
          "fas fa-puzzle-piece",
          "Integrated Approach",
          "Planning, compliance and technology designed to work together.",
        ],
        [
          "04",
          "fas fa-microchip",
          "Technology Driven",
          "Modern hospital management powered by cloud technology and AI.",
        ],
        [
          "05",
          "fas fa-chart-line",
          "Scalable",
          "Designed for clinics, nursing homes, diagnostic centres and multi-specialty hospitals.",
        ],
        [
          "06",
          "fas fa-handshake",
          "Long-Term Partnership",
          "We do not disappear after implementation. We help you build and evolve.",
        ],
      ]
        .map(
          ([number, icon, title, copy], index) =>
            `<article class="hosmed-why__reason hosmed-why__reason--${index % 2 ? "right" : "left"} wow fadeIn${index % 2 ? "Right" : "Left"}" data-wow-delay="${index * 70}ms"><b>${number}</b><div class="hosmed-why__reason-icon"><i class="${icon}"></i></div><div><h3>${title}</h3><span></span><p>${copy}</p></div></article>`,
        )
        .join("");
      const whyPage = `<main class="hosmed-why">
        <section class="hosmed-why__hero"><div class="container"><div class="hosmed-why__hero-copy"><p class="wow fadeInDown">WHY HOSMEDAI</p><h1 class="wow fadeInUp">Why Choose HosmedAI?</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">One Ecosystem. Multiple Capabilities.</h2><p class="wow fadeInUp" data-wow-delay="150ms">We bring together healthcare expertise, management consulting and technology to deliver better hospitals and better outcomes.</p></div></div></section>
        <section class="hosmed-why__reasons section-space"><div class="container"><div class="hosmed-why__reasons-grid">${reasons}<span class="hosmed-why__timeline" aria-hidden="true"></span></div></div></section>
        <section class="hosmed-why__advantage"><div class="container"><div class="hosmed-why__advantage-inner wow fadeInUp"><h2>The Hosmed<span>AI</span> Advantage</h2><div class="hosmed-why__advantage-grid"><div><i class="fas fa-users-cog"></i><h3>Healthcare Experts</h3><p>Deep domain knowledge that drives better decisions.</p></div><div><i class="fas fa-lightbulb"></i><h3>Innovative Solutions</h3><p>Using the latest technology to create future-ready hospitals.</p></div><div><i class="fas fa-shield-alt"></i><h3>Trusted Partner</h3><p>Transparency, commitment and reliability in everything we do.</p></div><div><i class="fas fa-bullseye"></i><h3>Better Outcomes</h3><p>Efficient operations and better patient care.</p></div></div></div></div></section>
        <section class="hosmed-why__cta"><div class="container"><div class="hosmed-why__cta-inner wow fadeInUp"><div><h2>Ready to Build a Smarter Hospital?</h2><p>Let's work together to design, build and manage hospitals that make a real difference.</p></div><a href="/contact" class="heartox-btn">Talk to Our Experts <i class="fas fa-arrow-right"></i></a></div></div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        whyPage,
      );
    }

    if (routeName === "ai-healthcare") {
      const aiCapabilities = [
        [
          "fas fa-tachometer-alt",
          "Management Dashboards",
          "Real-time overview of key hospital metrics in one intelligent dashboard.",
        ],
        [
          "fas fa-chart-pie",
          "Operational Analytics",
          "Deep insights into daily operations to improve efficiency and outcomes.",
        ],
        [
          "fas fa-chart-line",
          "Predictive Insights",
          "AI models predict trends and help you stay ahead of challenges.",
        ],
        [
          "fas fa-file-medical-alt",
          "Automated Reporting",
          "Reduce manual work with smart, automated and accurate reports.",
        ],
        [
          "fas fa-project-diagram",
          "Workflow Optimisation",
          "Identify bottlenecks and optimise processes across departments.",
        ],
        [
          "fas fa-rupee-sign",
          "Revenue Intelligence",
          "Track performance, detect opportunities and improve financial outcomes.",
        ],
        [
          "fas fa-users-cog",
          "Resource Utilisation",
          "Optimise the use of beds, staff, OT, equipment and other resources.",
        ],
        [
          "fas fa-procedures",
          "Patient-Flow Analytics",
          "Monitor patient journeys and improve flow from admission to discharge.",
        ],
        [
          "fas fa-shield-alt",
          "Quality Monitoring",
          "Track quality indicators and ensure compliance with standards.",
        ],
        [
          "fas fa-brain",
          "Decision-Support Tools",
          "AI-driven recommendations to support smarter clinical and operational decisions.",
        ],
      ]
        .map(
          ([icon, title, copy], index) =>
            `<article class="hosmed-ai__card wow fadeInUp" data-wow-delay="${index * 60}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><p>${copy}</p></article>`,
        )
        .join("");
      const aiPage = `<main class="hosmed-ai">
        <section class="hosmed-ai__hero"><div class="container"><div class="hosmed-ai__hero-copy"><p class="wow fadeInDown">AI FOR HEALTHCARE</p><h1 class="wow fadeInUp">Intelligence Behind<br>Every Hospital Decision.</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">The Future of Hospital Management Is Intelligent.</h2><p class="wow fadeInUp" data-wow-delay="140ms">HosmedAI combines hospital data, workflows and artificial intelligence to help healthcare organisations operate more efficiently.</p><a href="#ai-possibilities" class="heartox-btn wow fadeInUp" data-wow-delay="220ms">Explore HosmedAI <i class="fas fa-arrow-right"></i></a></div></div></section>
        <section class="hosmed-ai__possibilities section-space" id="ai-possibilities"><div class="container"><div class="hosmed-ai__heading wow fadeInUp"><h2><span>AI</span>-Powered Possibilities</h2><i></i></div><div class="hosmed-ai__grid">${aiCapabilities}</div></div></section>
        <section class="hosmed-ai__decisions"><div class="container"><div class="hosmed-ai__decisions-inner wow fadeInUp"><div class="hosmed-ai__decisions-copy"><h2>From <span>Data</span> to Decisions.</h2><p>Your hospital generates thousands of data points every day.</p><i></i><p>HosmedAI helps transform that data into meaningful intelligence.</p><a href="/contact" class="heartox-btn">Explore HosmedAI <i class="fas fa-arrow-right"></i></a></div><div class="hosmed-ai__visual" aria-label="AI healthcare intelligence visual"><img src="/assets/images/ai-bg.png" alt="HosmedAI connected healthcare intelligence"></div></div></div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        aiPage,
      );
    }

    if (routeName === "hospital-software") {
      const softwareModules = [
        [
          "fas fa-user-injured",
          "Patient Management",
          [
            "Registration",
            "Appointment",
            "OPD",
            "IPD",
            "Emergency",
            "Discharge",
          ],
        ],
        [
          "fas fa-stethoscope",
          "Clinical",
          [
            "EMR",
            "Doctor Dashboard",
            "Nursing",
            "OT Management",
            "ICU",
            "Clinical Documentation",
          ],
        ],
        [
          "fas fa-flask",
          "Diagnostics",
          [
            "Laboratory",
            "Radiology",
            "PACS Integration",
            "Pathology",
            "Reporting",
          ],
        ],
        [
          "fas fa-cogs",
          "Hospital Operations",
          [
            "Pharmacy",
            "Inventory",
            "Purchase",
            "Stores",
            "Biomedical Equipment",
            "Housekeeping",
          ],
        ],
        [
          "fas fa-chart-bar",
          "Business",
          ["Billing", "Insurance", "TPA", "Finance", "HR & Payroll", "MIS"],
        ],
      ]
        .map(
          ([icon, title, items], index) =>
            `<article class="hosmed-software__module wow fadeInUp" data-wow-delay="${index * 80}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><i></i><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`,
        )
        .join("");
      const softwarePage = `<main class="hosmed-software">
        <section class="hosmed-software__hero"><div class="container"><div class="hosmed-software__hero-copy"><p class="wow fadeInDown">HOSPITAL SOFTWARE</p><h1 class="wow fadeInUp">Your Hospital.<br>One Intelligent <span>Digital Ecosystem.</span></h1><h2 class="wow fadeInUp" data-wow-delay="80ms">Replace Fragmented Systems With One Connected Platform.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">HosmedAI Hospital Software is designed to connect the critical functions of a modern hospital through a single digital ecosystem.</p><a href="#software-demo" class="heartox-btn wow fadeInUp" data-wow-delay="220ms">Request a Software Demo <i class="fas fa-arrow-right"></i></a></div><div class="hosmed-software__dashboard wow fadeInRight" data-wow-duration="1300ms"><div class="hosmed-software__screen"><div><b>Hosmed<span>AI</span></b><small>Hospital Command Centre</small></div><section><p><span>Patients</span><strong>1,248</strong></p><p><span>Occupancy</span><strong>87%</strong></p><p><span>Revenue</span><strong>2.45M</strong></p></section><i class="fas fa-chart-line"></i></div><div class="hosmed-software__phone"><i class="fas fa-heartbeat"></i><b>HosmedAI</b><span>Connected Care</span></div></div></div></section>
        <section class="hosmed-software__modules section-space"><div class="container"><div class="hosmed-software__heading wow fadeInUp"><h2>Core <span>Modules</span></h2><i></i></div><div class="hosmed-software__module-grid">${softwareModules}</div></div></section>
        <section class="hosmed-software__ai"><div class="container"><div class="hosmed-software__ai-inner wow fadeInUp"><div><p>And Then Comes</p><h2>AI<span>.</span></h2><i></i><p>HosmedAI is designed to bring Artificial Intelligence into hospital operations, helping organisations turn healthcare data into actionable intelligence.</p><div class="hosmed-software__flow"><span><i class="fas fa-database"></i>Data</span><b>→</b><span><i class="fas fa-brain"></i>Intelligence</span><b>→</b><span><i class="fas fa-bullseye"></i>Better Decisions</span></div></div><img src="/assets/images/ai-bg.png" alt="Artificial intelligence connecting hospital operations"></div></div></section>
        <section class="hosmed-software__truth"><div class="container"><div class="hosmed-software__truth-inner wow fadeInUp"><div><i class="fas fa-hospital-alt"></i><h2>One Hospital.<br>One Platform.<br><span>One Source of Truth.</span></h2></div><div><span><i class="fas fa-link"></i><b>Integrated Data</b></span><span><i class="fas fa-eye"></i><b>Real-time Visibility</b></span><span><i class="fas fa-check-circle"></i><b>Better Outcomes</b></span><span><i class="fas fa-cogs"></i><b>Smarter Operations</b></span></div></div></div></section>
        <section class="hosmed-software__cta" id="software-demo"><div class="container"><div class="hosmed-software__cta-inner wow fadeInUp"><i class="fas fa-headset"></i><div><h2>Ready to Transform Your Hospital?</h2><p>See how HosmedAI Hospital Software can streamline operations, improve efficiency and deliver better patient care.</p></div><a href="/contact" class="heartox-btn">Request a Software Demo <i class="fas fa-arrow-right"></i></a></div></div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        softwarePage,
      );
    }

    if (routeName === "nabh-nabl") {
      const nabhJourney = [
        ["fas fa-clipboard-check", "Assessment"],
        ["fas fa-file-alt", "Documentation"],
        ["fas fa-cogs", "Implementation"],
        ["fas fa-chalkboard-teacher", "Training"],
        ["fas fa-tasks", "Internal Audit"],
        ["fas fa-shield-alt", "Readiness"],
        ["fas fa-award", "Accreditation"],
      ]
        .map(
          ([icon, label], index) =>
            `<div class="wow fadeInUp" data-wow-delay="${index * 70}ms"><span><i class="${icon}"></i></span><b>${label}</b>${index < 6 ? "<em>→</em>" : ""}</div>`,
        )
        .join("");
      const nablItems = [
        ["fas fa-shield-alt", "Quality management systems"],
        ["fas fa-file-alt", "Documentation"],
        ["fas fa-book-open", "SOPs"],
        ["fas fa-cogs", "Process standardisation"],
        ["fas fa-chart-line", "Quality indicators"],
        ["fas fa-search", "Internal audits"],
        ["fas fa-users", "Staff training"],
        ["fas fa-vials", "Laboratory workflow"],
        ["fas fa-medal", "Accreditation readiness"],
      ]
        .map(
          ([icon, label], index) =>
            `<div class="wow fadeInUp" data-wow-delay="${index * 50}ms"><i class="${icon}"></i><span>${label}</span></div>`,
        )
        .join("");
      const ecosystem = [
        ["N", "NABH"],
        ["fas fa-certificate", "NABL"],
        ["fas fa-shield-alt", "Quality"],
        ["fas fa-users-cog", "Patient Safety"],
        ["fas fa-hand-sparkles", "Infection Control"],
        ["fas fa-book-open", "SOPs"],
        ["fas fa-file-alt", "Documentation"],
        ["fas fa-chalkboard-teacher", "Training"],
        ["fas fa-search", "Audit"],
      ]
        .map(
          ([icon, label]) =>
            `<div><span>${icon.length === 1 ? icon : `<i class="${icon}"></i>`}</span><b>${label}</b></div>`,
        )
        .join("");
      const accreditationPage = `<main class="hosmed-accreditation">
        <section class="hosmed-accreditation__hero"><div class="container"><div class="hosmed-accreditation__hero-copy"><p class="wow fadeInDown">NABH / NABL &amp; COMPLIANCE</p><h1 class="wow fadeInUp">Accreditation Is More<br>Than a Certificate.</h1><h2 class="wow fadeInUp" data-wow-delay="80ms">It’s a Culture of Quality.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">HosmedAI helps hospitals and diagnostic laboratories build systems that are quality-driven, patient-centric and accreditation-ready.</p></div></div></section>
        <section class="hosmed-accreditation__content"><div class="container"><article class="hosmed-accreditation__panel hosmed-accreditation__nabh wow fadeInUp"><div class="hosmed-accreditation__panel-icon"><i class="fas fa-hospital-alt"></i></div><div class="hosmed-accreditation__panel-content"><h2><span>NABH</span> CONSULTANCY</h2><p>We support hospitals through the journey of:</p><div class="hosmed-accreditation__journey">${nabhJourney}</div></div></article>
          <article class="hosmed-accreditation__panel hosmed-accreditation__nabl wow fadeInUp"><div class="hosmed-accreditation__panel-icon"><i class="fas fa-microscope"></i></div><div class="hosmed-accreditation__panel-content"><h2><span>NABL</span> CONSULTANCY</h2><p>For diagnostic laboratories, we help establish robust systems covering:</p><div class="hosmed-accreditation__nabl-grid">${nablItems}</div></div></article>
          <section class="hosmed-accreditation__ecosystem wow fadeInUp"><h2>Our Compliance <span>Ecosystem</span></h2><div>${ecosystem}</div></section>
          <section class="hosmed-accreditation__cta wow fadeInUp"><div><h2>Don’t Prepare for Accreditation<br>at the Last Minute.</h2><p>Build Accreditation Into Your Hospital<br>From Day One.</p><i></i></div><a href="/contact" class="heartox-btn">Talk to Our Accreditation Team <i class="fas fa-arrow-right"></i></a></section>
        </div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        accreditationPage,
      );
    }

    if (routeName === "hospital-planning") {
      const planningServices = [
        [
          "fas fa-file-medical-alt",
          "Hospital feasibility studies",
          "Evaluate opportunities, risks and viability to ensure the right start.",
        ],
        [
          "fas fa-chart-line",
          "Business & project planning",
          "Comprehensive business models and project roadmaps for success.",
        ],
        [
          "fas fa-bed",
          "Bed-capacity planning",
          "Optimal bed mix and capacity planning for current and future demand.",
        ],
        [
          "fas fa-stethoscope",
          "Clinical department planning",
          "Designing efficient, connected clinical departments.",
        ],
        [
          "fas fa-hospital",
          "Hospital master planning",
          "Strategic master plans that align growth, infrastructure and vision.",
        ],
        [
          "fas fa-ruler-combined",
          "Architectural planning",
          "Functional, aesthetic and sustainable architectural designs.",
        ],
        [
          "fas fa-project-diagram",
          "Functional & workflow planning",
          "Smart workflows that improve efficiency and patient experience.",
        ],
        [
          "fas fa-procedures",
          "OT & ICU planning",
          "Specialized planning for OT suites, ICU and critical care areas.",
        ],
        [
          "fas fa-ambulance",
          "Emergency department planning",
          "Designing high-performance EDs for faster care and better outcomes.",
        ],
        [
          "fas fa-user-md",
          "OPD planning",
          "Patient-friendly OPD layouts that reduce wait times and crowding.",
        ],
        [
          "fas fa-microscope",
          "Diagnostic department planning",
          "Efficient layouts for labs, radiology and advanced diagnostics.",
        ],
        [
          "fas fa-clipboard-list",
          "Equipment planning",
          "Right equipment, right quantity, right placement.",
        ],
        [
          "fas fa-fire-extinguisher",
          "Medical gas planning",
          "Safe, compliant and future-ready medical gas systems.",
        ],
        [
          "fas fa-wind",
          "HVAC & MEP coordination",
          "Integrated HVAC, electrical and MEP for seamless operations.",
        ],
        [
          "fas fa-shield-alt",
          "Infection-control planning",
          "Spaces and systems designed to minimize infection risks.",
        ],
        [
          "fas fa-laptop-medical",
          "Biomedical equipment planning",
          "Planning for BMET, maintenance and equipment life-cycle.",
        ],
        [
          "fas fa-tasks",
          "Project management & commissioning support",
          "End-to-end support from planning to commissioning and handover.",
        ],
      ]
        .map(
          ([icon, title, copy], index) =>
            `<article class="hosmed-planning__service wow fadeInUp" data-wow-delay="${(index % 6) * 50}ms"><span><i class="${icon}"></i></span><div><h3>${title}</h3><p>${copy}</p></div></article>`,
        )
        .join("");
      const approach = [
        [
          "fas fa-comments",
          "Understand",
          "We understand your vision, needs, patient profile and operational goals.",
        ],
        [
          "fas fa-clipboard-check",
          "Plan",
          "We plan every detail with data, strategy and real-world insight.",
        ],
        [
          "fas fa-drafting-compass",
          "Design",
          "We design spaces that are functional, safe, sustainable and future-ready.",
        ],
        [
          "fas fa-chart-line",
          "Optimise",
          "We optimise workflows, resources and systems for maximum efficiency.",
        ],
        [
          "fas fa-hard-hat",
          "Execute",
          "We support execution, commissioning and a successful launch.",
        ],
      ]
        .map(
          ([icon, title, copy], index) =>
            `<div class="wow fadeInUp" data-wow-delay="${index * 80}ms"><span><i class="${icon}"></i></span><h3>${title}</h3><p>${copy}</p>${index < 4 ? "<b>→</b>" : ""}</div>`,
        )
        .join("");
      const planningPage = `<main class="hosmed-planning">
        <section class="hosmed-planning__hero"><div class="container"><div class="hosmed-planning__hero-copy"><p class="wow fadeInDown">HOSPITAL PLANNING &amp; DESIGN</p><i></i><h1 class="wow fadeInUp">Your Hospital<br><span>Starts With<br>the Right Plan.</span></h1><h2 class="wow fadeInUp" data-wow-delay="80ms">Design for Patients. Plan for Efficiency.<br>Build for the Future.</h2><i></i><p class="wow fadeInUp" data-wow-delay="150ms">A successful hospital isn’t simply a beautiful building.<br>It is a carefully engineered healthcare ecosystem where patients, doctors, nurses, technology, equipment and information move efficiently.</p></div></div></section>
        <section class="hosmed-planning__services section-space"><div class="container"><div class="hosmed-planning__heading wow fadeInUp"><i></i><h2>WHAT WE DO</h2><i></i></div><div class="hosmed-planning__services-grid">${planningServices}</div></div></section>
        <section class="hosmed-planning__approach"><div class="container"><div class="hosmed-planning__approach-inner"><div class="hosmed-planning__heading wow fadeInUp"><i></i><h2>OUR APPROACH</h2><i></i></div><div class="hosmed-planning__approach-grid">${approach}</div></div></div></section>
        <section class="hosmed-planning__cta"><div class="container"><div class="hosmed-planning__cta-inner wow fadeInUp"><div><h2>Build a Hospital That Works<br><span>Before You Build the Hospital.</span></h2><i></i><p>The right planning today reduces costs, improves efficiency, ensures compliance and delivers better care for years to come.</p><a href="/contact" class="heartox-btn">Plan My Hospital <i class="fas fa-arrow-right"></i></a></div></div><div class="hosmed-planning__benefits"><div><i class="far fa-heart"></i><p><b>Patient-Centric</b><span>Designed around patient comfort and safety.</span></p></div><div><i class="fas fa-bullseye"></i><p><b>Efficient &amp; Scalable</b><span>Built for efficiency, scalability and growth.</span></p></div><div><i class="fas fa-shield-alt"></i><p><b>Compliant &amp; Safe</b><span>Aligned with NABH, NABL and global standards.</span></p></div><div><i class="fas fa-leaf"></i><p><b>Sustainable Design</b><span>Environment-friendly and future-ready.</span></p></div><div><i class="fas fa-handshake"></i><p><b>End-to-End Support</b><span>From concept to commissioning.</span></p></div></div></div></section>
      </main>`;
      html = html.replace(
        /<section class="page-header[\s\S]*?(?=<footer class=)/,
        planningPage,
      );
    }

    if (routeName === "index" || routeName === "about") {
      if (routeName === "index") {
        const homeVisualSections = `<section class="hosmed-visual-solutions"><div class="container-fluid"><div class="hosmed-visual-solutions__grid"><a href="/hospital-planning" style="--card-image:url('/assets/images/charity/charity-1-1.jpg')"><small>Plan Better</small><h2>Hospital Planning<br>&amp; Design</h2><span>Explore Solution <i class="fas fa-arrow-right"></i></span></a><a href="/nabh-nabl" style="--card-image:url('/assets/images/charity/charity-1-2.jpg')"><small>Build Quality</small><h2>NABH / NABL<br>Compliance</h2><span>Explore Solution <i class="fas fa-arrow-right"></i></span></a><a href="/hospital-software" style="--card-image:url('/assets/images/charity/charity-1-3.jpg')"><small>Transform Digitally</small><h2>Hospital Software<br>&amp; AI</h2><span>Explore Solution <i class="fas fa-arrow-right"></i></span></a></div></div></section><section class="hosmed-service-showcase section-space"><div class="container"><div class="hosmed-section-heading"><p><i class="fas fa-shield-alt"></i> Integrated Healthcare Solutions</p><h2>Everything Your Hospital Needs</h2></div><div class="hosmed-service-showcase__grid"><article><img src="/assets/images/charity/charity-2-1.jpg" alt="Hospital planning"><i class="fas fa-drafting-compass"></i><h3>Hospital Planning</h3><p>From feasibility and clinical planning to commissioning support.</p><a href="/hospital-planning">Learn More</a></article><article><img src="/assets/images/charity/charity-2-2.jpg" alt="Hospital accreditation"><i class="fas fa-award"></i><h3>Quality &amp; Accreditation</h3><p>Practical NABH and NABL systems built for lasting quality.</p><a href="/nabh-nabl">Learn More</a></article><article><img src="/assets/images/charity/charity-2-3.jpg" alt="Hospital software"><i class="fas fa-laptop-medical"></i><h3>Hospital Technology</h3><p>Connected ERP, HIS, EMR and operational intelligence.</p><a href="/hospital-software">Learn More</a></article><article><img src="/assets/images/about/about-1-2.jpg" alt="Healthcare artificial intelligence"><i class="fas fa-brain"></i><h3>Healthcare AI</h3><p>Turn hospital data into faster, smarter decisions.</p><a href="/ai-healthcare">Learn More</a></article></div></div></section><section class="hosmed-testimonials section-space"><div class="container"><div class="hosmed-section-heading"><p><i class="fas fa-comments"></i> Client Experiences</p><h2>What Healthcare Leaders Say</h2></div><div class="hosmed-testimonials__grid"><blockquote><div><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p>HosmedAI brought planning, compliance and technology together with a practical understanding of hospital operations.</p><footer><strong>Hospital Leadership Team</strong><span>Integrated Healthcare Project</span></footer></blockquote><blockquote><div><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p>Their structured approach helped our team improve workflows, documentation and accreditation readiness.</p><footer><strong>Quality Management Team</strong><span>NABH Readiness Programme</span></footer></blockquote><aside><strong>4.9</strong><div><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><b>Client Satisfaction</b><span>End-to-end support</span></aside></div></div></section><section class="hosmed-difference"><div class="container"><div class="hosmed-difference__top"><div><p><i class="fas fa-shield-alt"></i> Why HosmedAI</p><h2>What Makes Us<br>Different</h2></div><div class="hosmed-difference__features"><span><i class="fas fa-hospital"></i><b>Healthcare<br>Focused</b></span><span><i class="fas fa-link"></i><b>Fully<br>Integrated</b></span><span><i class="fas fa-user-md"></i><b>Expert<br>Led</b></span><span><i class="fas fa-chart-line"></i><b>Outcome<br>Driven</b></span></div></div><div class="hosmed-difference__cta"><div><small>Start Your Hospital Journey</small><h2>Build a Smarter, Safer and Future-Ready Hospital.</h2></div><a href="/contact" class="heartox-btn">Book a Consultation</a></div></div></section>`;
        html = html.replace(/(?=<footer class=)/, homeVisualSections);
        html = html.replace(
          /<section class="hosmed-testimonials[\s\S]*?<\/section>/,
          "",
        );

        // Keep the solution cards immediately below the homepage banner. The
        // rest of the custom homepage sections remain near the footer.
        const visualCardsMatch = html.match(
          /<section class="hosmed-visual-solutions">[\s\S]*?<\/section>/,
        );
        if (visualCardsMatch) {
          html = html.replace(visualCardsMatch[0], "");
        }

        // The original testimonial carousel is retained and populated from
        // the Home Page admin fields now that the shared carousel runtime is active.
        html = html.replace(
          /<section class="charity-cause[\s\S]*?<\/section><!-- \/\.charity-cause -->/,
          "",
        );
      }
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
          <nav class="hosmed-footer__column" aria-label="Footer links"><h3>Links</h3><ul><li><a href="/">Home</a></li><li><a href="/why-hosmedai">Why HosmedAI</a></li><li><a href="/about">About Us</a></li><li><a href="/hospital-planning">Hospital Planning</a></li><li><a href="/nabh-nabl">NABH / NABL</a></li><li><a href="/hospital-software">Hospital Software</a></li><li><a href="/ai-healthcare">AI Healthcare</a></li><li><a href="/services">Solutions</a></li><li><a href="/projects">Projects</a></li><li><a href="/contact">Contact</a></li></ul></nav>
          <nav class="hosmed-footer__column" aria-label="Explore"><h3>Explore</h3><ul><li><a href="/hospital-planning">Planning &amp; Design</a></li><li><a href="/nabh-nabl">Quality &amp; Accreditation</a></li><li><a href="/hospital-software">Hospital Technology</a></li><li><a href="/ai-healthcare">Healthcare AI</a></li><li><a href="/projects">Our Projects</a></li><li><a href="/contact">Book a Consultation</a></li></ul></nav>
          <div class="hosmed-footer__contact"><h3>Contact</h3><div><i class="fas fa-phone-alt"></i><p><a href="tel:+9138008060">+91 3800 8060</a><a href="tel:+9195550114">+91 9555 0114</a></p></div><div><i class="fas fa-envelope"></i><p><a href="mailto:hello@hosmedai.com">hello@hosmedai.com</a></p></div><div><i class="fas fa-map-marker-alt"></i><p><span>Healthcare Solutions</span><span>India</span></p></div></div>
        </div>
        <div class="hosmed-footer__subscribe">
          <div class="hosmed-footer__subscribe-icon"><i class="far fa-envelope"></i></div>
          <div><h3>Subscribe to Get Our <span>Important Updates</span></h3><p>Stay updated with our latest news, insights and healthcare solutions.</p></div>
          <form action="#"><input type="email" aria-label="Email Address" placeholder="Email Address" required><button type="submit" aria-label="Subscribe"><i class="fas fa-paper-plane"></i></button></form>
        </div>
      </div>
      <div class="hosmed-footer__bottom"><div class="container"><p><i class="fas fa-shield-alt"></i> © 2026 HosmedAI. All Rights Reserved.</p><nav><a href="/privacy-policy">Privacy Policy</a><a href="/terms-and-conditions">Terms &amp; Conditions</a><a href="/cookie-policy">Cookie Policy</a></nav></div></div>
    </footer>`;

    html = html.replace(
      /<footer class="[^"]*">[\s\S]*?<\/footer>/,
      sharedFooter,
    );

    if (websiteSettings) {
      const safe = (value) =>
        String(value || "").replace(
          /[&<>"']/g,
          (character) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;",
            })[character],
        );
      const list = (value) =>
        Array.isArray(value)
          ? value
          : (() => {
              try {
                return JSON.parse(value || "[]");
              } catch {
                return [];
              }
            })();
      if (websiteSettings.header_logo)
        html = html.replace(
          /(<header class="main-header[\s\S]*?<img src=")[^"]+("[^>]*>)/,
          `$1${safe(websiteSettings.header_logo)}$2`,
        );
      if (websiteSettings.footer_logo)
        html = html.replace(
          "/assets/images/footer_logo.png",
          safe(websiteSettings.footer_logo),
        );
      if (websiteSettings.email)
        html = html.replace(
          /hello@hosmedai\.com/g,
          safe(websiteSettings.email),
        );
      const phones = list(websiteSettings.phones).filter(Boolean);
      if (phones.length) {
        html = html.replace(
          /<div><i class="fas fa-phone-alt"><\/i><p>[\s\S]*?<\/p><\/div>/,
          `<div><i class="fas fa-phone-alt"></i><p>${phones.map((phone) => `<a href="tel:${safe(phone).replace(/[^+0-9]/g, "")}">${safe(phone)}</a>`).join("")}</p></div>`,
        );
        const mobilePhone = safe(phones[0]);
        const mobilePhoneHref = mobilePhone.replace(/[^+0-9]/g, "");
        html = html.replace(
          /(<ul class="mobile-nav__contact[\s\S]*?<i class="fa fa-phone-alt"><\/i>\s*<a href="tel:)[^"]+("[^>]*>)[\s\S]*?(<\/a>)/,
          `$1${mobilePhoneHref}$2${mobilePhone}$3`,
        );
      }
      if (websiteSettings.address) {
        const headerAddress = safe(websiteSettings.address)
          .split(/\r?\n/)
          .filter(Boolean)
          .join(", ");
        html = html.replace(
          /(<li class="topbar-one__info__item">\s*<i class="fas fa-map-marker-alt topbar-one__info__icon"><\/i>)[\s\S]*?(<\/li>)/,
          `$1 ${headerAddress}$2`,
        );
        html = html.replace(
          /<div><i class="fas fa-map-marker-alt"><\/i><p>[\s\S]*?<\/p><\/div>/,
          `<div><i class="fas fa-map-marker-alt"></i><p>${safe(websiteSettings.address).replace(/\r?\n/g, "<br>")}</p></div>`,
        );
      }
      const socials = list(websiteSettings.social_links).filter(
        (item) => item?.link,
      );
      if (socials.length) {
        const socialItems = socials
          .map(
            (item) =>
              `<a href="${safe(item.link)}" target="_blank" rel="noopener noreferrer" aria-label="Social media"><i class="${safe(item.icon)}"></i></a>`,
          )
          .join("");
        html = html.replace(
          /<div class="(topbar-one__social|mobile-nav__social|hosmed-footer__social)">[\s\S]*?<\/div>/g,
          (_match, className) =>
            `<div class="${className}">${socialItems}</div>`,
        );
      }
      const footerLinks = (items = []) =>
        items
          .filter((item) => item?.label && item?.link)
          .map(
            (item) =>
              `<li><a href="${safe(item.link)}">${safe(item.label)}</a></li>`,
          )
          .join("");
      if (footerSettings.description)
        html = html.replace(
          /(<div class="hosmed-footer__brand">[\s\S]*?<\/a>\s*<p>)[\s\S]*?(<\/p>)/,
          `$1${safe(footerSettings.description)}$2`,
        );
      if (footerSettings.links_title)
        html = html.replace(
          /(<nav class="hosmed-footer__column" aria-label="Footer links"><h3>)[\s\S]*?(<\/h3>)/,
          `$1${safe(footerSettings.links_title)}$2`,
        );
      if (Array.isArray(footerSettings.links) && footerSettings.links.length)
        html = html.replace(
          /(<nav class="hosmed-footer__column" aria-label="Footer links">[\s\S]*?<ul>)[\s\S]*?(<\/ul>)/,
          `$1${footerLinks(footerSettings.links)}$2`,
        );
      if (footerSettings.explore_title)
        html = html.replace(
          /(<nav class="hosmed-footer__column" aria-label="Explore"><h3>)[\s\S]*?(<\/h3>)/,
          `$1${safe(footerSettings.explore_title)}$2`,
        );
      if (
        Array.isArray(footerSettings.explore_links) &&
        footerSettings.explore_links.length
      )
        html = html.replace(
          /(<nav class="hosmed-footer__column" aria-label="Explore">[\s\S]*?<ul>)[\s\S]*?(<\/ul>)/,
          `$1${footerLinks(footerSettings.explore_links)}$2`,
        );
      if (footerSettings.website_link)
        html = html.replace(
          /<a href="https:\/\/hosmedai\.vercel\.app">[\s\S]*?<\/a>/,
          `<a href="${safe(footerSettings.website_link)}">${safe(footerSettings.website_link).replace(/^https?:\/\//, "")}</a>`,
        );
      if (footerSettings.newsletter_title)
        html = html.replace(
          /(<div class="hosmed-footer__subscribe">[\s\S]*?<h3>)[\s\S]*?(<\/h3>)/,
          `$1${safe(footerSettings.newsletter_title)}$2`,
        );
      if (footerSettings.newsletter_description)
        html = html.replace(
          /(<div class="hosmed-footer__subscribe">[\s\S]*?<\/h3><p>)[\s\S]*?(<\/p>)/,
          `$1${safe(footerSettings.newsletter_description)}$2`,
        );
      if (footerSettings.copyright)
        html = html.replace(
          /(<div class="hosmed-footer__bottom"><div class="container"><p><i[^>]*><\/i>)[\s\S]*?(<\/p>)/,
          `$1 ${safe(footerSettings.copyright)}$2`,
        );
      if (
        Array.isArray(footerSettings.policy_links) &&
        footerSettings.policy_links.length
      )
        html = html.replace(
          /(<div class="hosmed-footer__bottom">[\s\S]*?<nav>)[\s\S]*?(<\/nav>)/,
          `$1${footerSettings.policy_links
            .filter((item) => item?.label && item?.link)
            .map((item) => {
              const fallback = /privacy/i.test(item.label)
                ? "/privacy-policy"
                : /terms/i.test(item.label)
                  ? "/terms-and-conditions"
                  : /cookie/i.test(item.label)
                    ? "/cookie-policy"
                    : "#";
              const link =
                item.link && item.link !== "#" ? item.link : fallback;
              return `<a href="${safe(link)}">${safe(item.label)}</a>`;
            })
            .join("")}$2`,
        );
    }

    if (pageSettings?.sections)
      html = applyStructuredSections(html, routeName, pageSettings.sections);

    if (policyKey) {
      const title = escapeValue(policyPage?.title || "Loading…");
      const source = String(policyPage?.body || "");
      const policyDocument = new DOMParser().parseFromString(
        source,
        "text/html",
      );
      policyDocument
        .querySelectorAll("script,style,iframe,object,embed")
        .forEach((node) => node.remove());
      policyDocument.querySelectorAll("*").forEach((node) => {
        [...node.attributes].forEach((attribute) => {
          if (
            /^on/i.test(attribute.name) ||
            (/^(href|src)$/i.test(attribute.name) &&
              /^javascript:/i.test(attribute.value.trim()))
          )
            node.removeAttribute(attribute.name);
        });
      });
      const content =
        policyDocument.body.innerHTML ||
        (policyPage
          ? '<p class="hosmed-policy__empty">Content will be available soon.</p>'
          : '<p class="hosmed-policy__empty">Loading content…</p>');
      const policyMarkup = `<main class="hosmed-policy"><section class="hosmed-policy__hero"><div class="container"><p><i class="fas fa-shield-alt"></i> Legal Information</p><h1>${title}</h1><nav aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${title}</span></nav></div></section><section class="hosmed-policy__content"><div class="container"><article>${content}</article></div></section></main>`;
      html = html.replace(
        /(<\/header>)[\s\S]*?(?=<footer class=)/,
        `$1${policyMarkup}`,
      );
    }

    html = html.replace(/\$/g, "₹");
    html = html.replace(/href=(['"])contact\.html\1/gi, 'href="/contact"');

    html = html.replace(
      /<a href="team\.html">/g,
      '<a href="/team" aria-label="Meet the HosmedAI team">',
    );
    html = html
      .replaceAll(
        "assets/images/logo-light.png",
        "assets/images/logo-light.webp",
      )
      .replaceAll(
        "assets/images/backgrounds/charity-bg-1-1.png",
        "assets/images/backgrounds/charity-bg-1-1.webp",
      )
      .replace(/<img\b[^>]*\bsrc=(?:""|'')[^>]*>/gi, "")
      .replace(
        /(<img\b[^>]*\bsrc=["'][^"']*\/shapes\/shield\.png["'])(?![^>]*\bwidth=)([^>]*>)/gi,
        '$1 width="24" height="24"$2',
      );

    // Keep below-the-fold template images out of the critical network path.
    html = html.replace(
      /<img(?![^>]*\bloading=)/gi,
      '<img loading="lazy" decoding="async" fetchpriority="low"',
    );
    html = html.replace(
      /<img(?![^>]*\bfetchpriority=)/gi,
      '<img fetchpriority="low"',
    );
    html = html.replace(
      /(<header class="main-header[\s\S]*?<img)([^>]*?)fetchpriority="low"/,
      '$1$2fetchpriority="high"',
    );

    if (
      pageSettings &&
      !["index", "about", "why-hosmedai", "hospital-planning"].includes(
        routeName,
      )
    ) {
      const escape = (value) =>
        String(value || "").replace(
          /[&<>"']/g,
          (character) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;",
            })[character],
        );
      const paragraphs = escape(pageSettings.body)
        .split(/\r?\n\r?\n/)
        .filter(Boolean)
        .map((text) => `<p>${text.replace(/\r?\n/g, "<br>")}</p>`)
        .join("");
      const managedContent = `<section class="cms-page${pageSettings.image_url ? " cms-page--image" : ""}"${pageSettings.image_url ? ` style="--cms-image:url('${escape(pageSettings.image_url)}')"` : ""}><div class="container"><div class="cms-page__inner"><p class="cms-page__eyebrow">${escape(pageSettings.page_name)}</p>${pageSettings.hero_title ? `<h1>${escape(pageSettings.hero_title)}</h1>` : ""}${pageSettings.hero_subtitle ? `<p class="cms-page__subtitle">${escape(pageSettings.hero_subtitle)}</p>` : ""}${paragraphs ? `<div class="cms-page__body">${paragraphs}</div>` : ""}</div></div></section>`;
      html = html.replace(/(?=<footer class=)/, managedContent);
    }

    return html.replace(
      /href=(["'])([a-z0-9-]+)\.html(#[^"']*)?\1/gi,
      (_, quote, name, hash = "") => {
        const path = name === "index" ? "/" : `/${name}`;
        return `href=${quote}${path}${hash}${quote}`;
      },
    );
  }, [page, routeName, pageSettings, websiteSettings, policyKey, policyPage]);

  useEffect(() => {
    // Defensive cleanup for cached or newly imported template markup.
    document
      .querySelectorAll(".preloader")
      .forEach((element) => element.remove());
    document.title = policyKey
      ? `${policyPage?.title || "Legal Information"} | HosmedAI`
      : pageSettings?.page_title ||
        (routeName === "about"
          ? "About HosmedAI | Integrated Hospital Development"
          : routeName === "contact"
            ? "Contact HosmedAI | Book a Hospital Consultation"
            : routeName === "projects" || routeName === "portfolio"
              ? "Projects & Case Studies | HosmedAI"
              : routeName === "services"
                ? "Healthcare Solutions | HosmedAI"
                : routeName === "why-hosmedai"
                  ? "Why HosmedAI | Integrated Healthcare Expertise"
                  : routeName === "ai-healthcare"
                    ? "AI for Healthcare | HosmedAI"
                    : routeName === "hospital-software"
                      ? "Hospital Software & HIS | HosmedAI"
                      : routeName === "nabh-nabl"
                        ? "NABH / NABL Accreditation Consultancy | HosmedAI"
                        : routeName === "hospital-planning"
                          ? "Hospital Planning & Design | HosmedAI"
                          : page.title || "Hosmed AI");
    if (pageSettings?.seo_description) {
      let description = document.querySelector('meta[name="description"]');
      if (description)
        description.setAttribute("content", pageSettings.seo_description);
    }
    document.body.className = page.bodyClass || "";
    let active = true;
    (async () => {
      for (const src of scripts) {
        if (!active) return;
        await loadScript(src);
      }
      if (window.jQuery) {
        window
          .jQuery(
            ".heartox-owl__carousel, .main-slider-one__carousel, .banner-one__inner",
          )
          .each(function () {
            const slider = window.jQuery(this);
            if (!slider.hasClass("owl-loaded") && slider.owlCarousel) {
              slider.owlCarousel(slider.data("owl-options"));
            }
          });
      }
    })();
    return () => {
      active = false;
    };
  }, [page, routeName, pageSettings, policyKey, policyPage]);

  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}
