import React, { useEffect, useState } from "react";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  image_url: "",
  status: "draft",
};
const websitePages = [
  ["home", "Home Page", "fas fa-home"],
  ["about", "About Page", "fas fa-hospital-user"],
  ["why-hosmedai", "Why HosmedAI Page", "fas fa-shield-alt"],
  ["hospital-planning", "Hospital Planning Page", "fas fa-drafting-compass"],
  ["nabh-nabl", "NABH / NABL Page", "fas fa-award"],
  ["hospital-software", "Hospital Software Page", "fas fa-laptop-medical"],
  ["ai-healthcare", "AI Healthcare Page", "fas fa-brain"],
  ["solutions", "Solutions Page", "fas fa-th-large"],
  ["projects", "Projects Page", "fas fa-briefcase-medical"],
  ["contact", "Contact Page", "fas fa-envelope"],
];
async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Something went wrong.");
  }
  return response.status === 204 ? null : response.json();
}

function GeneralSettings() {
  const blank = {
    header_logo: "",
    footer_logo: "",
    email: "",
    phones: [""],
    address: "",
    social_links: [{ icon: "fab fa-facebook-f", link: "" }],
  };
  const [settings, setSettings] = useState(blank);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api("/api/admin/website-settings")
      .then((data) => {
        if (data)
          setSettings({
            ...blank,
            ...data,
            phones: data.phones || [""],
            social_links: data.social_links || blank.social_links,
          });
      })
      .catch((error) => setMessage(error.message));
  }, []);
  const uploadLogo = async (event, field) => {
    if (!event.target.files[0]) return;
    const data = new FormData();
    data.append("image", event.target.files[0]);
    setMessage("Uploading…");
    try {
      const result = await api("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      setSettings((current) => ({ ...current, [field]: result.url }));
      setMessage("Logo uploaded. Save settings to keep it.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const save = async (event) => {
    event.preventDefault();
    setMessage("Saving…");
    try {
      setSettings(
        await api("/api/admin/website-settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        }),
      );
      setMessage("Website settings saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <form className="admin-page-editor" onSubmit={save}>
      <div className="admin-page-heading">
        <div>
          <small>Website Settings</small>
          <h1>General Website Settings</h1>
          <p>
            Manage information shared across the header, footer, and contact
            areas.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          View website <i className="fas fa-external-link-alt" />
        </a>
      </div>
      <div className="admin-page-fields">
        <div className="admin-logo-grid">
          <div className="admin-logo-field">
            <label>
              Header logo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => uploadLogo(event, "header_logo")}
              />
            </label>
            {settings.header_logo && (
              <img src={settings.header_logo} alt="Header logo preview" />
            )}
          </div>
          <div className="admin-logo-field admin-logo-field--dark">
            <label>
              Footer logo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => uploadLogo(event, "footer_logo")}
              />
            </label>
            {settings.footer_logo && (
              <img src={settings.footer_logo} alt="Footer logo preview" />
            )}
          </div>
        </div>
        <label>
          Email address
          <input
            type="email"
            value={settings.email || ""}
            onChange={(event) =>
              setSettings({ ...settings, email: event.target.value })
            }
          />
        </label>
        <fieldset className="admin-repeat">
          <legend>Phone numbers</legend>
          {(settings.phones || [""]).map((phone, index) => (
            <div key={index}>
              <input
                type="tel"
                value={phone}
                placeholder="Phone number"
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    phones: settings.phones.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  })
                }
              />
              {settings.phones.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      phones: settings.phones.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                >
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="admin-add"
            onClick={() =>
              setSettings({
                ...settings,
                phones: [...(settings.phones || []), ""],
              })
            }
          >
            <i className="fas fa-plus" /> Add phone number
          </button>
        </fieldset>
        <label>
          Address
          <textarea
            rows="4"
            value={settings.address || ""}
            onChange={(event) =>
              setSettings({ ...settings, address: event.target.value })
            }
          />
        </label>
        <fieldset className="admin-repeat">
          <legend>Social media</legend>
          {(settings.social_links || []).map((social, index) => (
            <div className="admin-social-row" key={index}>
              <select
                value={social.icon}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social_links: settings.social_links.map(
                      (item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, icon: event.target.value }
                          : item,
                    ),
                  })
                }
              >
                <option value="fab fa-facebook-f">Facebook</option>
                <option value="fab fa-instagram">Instagram</option>
                <option value="fab fa-linkedin-in">LinkedIn</option>
                <option value="fab fa-youtube">YouTube</option>
                <option value="fab fa-x-twitter">X / Twitter</option>
              </select>
              <input
                type="url"
                value={social.link}
                placeholder="https://…"
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    social_links: settings.social_links.map(
                      (item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, link: event.target.value }
                          : item,
                    ),
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    social_links: settings.social_links.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add"
            onClick={() =>
              setSettings({
                ...settings,
                social_links: [
                  ...(settings.social_links || []),
                  { icon: "fab fa-facebook-f", link: "" },
                ],
              })
            }
          >
            <i className="fas fa-plus" /> Add social link
          </button>
        </fieldset>
        {message && (
          <p
            className={
              message.includes("saved") || message.includes("uploaded")
                ? "admin-success"
                : "admin-error"
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">Save website settings</button>
      </div>
    </form>
  );
}

const structuredDefaults = {
  home: {
    banners: [],
    service_cards: [],
    about: {
      title: "",
      description: "",
      image: "",
      cards: [
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
    contact: { image: "" },
    faqs: [],
  },
  about: {
    banner: { image: "", title: "", description: "" },
    vision: { heading: "", small_heading: "", description: "" },
    mission: { heading: "", small_heading: "", description: "" },
    what_we_do: { heading: "", subheading: "", cards: [] },
    faqs: [],
  },
  "why-hosmedai": {
    hero: { title: "", subtitle: "", description: "" },
    cards: [],
  },
  "hospital-planning": {
    hero: { title: "", subtitle: "", description: "" },
    what_we_do: { cards: [] },
  },
  "nabh-nabl": {
    hero: { title: "", subtitle: "", description: "" },
    page_content: "",
  },
  "hospital-software": {
    hero: { title: "", subtitle: "", description: "" },
    page_content: "",
    core_modules: [],
  },
  "ai-healthcare": {
    hero: { title: "", subtitle: "", description: "" },
    page_content: "",
    possibilities: [],
  },
  solutions: {
    hero: { title: "", subtitle: "", description: "" },
    page_content: "",
    what_we_serve: [],
  },
  contact: { hero: { title: "", description: "" }, page_content: "" },
};

const parseSections = (pageKey, value) => {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = {};
    }
  }
  const defaults = structuredDefaults[pageKey] || {};
  return {
    ...defaults,
    ...(parsed && typeof parsed === "object" ? parsed : {}),
  };
};

const sectionsFromPage = (pageKey, page = {}) => {
  const sections = parseSections(pageKey, page.sections);
  if (
    ![
      "nabh-nabl",
      "hospital-software",
      "ai-healthcare",
      "solutions",
      "contact",
    ].includes(pageKey)
  )
    return sections;
  return {
    ...sections,
    hero: {
      ...(sections.hero || {}),
      title: sections.hero?.title || page.hero_title || "",
      subtitle: sections.hero?.subtitle || page.hero_subtitle || "",
      description: sections.hero?.description || page.seo_description || "",
    },
    page_content: sections.page_content || page.body || "",
  };
};

function ImageField({ label, value, onChange, upload }) {
  return (
    <div className="admin-structured-image">
      <label>
        {label}
        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/assets/images/... or upload below"
        />
      </label>
      <label className="admin-file-button">
        <i className="fas fa-upload" /> Upload image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => upload(event, onChange)}
        />
      </label>
      {value && <img src={value} alt={`${label} preview`} />}
    </div>
  );
}

function RepeatEditor({ title, items, blank, onChange, children, min = 0 }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <fieldset className="admin-section admin-repeater">
      <legend>{title}</legend>
      {list.map((item, index) => (
        <article key={index}>
          <div className="admin-repeat-heading">
            <strong>
              {title.replace(/s$/, "")} {index + 1}
            </strong>
            {list.length > min && (
              <button
                type="button"
                onClick={() =>
                  onChange(list.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                <i className="fas fa-trash" /> Remove
              </button>
            )}
          </div>
          {children(item, index, (next) =>
            onChange(
              list.map((current, itemIndex) =>
                itemIndex === index ? { ...current, ...next } : current,
              ),
            ),
          )}
        </article>
      ))}
      <button
        type="button"
        className="admin-add admin-add-section"
        onClick={() => onChange([...list, { ...blank }])}
      >
        <i className="fas fa-plus" /> Add{" "}
        {title.replace(/s$/, "").toLowerCase()}
      </button>
    </fieldset>
  );
}

function StructuredPageFields({ pageKey, sections, setSections, upload }) {
  const set = (name, value) =>
    setSections((current) => ({ ...current, [name]: value }));
  const group = (name, value) =>
    set(name, { ...(sections[name] || {}), ...value });
  const text = (label, value, onChange, area = false) => (
    <label>
      {label}
      {area ? (
        <textarea
          rows="4"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
  const iconCard = (item, _index, change) => (
    <div className="admin-card-fields">
      {text("Icon class", item.icon, (value) => change({ icon: value }))}
      {text("Title", item.title, (value) => change({ title: value }))}
      {text(
        "Description",
        item.description,
        (value) => change({ description: value }),
        true,
      )}
    </div>
  );
  const faq = (item, _index, change) => (
    <div className="admin-card-fields">
      {text("Question", item.question, (value) => change({ question: value }))}
      {text("Answer", item.answer, (value) => change({ answer: value }), true)}
    </div>
  );

  if (pageKey === "home")
    return (
      <div className="admin-structured-fields">
        <RepeatEditor
          title="Banners"
          items={sections.banners}
          blank={{ image: "", short_title: "", title: "", subtitle: "" }}
          onChange={(value) => set("banners", value)}
        >
          {(item, _index, change) => (
            <div className="admin-card-fields">
              <ImageField
                label="Banner image"
                value={item.image}
                onChange={(value) => change({ image: value })}
                upload={upload}
              />
              {text("Short title", item.short_title, (value) =>
                change({ short_title: value }),
              )}
              {text("Title", item.title, (value) => change({ title: value }))}
              {text(
                "Subtitle",
                item.subtitle,
                (value) => change({ subtitle: value }),
                true,
              )}
            </div>
          )}
        </RepeatEditor>
        <RepeatEditor
          title="Service cards"
          items={sections.service_cards}
          blank={{
            background_image: "",
            short_title: "",
            title: "",
            button_link: "",
          }}
          onChange={(value) => set("service_cards", value)}
        >
          {(item, _index, change) => (
            <div className="admin-card-fields">
              <ImageField
                label="Background image"
                value={item.background_image}
                onChange={(value) => change({ background_image: value })}
                upload={upload}
              />
              {text("Short title", item.short_title, (value) =>
                change({ short_title: value }),
              )}
              {text("Title", item.title, (value) => change({ title: value }))}
              {text("Button link", item.button_link, (value) =>
                change({ button_link: value }),
              )}
            </div>
          )}
        </RepeatEditor>
        <fieldset className="admin-section">
          <legend>Home page about</legend>
          {text("Title", sections.about?.title, (value) =>
            group("about", { title: value }),
          )}
          {text(
            "Description",
            sections.about?.description,
            (value) => group("about", { description: value }),
            true,
          )}
          <ImageField
            label="About image"
            value={sections.about?.image}
            onChange={(value) => group("about", { image: value })}
            upload={upload}
          />
          <RepeatEditor
            title="About cards"
            min={2}
            items={sections.about?.cards || []}
            blank={{ title: "", description: "" }}
            onChange={(value) => group("about", { cards: value })}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                {text("Title", item.title, (value) => change({ title: value }))}
                {text(
                  "Description",
                  item.description,
                  (value) => change({ description: value }),
                  true,
                )}
              </div>
            )}
          </RepeatEditor>
        </fieldset>
        <fieldset className="admin-section">
          <legend>Home page contact form</legend>
          <ImageField
            label="Left-side image"
            value={sections.contact?.image}
            onChange={(value) => group("contact", { image: value })}
            upload={upload}
          />
        </fieldset>
        <RepeatEditor
          title="FAQs"
          items={sections.faqs}
          blank={{ question: "", answer: "" }}
          onChange={(value) => set("faqs", value)}
        >
          {faq}
        </RepeatEditor>
      </div>
    );

  if (pageKey === "about")
    return (
      <div className="admin-structured-fields">
        <fieldset className="admin-section">
          <legend>Banner</legend>
          <ImageField
            label="Banner image"
            value={sections.banner?.image}
            onChange={(value) => group("banner", { image: value })}
            upload={upload}
          />
          {text("Title", sections.banner?.title, (value) =>
            group("banner", { title: value }),
          )}
          {text(
            "Description",
            sections.banner?.description,
            (value) => group("banner", { description: value }),
            true,
          )}
        </fieldset>
        {["vision", "mission"].map((name) => (
          <fieldset className="admin-section" key={name}>
            <legend>Our {name[0].toUpperCase() + name.slice(1)}</legend>
            {text("Heading", sections[name]?.heading, (value) =>
              group(name, { heading: value }),
            )}
            {text("Small heading", sections[name]?.small_heading, (value) =>
              group(name, { small_heading: value }),
            )}
            {text(
              "Description",
              sections[name]?.description,
              (value) => group(name, { description: value }),
              true,
            )}
          </fieldset>
        ))}
        <fieldset className="admin-section">
          <legend>What We Do</legend>
          {text("Heading", sections.what_we_do?.heading, (value) =>
            group("what_we_do", { heading: value }),
          )}
          {text("Sub heading", sections.what_we_do?.subheading, (value) =>
            group("what_we_do", { subheading: value }),
          )}
          <RepeatEditor
            title="Cards"
            items={sections.what_we_do?.cards || []}
            blank={{ icon: "fas fa-hospital", title: "", description: "" }}
            onChange={(value) => group("what_we_do", { cards: value })}
          >
            {iconCard}
          </RepeatEditor>
        </fieldset>
        <RepeatEditor
          title="FAQs"
          items={sections.faqs}
          blank={{ question: "", answer: "" }}
          onChange={(value) => set("faqs", value)}
        >
          {faq}
        </RepeatEditor>
      </div>
    );

  if (
    [
      "nabh-nabl",
      "hospital-software",
      "ai-healthcare",
      "solutions",
      "contact",
    ].includes(pageKey)
  ) {
    const hero = sections.hero || {};
    return (
      <div className="admin-structured-fields">
        <fieldset className="admin-section">
          <legend>Page introduction</legend>
          {text("Title", hero.title, (value) =>
            group("hero", { title: value }),
          )}
          {pageKey !== "contact" &&
            text("Sub-title", hero.subtitle, (value) =>
              group("hero", { subtitle: value }),
            )}
          {text(
            "Description",
            hero.description,
            (value) => group("hero", { description: value }),
            true,
          )}
        </fieldset>
        <fieldset className="admin-section">
          <legend>Page Content (Editor)</legend>
          <label>
            Page content
            <textarea
              rows="12"
              value={sections.page_content || ""}
              onChange={(event) => set("page_content", event.target.value)}
              placeholder="Add the main page content here…"
            />
          </label>
        </fieldset>
        {pageKey === "hospital-software" && (
          <RepeatEditor
            title="Core Modules"
            items={sections.core_modules}
            blank={{ icon: "fas fa-hospital", title: "", points: "" }}
            onChange={(value) => set("core_modules", value)}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                {text("Icon class", item.icon, (value) =>
                  change({ icon: value }),
                )}
                {text("Title", item.title, (value) => change({ title: value }))}
                {text(
                  "Points (separate with commas)",
                  item.points,
                  (value) => change({ points: value }),
                  true,
                )}
              </div>
            )}
          </RepeatEditor>
        )}
        {pageKey === "ai-healthcare" && (
          <RepeatEditor
            title="AI-Powered Possibilities"
            items={sections.possibilities}
            blank={{ icon: "fas fa-brain", title: "", description: "" }}
            onChange={(value) => set("possibilities", value)}
          >
            {iconCard}
          </RepeatEditor>
        )}
        {pageKey === "solutions" && (
          <RepeatEditor
            title="What We Serve"
            items={sections.what_we_serve}
            blank={{
              icon: "fas fa-hospital",
              short_title: "",
              title: "",
              description: "",
              button_link: "",
            }}
            onChange={(value) => set("what_we_serve", value)}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                {text("Icon class", item.icon, (value) =>
                  change({ icon: value }),
                )}
                {text("Short title", item.short_title, (value) =>
                  change({ short_title: value }),
                )}
                {text("Title", item.title, (value) => change({ title: value }))}
                {text(
                  "Description",
                  item.description,
                  (value) => change({ description: value }),
                  true,
                )}
                {text("Button link", item.button_link, (value) =>
                  change({ button_link: value }),
                )}
              </div>
            )}
          </RepeatEditor>
        )}
      </div>
    );
  }

  const hero = sections.hero || {};
  return (
    <div className="admin-structured-fields">
      <fieldset className="admin-section">
        <legend>Page introduction</legend>
        {text("Title", hero.title, (value) => group("hero", { title: value }))}
        {text("Subtitle", hero.subtitle, (value) =>
          group("hero", { subtitle: value }),
        )}
        {text(
          "Description",
          hero.description,
          (value) => group("hero", { description: value }),
          true,
        )}
      </fieldset>
      {pageKey === "why-hosmedai" ? (
        <RepeatEditor
          title="Zig-zag cards"
          items={sections.cards}
          blank={{ icon: "fas fa-hospital", title: "", description: "" }}
          onChange={(value) => set("cards", value)}
        >
          {iconCard}
        </RepeatEditor>
      ) : (
        <RepeatEditor
          title="What We Do cards"
          items={sections.what_we_do?.cards || []}
          blank={{ icon: "fas fa-hospital", title: "", description: "" }}
          onChange={(value) => group("what_we_do", { cards: value })}
        >
          {iconCard}
        </RepeatEditor>
      )}
    </div>
  );
}

function LegacyPageEditor({ pageKey }) {
  const pageName =
    websitePages.find(([key]) => key === pageKey)?.[1] || pageKey;
  const blank = {
    page_name: pageName,
    page_title: "",
    seo_description: "",
    hero_title: "",
    hero_subtitle: "",
    body: "",
    image_url: "",
    status: "draft",
  };
  const [page, setPage] = useState(blank);
  const [sections, setSections] = useState(parseSections(pageKey, {}));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setLoading(true);
    setMessage("");
    api(`/api/admin/pages/${pageKey}`)
      .then((data) => {
        const next = data || blank;
        setPage(next);
        setSections(parseSections(pageKey, next.sections));
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [pageKey]);
  const change = (event) =>
    setPage((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setMessage("Saving…");
    try {
      const saved = await api(`/api/admin/pages/${pageKey}`, {
        method: "PUT",
        body: JSON.stringify({ ...page, sections }),
      });
      setPage(saved);
      setSections(parseSections(pageKey, saved.sections));
      setMessage("Page settings saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const upload = async (event) => {
    if (!event.target.files[0]) return;
    const data = new FormData();
    data.append("image", event.target.files[0]);
    setMessage("Uploading…");
    try {
      const result = await api("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      setPage((current) => ({ ...current, image_url: result.url }));
      setMessage("Image uploaded. Save the page to keep it.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const uploadStructured = async (event, onChange) => {
    if (!event.target.files[0]) return;
    const data = new FormData();
    data.append("image", event.target.files[0]);
    setMessage("Uploadingâ€¦");
    try {
      const result = await api("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      onChange(result.url);
      setMessage("Image uploaded. Save the page to publish it.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  if (loading)
    return (
      <section className="admin-page-editor">
        <p>Loading page settings…</p>
      </section>
    );
  return (
    <form className="admin-page-editor" onSubmit={save}>
      <div className="admin-page-heading">
        <div>
          <small>Website Settings</small>
          <h1>{pageName}</h1>
          <p>
            Manage the primary content and search information for this page.
          </p>
        </div>
        <a
          href={pageKey === "home" ? "/" : `/${pageKey}`}
          target="_blank"
          rel="noreferrer"
        >
          View page <i className="fas fa-external-link-alt" />
        </a>
      </div>
      <div className="admin-page-fields">
        <label>
          Browser/SEO title
          <input
            name="page_title"
            value={page.page_title || ""}
            onChange={change}
            placeholder={`${pageName} | HosmedAI`}
          />
        </label>
        <label>
          SEO description
          <textarea
            name="seo_description"
            rows="3"
            maxLength="500"
            value={page.seo_description || ""}
            onChange={change}
          />
        </label>
        <label>
          Hero heading
          <input
            name="hero_title"
            value={page.hero_title || ""}
            onChange={change}
          />
        </label>
        <label>
          Hero supporting text
          <textarea
            name="hero_subtitle"
            rows="4"
            value={page.hero_subtitle || ""}
            onChange={change}
          />
        </label>
        <label>
          Page content
          <textarea
            name="body"
            rows="12"
            value={page.body || ""}
            onChange={change}
            placeholder="Add the main page content here…"
          />
        </label>
        <div className="admin-upload admin-page-upload">
          <label>
            Hero / featured image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={upload}
            />
          </label>
          {page.image_url && <img src={page.image_url} alt="Page preview" />}
        </div>
        <label>
          Publishing status
          <select
            name="status"
            value={page.status || "draft"}
            onChange={change}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        {message && (
          <p
            className={
              message.includes("saved") || message.includes("uploaded")
                ? "admin-success"
                : "admin-error"
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">Save page settings</button>
      </div>
    </form>
  );
}

function StructuredPageEditor({ pageKey }) {
  const pageName =
    websitePages.find(([key]) => key === pageKey)?.[1] || pageKey;
  const blank = {
    page_name: pageName,
    page_title: "",
    seo_description: "",
    status: "draft",
  };
  const [page, setPage] = useState(blank);
  const [sections, setSections] = useState(parseSections(pageKey, {}));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setLoading(true);
    setMessage("");
    api(`/api/admin/pages/${pageKey}`)
      .then((data) => {
        const next = data || blank;
        setPage(next);
        setSections(sectionsFromPage(pageKey, next));
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [pageKey]);
  const change = (event) =>
    setPage((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const save = async (event) => {
    event.preventDefault();
    setMessage("Savingâ€¦");
    try {
      const saved = await api(`/api/admin/pages/${pageKey}`, {
        method: "PUT",
        body: JSON.stringify({ ...page, page_name: pageName, sections }),
      });
      setPage(saved);
      setSections(sectionsFromPage(pageKey, saved));
      setMessage("Page settings saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const upload = async (event, onChange) => {
    if (!event.target.files[0]) return;
    const data = new FormData();
    data.append("image", event.target.files[0]);
    setMessage("Uploadingâ€¦");
    try {
      const result = await api("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      onChange(result.url);
      setMessage("Image uploaded. Save the page to publish it.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  if (loading)
    return (
      <section className="admin-page-editor">
        <p>Loading page settings...</p>
      </section>
    );
  return (
    <form className="admin-page-editor" onSubmit={save}>
      <div className="admin-page-heading">
        <div>
          <small>Website Settings</small>
          <h1>{pageName}</h1>
          <p>Manage every editable section on this page.</p>
        </div>
        <a
          href={pageKey === "home" ? "/" : `/${pageKey}`}
          target="_blank"
          rel="noreferrer"
        >
          View page <i className="fas fa-external-link-alt" />
        </a>
      </div>
      <div className="admin-page-fields">
        <fieldset className="admin-section admin-seo">
          <legend>Search &amp; publishing</legend>
          <label>
            Browser/SEO title
            <input
              name="page_title"
              value={page.page_title || ""}
              onChange={change}
              placeholder={`${pageName} | HosmedAI`}
            />
          </label>
          <label>
            SEO description
            <textarea
              name="seo_description"
              rows="3"
              maxLength="500"
              value={page.seo_description || ""}
              onChange={change}
            />
          </label>
          <label>
            Publishing status
            <select
              name="status"
              value={page.status || "draft"}
              onChange={change}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </fieldset>
        <StructuredPageFields
          pageKey={pageKey}
          sections={sections}
          setSections={setSections}
          upload={upload}
        />
        {message && (
          <p
            className={
              message.includes("saved") || message.includes("uploaded")
                ? "admin-success"
                : "admin-error"
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">Save all page changes</button>
      </div>
    </form>
  );
}

function PageEditor({ pageKey }) {
  return structuredDefaults[pageKey] ? (
    <StructuredPageEditor pageKey={pageKey} />
  ) : (
    <LegacyPageEditor pageKey={pageKey} />
  );
}

function GalleryManager() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const loadGallery = () =>
    api("/api/admin/gallery")
      .then(setImages)
      .catch((error) => setMessage(error.message));
  useEffect(() => {
    loadGallery();
  }, []);
  const uploadImages = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    const data = new FormData();
    files.forEach((file) => data.append("images", file));
    setUploading(true);
    setMessage(
      `Uploading and converting ${files.length} image${files.length === 1 ? "" : "s"} to WebP…`,
    );
    try {
      await api("/api/admin/gallery", { method: "POST", body: data });
      event.target.value = "";
      await loadGallery();
      setMessage("Gallery images uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };
  const removeImage = async (image) => {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      await api(`/api/admin/gallery/${image.id}`, { method: "DELETE" });
      setImages((current) => current.filter((item) => item.id !== image.id));
      setMessage("Gallery image removed.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <section className="admin-page-editor admin-gallery">
      <div className="admin-page-heading">
        <div>
          <small>Content</small>
          <h1>Gallery</h1>
          <p>
            Upload multiple images at once. Every image is automatically
            converted to WebP.
          </p>
        </div>
      </div>
      <label className="admin-gallery-upload">
        <i className="fas fa-images" />
        <strong>{uploading ? "Uploading…" : "Choose gallery images"}</strong>
        <span>
          JPG, PNG, GIF or WebP · maximum 5 MB each · up to 30 at once
        </span>
        <input
          type="file"
          multiple
          disabled={uploading}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={uploadImages}
        />
      </label>
      {message && (
        <p
          className={
            message.includes("successfully") || message.includes("removed")
              ? "admin-success"
              : ""
          }
        >
          {message}
        </p>
      )}
      <div className="admin-gallery-grid">
        {images.map((image) => (
          <article key={image.id}>
            <img
              src={image.image_url}
              alt={image.original_name || "Gallery image"}
            />
            <div>
              <span title={image.original_name}>
                {image.original_name || "Gallery image"}
              </span>
              <button
                type="button"
                className="admin-delete"
                onClick={() => removeImage(image)}
              >
                <i className="fas fa-trash" /> Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      {!images.length && !uploading && (
        <p className="admin-gallery-empty">No gallery images yet.</p>
      )}
    </section>
  );
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [section, setSection] = useState("general");
  const [pageKey, setPageKey] = useState("home");

  useEffect(() => {
    const optimizeImages = (root) =>
      root.querySelectorAll?.("img").forEach((image) => {
        image.loading = "lazy";
        image.fetchPriority = image.closest("header, .admin-login")
          ? "high"
          : "low";
      });
    optimizeImages(document);
    const observer = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches?.("img")) {
              node.loading = "lazy";
              node.fetchPriority = node.closest("header, .admin-login")
                ? "high"
                : "low";
            }
            optimizeImages(node);
          }
        }),
      ),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const load = async () => setItems(await api("/api/admin/content"));
  useEffect(() => {
    api("/api/admin/me")
      .then((data) => {
        setUser(data);
        return load();
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  const login = async (event) => {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const signedIn = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
      });
      setUser(signedIn);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const save = async (event) => {
    event.preventDefault();
    setMessage("Saving…");
    try {
      await api(
        editing ? `/api/admin/content/${editing}` : "/api/admin/content",
        { method: editing ? "PUT" : "POST", body: JSON.stringify(form) },
      );
      setForm(empty);
      setEditing(null);
      setMessage("Content saved.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };
  const choose = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      body: item.body || "",
      image_url: item.image_url || "",
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (item) => {
    if (!confirm(`Delete “${item.title}”?`)) return;
    await api(`/api/admin/content/${item.id}`, { method: "DELETE" });
    if (editing === item.id) {
      setEditing(null);
      setForm(empty);
    }
    await load();
  };
  const upload = async (event) => {
    const data = new FormData();
    data.append("image", event.target.files[0]);
    setMessage("Uploading…");
    try {
      const result = await api("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      setForm((current) => ({ ...current, image_url: result.url }));
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  if (checking)
    return <main className="admin-shell admin-center">Loading…</main>;
  if (!user)
    return (
      <main className="admin-shell admin-center">
        <form className="admin-login" onSubmit={login}>
          <img src="/assets/images/hosmed-ai-logo.png" alt="HosmedAI" />
          <h1>Admin sign in</h1>
          <label>
            Username
            <input name="username" autoComplete="username" required autoFocus />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {message && <p className="admin-error">{message}</p>}
          <button>Sign in</button>
          <a href="/">← Back to website</a>
        </form>
      </main>
    );
  const contentLibrary = (
    <section className="admin-layout">
      <form className="admin-editor" onSubmit={save}>
        <div className="admin-title">
          <h1>{editing ? "Edit content" : "Create content"}</h1>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              New
            </button>
          )}
        </div>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: editing
                  ? form.slug
                  : e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
              })
            }
            required
          />
        </label>
        <label>
          Slug
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
        </label>
        <label>
          Short description
          <textarea
            rows="3"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </label>
        <label>
          Content
          <textarea
            rows="10"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </label>
        <div className="admin-upload">
          <label>
            Featured image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={upload}
            />
          </label>
          {form.image_url && <img src={form.image_url} alt="Preview" />}
        </div>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        {message && (
          <p
            className={
              message.includes("saved") || message.includes("uploaded")
                ? "admin-success"
                : ""
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">
          {editing ? "Update content" : "Create content"}
        </button>
      </form>
      <section className="admin-list">
        <h2>
          All content <span>{items.length}</span>
        </h2>
        {items.length === 0 && <p>No content yet. Create your first item.</p>}
        {items.map((item) => (
          <article key={item.id}>
            {item.image_url ? (
              <img src={item.image_url} alt="" />
            ) : (
              <div className="admin-placeholder">No image</div>
            )}
            <div>
              <span className={`admin-status ${item.status}`}>
                {item.status}
              </span>
              <h3>{item.title}</h3>
              <small>/{item.slug}</small>
              <p>{item.excerpt}</p>
              <button onClick={() => choose(item)}>Edit</button>
              <button className="admin-delete" onClick={() => remove(item)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
  return (
    <main className="admin-shell">
      <header>
        <div>
          <img src="/assets/images/hosmed-ai-logo.png" alt="HosmedAI" />
          <span>Website Admin</span>
        </div>
        <div>
          <small>{user.username}</small>
          <button
            onClick={async () => {
              await api("/api/admin/logout", { method: "POST" });
              setUser(null);
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="admin-dashboard">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">
            <i className="fas fa-sliders-h" />
            <span>Website Settings</span>
          </div>
          <button
            className={`admin-library-link ${section === "general" ? "active" : ""}`}
            onClick={() => setSection("general")}
          >
            <i className="fas fa-cog" />
            <span>General Settings</span>
          </button>
          <nav>
            {websitePages.map(([key, label, icon]) => (
              <button
                key={key}
                className={
                  section === "page" && pageKey === key ? "active" : ""
                }
                onClick={() => {
                  setSection("page");
                  setPageKey(key);
                }}
              >
                <i className={icon} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-title admin-sidebar-title--secondary">
            <i className="fas fa-folder-open" />
            <span>Content</span>
          </div>
          <button
            className={`admin-library-link ${section === "content" ? "active" : ""}`}
            onClick={() => setSection("content")}
          >
            <i className="fas fa-images" />
            <span>Gallery</span>
          </button>
        </aside>
        <section className="admin-workspace">
          {section === "general" ? (
            <GeneralSettings />
          ) : section === "page" ? (
            <PageEditor pageKey={pageKey} />
          ) : (
            <GalleryManager />
          )}
        </section>
      </div>
    </main>
  );
}
