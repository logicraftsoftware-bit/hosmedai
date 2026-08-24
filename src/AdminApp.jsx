import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  image_url: "",
  category: "",
  author: "",
  published_at: "",
  seo_title: "",
  seo_description: "",
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

const editorPlugins = [
  Essentials,
  Paragraph,
  Heading,
  Style,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  Alignment,
  FontColor,
  FontBackgroundColor,
  FontFamily,
  FontSize,
  Link,
  AutoLink,
  List,
  ListProperties,
  TodoList,
  Indent,
  IndentBlock,
  BlockQuote,
  HorizontalLine,
  CodeBlock,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableCaption,
  TableColumnResize,
  ImageBlock,
  ImageInline,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageTextAlternative,
  ImageInsert,
  ImageInsertViaUrl,
  LinkImage,
  AutoImage,
  MediaEmbed,
  FindAndReplace,
  SelectAll,
  RemoveFormat,
  SourceEditing,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Autoformat,
  PasteFromOffice,
  TextTransformation,
  GeneralHtmlSupport,
  Undo,
];
const editorConfig = {
  licenseKey: "GPL",
  plugins: editorPlugins,
  toolbar: {
    items: [
      "sourceEditing",
      "undo",
      "redo",
      "|",
      "heading",
      "style",
      "|",
      "fontFamily",
      "fontSize",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "subscript",
      "superscript",
      "code",
      "removeFormat",
      "|",
      "alignment",
      "|",
      "bulletedList",
      "numberedList",
      "todoList",
      "outdent",
      "indent",
      "|",
      "link",
      "insertImage",
      "insertTable",
      "mediaEmbed",
      "blockQuote",
      "horizontalLine",
      "codeBlock",
      "specialCharacters",
      "|",
      "findAndReplace",
      "showBlocks",
    ],
    shouldNotGroupWhenFull: true,
  },
  image: {
    toolbar: [
      "imageTextAlternative",
      "toggleImageCaption",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "resizeImage",
    ],
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
      "toggleTableCaption",
    ],
  },
  link: { addTargetToExternalLinks: true, defaultProtocol: "https://" },
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
  },
};

function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write content here…",
}) {
  return (
    <div className="admin-ckeditor">
      <CKEditor
        editor={ClassicEditor}
        config={{ ...editorConfig, placeholder }}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  );
}

const fillMissing = (defaults, saved) =>
  Object.fromEntries(
    Object.entries({ ...defaults, ...(saved || {}) }).map(([key, value]) => [
      key,
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && !value.length)
        ? defaults[key]
        : value,
    ]),
  );
const fillMissingDeep = (defaults, saved) => {
  if (!defaults || typeof defaults !== "object" || Array.isArray(defaults))
    return saved === "" ||
      saved === null ||
      saved === undefined ||
      (Array.isArray(saved) && !saved.length)
      ? defaults
      : saved;
  return Object.fromEntries(
    Object.keys({ ...defaults, ...(saved || {}) }).map((key) => [
      key,
      fillMissingDeep(defaults[key], saved?.[key]),
    ]),
  );
};

const pageMetadataDefaults = {
  home: {
    page_title: "HosmedAI | Integrated Healthcare Solutions",
    seo_description:
      "HosmedAI delivers integrated hospital planning, accreditation, software and AI solutions.",
  },
  about: {
    page_title: "About HosmedAI | Smarter Hospitals, Better Care",
    seo_description:
      "Learn how HosmedAI combines healthcare expertise, management consulting and technology.",
  },
  "why-hosmedai": {
    page_title: "Why HosmedAI | One Integrated Healthcare Ecosystem",
    seo_description:
      "Discover why healthcare organisations choose HosmedAI for end-to-end expertise and long-term partnership.",
  },
  "hospital-planning": {
    page_title: "Hospital Planning and Design | HosmedAI",
    seo_description:
      "Plan efficient, compliant and future-ready hospitals with HosmedAI.",
  },
  "nabh-nabl": {
    page_title: "NABH and NABL Accreditation Consultancy | HosmedAI",
    seo_description:
      "Build quality-driven, patient-centric and accreditation-ready healthcare systems.",
  },
  "hospital-software": {
    page_title: "Hospital Software, HIS and ERP | HosmedAI",
    seo_description:
      "Connect every critical hospital function through one intelligent digital ecosystem.",
  },
  "ai-healthcare": {
    page_title: "AI for Healthcare and Hospital Analytics | HosmedAI",
    seo_description:
      "Transform hospital data into operational intelligence and better decisions.",
  },
  solutions: {
    page_title: "Integrated Hospital Solutions | HosmedAI",
    seo_description:
      "End-to-end solutions for hospital planning, projects, accreditation, operations, software and AI.",
  },
  projects: {
    page_title: "Healthcare Projects | HosmedAI",
    seo_description:
      "Explore HosmedAI healthcare planning, design and consultancy projects.",
    hero_title: "Projects That Shape Better Healthcare.",
    hero_subtitle: "From Vision to Reality.",
    body: "Every healthcare project has a unique vision, challenge and story. HosmedAI brings planning, clinical expertise, technology and execution support together to turn that vision into reality.",
  },
  contact: {
    page_title: "Contact HosmedAI | Build Better Healthcare Together",
    seo_description:
      "Contact HosmedAI for hospital planning, accreditation, software and healthcare AI solutions.",
  },
};

function GeneralSettings() {
  const blank = {
    header_logo: "/assets/images/hosmed-ai-logo.png",
    footer_logo: "/assets/images/footer_logo.png",
    email: "hello@hosmedai.com",
    phones: ["+91 3800 8060", "+91 9555 0114"],
    address: "Healthcare Solutions\nIndia",
    social_links: [
      { icon: "fab fa-facebook-f", link: "" },
      { icon: "fab fa-x-twitter", link: "" },
      { icon: "fab fa-linkedin-in", link: "" },
      { icon: "fab fa-instagram", link: "" },
      { icon: "fab fa-youtube", link: "" },
    ],
    header_settings: {
      navigation: [
        { label: "Home", link: "/", icon: "fas fa-home" },
        {
          label: "Why HosmedAI",
          link: "/why-hosmedai",
          icon: "fas fa-shield-alt",
        },
        { label: "About", link: "/about", icon: "fas fa-hospital-user" },
        {
          label: "Hospital Planning",
          link: "/hospital-planning",
          icon: "fas fa-drafting-compass",
        },
        { label: "NABH / NABL", link: "/nabh-nabl", icon: "fas fa-award" },
        {
          label: "Hospital Software",
          link: "/hospital-software",
          icon: "fas fa-laptop-medical",
        },
        {
          label: "AI Healthcare",
          link: "/ai-healthcare",
          icon: "fas fa-brain",
        },
        { label: "Solutions", link: "/services", icon: "fas fa-th-large" },
        {
          label: "Projects",
          link: "/projects",
          icon: "fas fa-briefcase-medical",
        },
        { label: "Contact", link: "/contact", icon: "fas fa-envelope" },
      ],
      button_text: "Book a Consultation",
      button_link: "/contact",
    },
    footer_settings: {
      description:
        "We partner with healthcare organisations to design, build and operate smarter hospitals through integrated solutions.",
      links_title: "Links",
      links: [
        { label: "Home", link: "/" },
        { label: "Why HosmedAI", link: "/why-hosmedai" },
        { label: "About Us", link: "/about" },
        { label: "Hospital Planning", link: "/hospital-planning" },
        { label: "NABH / NABL", link: "/nabh-nabl" },
        { label: "Hospital Software", link: "/hospital-software" },
        { label: "AI Healthcare", link: "/ai-healthcare" },
        { label: "Solutions", link: "/services" },
        { label: "Projects", link: "/projects" },
        { label: "Contact", link: "/contact" },
      ],
      explore_title: "Explore",
      explore_links: [
        { label: "Planning & Design", link: "/hospital-planning" },
        { label: "Quality & Accreditation", link: "/nabh-nabl" },
        { label: "Hospital Technology", link: "/hospital-software" },
        { label: "Healthcare AI", link: "/ai-healthcare" },
        { label: "Our Projects", link: "/projects" },
        { label: "Book a Consultation", link: "/contact" },
      ],
      website_link: "https://hosmedai.com",
      newsletter_title: "Subscribe to Get Our Important Updates",
      newsletter_description:
        "Stay updated with our latest news, insights and healthcare solutions.",
      copyright: "© 2026 HosmedAI. All Rights Reserved.",
      policy_links: [
        { label: "Privacy Policy", link: "/privacy-policy" },
        { label: "Terms & Conditions", link: "/terms-and-conditions" },
        { label: "Cookie Policy", link: "/cookie-policy" },
      ],
    },
  };
  const [settings, setSettings] = useState(blank);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api("/api/admin/website-settings")
      .then((data) => {
        if (data) setSettings(fillMissingDeep(blank, data));
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
  const updateGroup = (group, values) =>
    setSettings((current) => ({
      ...current,
      [group]: { ...(current[group] || {}), ...values },
    }));
  const updateLinks = (group, field, links) =>
    updateGroup(group, { [field]: links });
  const linksEditor = (title, group, field, includeIcon = false) => {
    const links = settings[group]?.[field] || [];
    return (
      <fieldset className="admin-section admin-repeater">
        <legend>{title}</legend>
        {links.map((item, index) => (
          <article key={index}>
            <div className="admin-repeat-heading">
              <strong>
                {title} {index + 1}
              </strong>
              <button
                type="button"
                onClick={() =>
                  updateLinks(
                    group,
                    field,
                    links.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <i className="fas fa-trash" /> Remove
              </button>
            </div>
            <div className="admin-card-fields">
              <label>
                Label
                <input
                  value={item.label || ""}
                  onChange={(event) =>
                    updateLinks(
                      group,
                      field,
                      links.map((link, itemIndex) =>
                        itemIndex === index
                          ? { ...link, label: event.target.value }
                          : link,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Link
                <input
                  value={item.link || ""}
                  onChange={(event) =>
                    updateLinks(
                      group,
                      field,
                      links.map((link, itemIndex) =>
                        itemIndex === index
                          ? { ...link, link: event.target.value }
                          : link,
                      ),
                    )
                  }
                />
              </label>
              {includeIcon && (
                <label>
                  Icon class
                  <input
                    value={item.icon || ""}
                    onChange={(event) =>
                      updateLinks(
                        group,
                        field,
                        links.map((link, itemIndex) =>
                          itemIndex === index
                            ? { ...link, icon: event.target.value }
                            : link,
                        ),
                      )
                    }
                  />
                </label>
              )}
            </div>
          </article>
        ))}
        <button
          type="button"
          className="admin-add admin-add-section"
          onClick={() =>
            updateLinks(group, field, [
              ...links,
              {
                label: "",
                link: "",
                ...(includeIcon ? { icon: "fas fa-link" } : {}),
              },
            ])
          }
        >
          <i className="fas fa-plus" /> Add link
        </button>
      </fieldset>
    );
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
          <legend>Header &amp; footer social media</legend>
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
        <fieldset className="admin-section">
          <legend>Header settings</legend>
          {linksEditor(
            "Navigation links",
            "header_settings",
            "navigation",
            true,
          )}
          <label>
            Action button text
            <input
              value={settings.header_settings?.button_text || ""}
              onChange={(event) =>
                updateGroup("header_settings", {
                  button_text: event.target.value,
                })
              }
            />
          </label>
          <label>
            Action button link
            <input
              value={settings.header_settings?.button_link || ""}
              onChange={(event) =>
                updateGroup("header_settings", {
                  button_link: event.target.value,
                })
              }
            />
          </label>
        </fieldset>
        <fieldset className="admin-section">
          <legend>Footer settings</legend>
          <label>
            Footer description
            <textarea
              rows="4"
              value={settings.footer_settings?.description || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  description: event.target.value,
                })
              }
            />
          </label>
          <label>
            First column title
            <input
              value={settings.footer_settings?.links_title || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  links_title: event.target.value,
                })
              }
            />
          </label>
          {linksEditor("Footer links", "footer_settings", "links")}
          <label>
            Second column title
            <input
              value={settings.footer_settings?.explore_title || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  explore_title: event.target.value,
                })
              }
            />
          </label>
          {linksEditor("Explore links", "footer_settings", "explore_links")}
          <label>
            Website link
            <input
              value={settings.footer_settings?.website_link || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  website_link: event.target.value,
                })
              }
            />
          </label>
          <label>
            Newsletter title
            <input
              value={settings.footer_settings?.newsletter_title || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  newsletter_title: event.target.value,
                })
              }
            />
          </label>
          <label>
            Newsletter description
            <textarea
              rows="3"
              value={settings.footer_settings?.newsletter_description || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  newsletter_description: event.target.value,
                })
              }
            />
          </label>
          <label>
            Copyright text
            <input
              value={settings.footer_settings?.copyright || ""}
              onChange={(event) =>
                updateGroup("footer_settings", {
                  copyright: event.target.value,
                })
              }
            />
          </label>
          {linksEditor("Policy links", "footer_settings", "policy_links")}
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
    banners: [
      {
        image: "/assets/images/backgrounds/slider-1-1.webp",
        short_title: "Integrated Healthcare Solutions",
        title: "Build Better Hospitals. Run Them Smarter.",
        subtitle:
          "From Hospital Planning to Digital Healthcare — We Do It All. HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance, accreditation and technology together through one integrated platform.",
        button_text: "Explore Solutions",
        button_link: "/services",
      },
      {
        image: "/assets/images/backgrounds/slider-2.webp",
        short_title: "Plan. Build. Commission.",
        title: "From Concept to a Fully Operational Hospital",
        subtitle:
          "Feasibility, planning, design, construction support, equipment, compliance, accreditation, software and operations through one integrated platform.",
        button_text: "Explore Solutions",
        button_link: "/services",
      },
      {
        image: "/assets/images/backgrounds/slider-3.webp",
        short_title: "Connected Digital Hospitals",
        title: "Hospital Software & AI for Smarter Healthcare",
        subtitle:
          "Turn your hospital into a connected digital ecosystem. Hospital ERP • HIS • EMR • Billing • Pharmacy • Laboratory • Radiology • Inventory • HR • Finance • Analytics • AI-powered workflows.",
        button_text: "Explore Solutions",
        button_link: "/services",
      },
    ],
    service_cards: [
      {
        background_image: "/assets/images/charity/charity-1-1.jpg",
        short_title: "Plan Better",
        title: "Hospital Planning & Design",
        button_link: "/hospital-planning",
      },
      {
        background_image: "/assets/images/charity/charity-1-2.jpg",
        short_title: "Build Quality",
        title: "NABH / NABL Compliance",
        button_link: "/nabh-nabl",
      },
      {
        background_image: "/assets/images/charity/charity-1-3.jpg",
        short_title: "Transform Digitally",
        title: "Hospital Software & AI",
        button_link: "/hospital-software",
      },
    ],
    about: {
      short_title: "About HosmedAI",
      title: "From Hospital Planning to Digital Healthcare — We Do It All.",
      description:
        "HosmedAI brings clinical planning, architecture, infrastructure, equipment, compliance, accreditation and technology together through one integrated platform.",
      image: "/assets/images/about/about-001.webp",
      stat_number: "360K",
      stat_text: "Integrated Capabilities",
      button_text: "Discover More",
      button_link: "/about",
      cards: [
        { title: "", description: "" },
        { title: "", description: "" },
      ],
    },
    contact: { image: "/assets/images/resources/contact-us.webp" },
    showcase: {
      short_title: "Integrated Healthcare Solutions",
      title: "Everything Your Hospital Needs",
      cards: [
        {
          image: "/assets/images/charity/charity-2-1.jpg",
          icon: "fas fa-drafting-compass",
          title: "Hospital Planning",
          description:
            "From feasibility and clinical planning to commissioning support.",
          button_text: "Learn More",
          button_link: "/hospital-planning",
        },
        {
          image: "/assets/images/charity/charity-2-2.jpg",
          icon: "fas fa-award",
          title: "Quality & Accreditation",
          description:
            "Practical NABH and NABL systems built for lasting quality.",
          button_text: "Learn More",
          button_link: "/nabh-nabl",
        },
        {
          image: "/assets/images/charity/charity-2-3.jpg",
          icon: "fas fa-laptop-medical",
          title: "Hospital Technology",
          description: "Connected ERP, HIS, EMR and operational intelligence.",
          button_text: "Learn More",
          button_link: "/hospital-software",
        },
        {
          image: "/assets/images/about/about-1-2.jpg",
          icon: "fas fa-brain",
          title: "Healthcare AI",
          description: "Turn hospital data into faster, smarter decisions.",
          button_text: "Learn More",
          button_link: "/ai-healthcare",
        },
      ],
    },
    testimonials: {
      short_title: "Client Experiences",
      title: "What Healthcare Leaders Say",
      items: [
        {
          quote:
            "HosmedAI brought planning, compliance and technology together with a practical understanding of hospital operations.",
          name: "Hospital Leadership Team",
          role: "Integrated Healthcare Project",
        },
        {
          quote:
            "Their structured approach helped our team improve workflows, documentation and accreditation readiness.",
          name: "Quality Management Team",
          role: "NABH Readiness Programme",
        },
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
      ],
      rating: "4.9",
      rating_title: "Client Satisfaction",
      rating_text: "End-to-end support",
    },
    difference: {
      short_title: "Why HosmedAI",
      title: "What Makes Us Different",
      features: [
        { icon: "fas fa-hospital", title: "Healthcare Focused" },
        { icon: "fas fa-link", title: "Fully Integrated" },
        { icon: "fas fa-user-md", title: "Expert Led" },
        { icon: "fas fa-chart-line", title: "Outcome Driven" },
      ],
      cta_short_title: "Start Your Hospital Journey",
      cta_title: "Build a Smarter, Safer and Future-Ready Hospital.",
      button_text: "Book a Consultation",
      button_link: "/contact",
    },
    faq_heading: { short_title: "FAQ", title: "Frequently Asked Questions" },
    faqs: [
      {
        question:
          "How does HosmedAI support a hospital from planning to operations?",
        answer:
          "HosmedAI works as one integrated healthcare partner across feasibility, clinical planning, architecture, equipment, accreditation, hospital software and operational support.",
      },
      {
        question:
          "Can HosmedAI help us plan a new hospital from the concept stage?",
        answer:
          "Yes. We support feasibility studies, service planning, departmental planning, clinical workflows, architecture coordination, infrastructure and equipment planning from concept through commissioning.",
      },
      {
        question: "Do you provide NABH and NABL accreditation consultancy?",
        answer:
          "Yes. Our team supports gap assessment, SOP development, quality systems, documentation, staff training, internal audits and accreditation readiness for NABH and NABL.",
      },
      {
        question: "Can HosmedAI digitise an existing hospital?",
        answer:
          "Yes. We help hospitals implement connected ERP, HIS, EMR, billing, pharmacy, laboratory, radiology, inventory, finance, analytics and AI-enabled workflows.",
      },
      {
        question:
          "Does HosmedAI work with small hospitals as well as large healthcare groups?",
        answer:
          "Yes. Our solutions are tailored for clinics, diagnostic centres, small and mid-sized hospitals, medical colleges, specialty hospitals and multi-location healthcare groups.",
      },
      {
        question: "Can we engage HosmedAI for only one specific service?",
        answer:
          "Yes. You can engage us for a focused requirement or use HosmedAI as an end-to-end partner across the complete hospital development and operations journey.",
      },
    ],
  },
  about: {
    banner: {
      image: "",
      title: "We Understand Hospitals Because We Understand Healthcare.",
      description:
        "HosmedAI brings hospital planning, design, compliance, accreditation, technology and operations together through one integrated healthcare platform.",
    },
    vision: {
      heading: "HosmedAI was created with a simple vision:",
      small_heading: "Our Vision",
      description:
        "Healthcare organisations often work with multiple consultants for planning, architecture, compliance, accreditation, technology and operations. HosmedAI brings these capabilities together.",
    },
    mission: {
      heading: "Healthcare First. Technology With Purpose. Quality By Design.",
      small_heading: "Our Philosophy",
      description:
        "We believe the best hospitals are created when clinical expertise, engineering, management, compliance and technology work together.",
    },
    what_we_do: {
      heading: "Everything Required to Plan, Build and Run Better Hospitals.",
      subheading:
        "One coordinated team connects every stage of hospital development, reducing complexity and helping healthcare organisations make better decisions.",
      cards: [
        {
          icon: "fas fa-drafting-compass",
          title: "Hospital Planning",
          description:
            "Feasibility, clinical planning, architecture, infrastructure and equipment planning.",
        },
        {
          icon: "fas fa-award",
          title: "Quality & Accreditation",
          description:
            "NABH, NABL, quality systems, SOPs, documentation, training and audit readiness.",
        },
        {
          icon: "fas fa-laptop-medical",
          title: "Hospital Technology",
          description:
            "ERP, HIS, EMR, analytics, connected workflows and purposeful healthcare AI.",
        },
        {
          icon: "fas fa-hospital-user",
          title: "Hospital Operations",
          description:
            "Operational planning, process design, performance improvement and ongoing support.",
        },
        {
          icon: "fas fa-shield-alt",
          title: "Compliance & Legal",
          description:
            "Regulatory approvals, policies, legal compliance and risk management.",
        },
        {
          icon: "fas fa-headset",
          title: "Training & Support",
          description:
            "Staff training, change management and continuous operational support.",
        },
      ],
    },
    faqs: [],
  },
  "why-hosmedai": {
    hero: {
      title: "Why Choose HosmedAI?",
      subtitle: "One Ecosystem. Multiple Capabilities.",
      description:
        "We bring together healthcare expertise, management consulting and technology to deliver better hospitals and better outcomes.",
    },
    cards: [
      {
        icon: "fas fa-route",
        title: "End-to-End Expertise",
        description: "From hospital concept to digital operations.",
      },
      {
        icon: "fas fa-heartbeat",
        title: "Healthcare-Focused",
        description:
          "Solutions designed specifically around healthcare workflows.",
      },
      {
        icon: "fas fa-puzzle-piece",
        title: "Integrated Approach",
        description:
          "Planning, compliance and technology designed to work together.",
      },
      {
        icon: "fas fa-microchip",
        title: "Technology Driven",
        description:
          "Modern hospital management powered by cloud technology and AI.",
      },
      {
        icon: "fas fa-chart-line",
        title: "Scalable",
        description:
          "Designed for clinics, nursing homes, diagnostic centres and multi-specialty hospitals.",
      },
      {
        icon: "fas fa-handshake",
        title: "Long-Term Partnership",
        description: "We help you build and evolve beyond implementation.",
      },
    ],
  },
  "hospital-planning": {
    hero: {
      title: "Your Hospital Starts With the Right Plan.",
      subtitle:
        "Design for Patients. Plan for Efficiency. Build for the Future.",
      description:
        "A successful hospital is a carefully engineered healthcare ecosystem where patients, doctors, nurses, technology, equipment and information move efficiently.",
    },
    what_we_do: {
      cards: [
        {
          icon: "fas fa-file-medical-alt",
          title: "Hospital feasibility studies",
          description:
            "Evaluate opportunities, risks and viability to ensure the right start.",
        },
        {
          icon: "fas fa-chart-line",
          title: "Business & project planning",
          description:
            "Comprehensive business models and project roadmaps for success.",
        },
        {
          icon: "fas fa-bed",
          title: "Bed-capacity planning",
          description:
            "Optimal bed mix and capacity planning for current and future demand.",
        },
        {
          icon: "fas fa-stethoscope",
          title: "Clinical department planning",
          description: "Designing efficient, connected clinical departments.",
        },
        {
          icon: "fas fa-hospital",
          title: "Hospital master planning",
          description:
            "Strategic master plans that align growth, infrastructure and vision.",
        },
        {
          icon: "fas fa-ruler-combined",
          title: "Architectural planning",
          description:
            "Functional, aesthetic and sustainable architectural designs.",
        },
        {
          icon: "fas fa-project-diagram",
          title: "Functional & workflow planning",
          description:
            "Smart workflows that improve efficiency and patient experience.",
        },
        {
          icon: "fas fa-procedures",
          title: "OT & ICU planning",
          description:
            "Specialized planning for OT suites, ICU and critical care areas.",
        },
        {
          icon: "fas fa-ambulance",
          title: "Emergency department planning",
          description:
            "Designing high-performance emergency departments for faster care.",
        },
        {
          icon: "fas fa-user-md",
          title: "OPD planning",
          description:
            "Patient-friendly OPD layouts that reduce wait times and crowding.",
        },
        {
          icon: "fas fa-microscope",
          title: "Diagnostic department planning",
          description:
            "Efficient layouts for labs, radiology and advanced diagnostics.",
        },
        {
          icon: "fas fa-clipboard-list",
          title: "Equipment planning",
          description: "Right equipment, right quantity and right placement.",
        },
      ],
    },
  },
  "nabh-nabl": {
    hero: {
      title: "Accreditation Is More Than a Certificate.",
      subtitle: "It’s a Culture of Quality.",
      description:
        "HosmedAI helps hospitals and diagnostic laboratories build systems that are quality-driven, patient-centric and accreditation-ready.",
    },
    page_content: "",
  },
  "hospital-software": {
    hero: {
      title: "Your Hospital. One Intelligent Digital Ecosystem.",
      subtitle: "Replace Fragmented Systems With One Connected Platform.",
      description:
        "HosmedAI Hospital Software is designed to connect the critical functions of a modern hospital through a single digital ecosystem.",
    },
    page_content: "",
    core_modules: [
      {
        icon: "fas fa-user-injured",
        title: "Patient Management",
        points: "Registration, Appointment, OPD, IPD, Emergency, Discharge",
      },
      {
        icon: "fas fa-stethoscope",
        title: "Clinical",
        points:
          "EMR, Doctor Dashboard, Nursing, OT Management, ICU, Clinical Documentation",
      },
      {
        icon: "fas fa-flask",
        title: "Diagnostics",
        points: "Laboratory, Radiology, PACS Integration, Pathology, Reporting",
      },
      {
        icon: "fas fa-cogs",
        title: "Hospital Operations",
        points:
          "Pharmacy, Inventory, Purchase, Stores, Biomedical Equipment, Housekeeping",
      },
      {
        icon: "fas fa-chart-bar",
        title: "Business",
        points: "Billing, Insurance, TPA, Finance, HR & Payroll, MIS",
      },
    ],
  },
  "ai-healthcare": {
    hero: {
      title: "Intelligence Behind Every Hospital Decision.",
      subtitle: "The Future of Hospital Management Is Intelligent.",
      description:
        "HosmedAI combines hospital data, workflows and artificial intelligence to help healthcare organisations operate more efficiently.",
    },
    page_content: "",
    possibilities: [
      {
        icon: "fas fa-tachometer-alt",
        title: "Management Dashboards",
        description:
          "Real-time overview of key hospital metrics in one intelligent dashboard.",
      },
      {
        icon: "fas fa-chart-pie",
        title: "Operational Analytics",
        description:
          "Deep insights into daily operations to improve efficiency and outcomes.",
      },
      {
        icon: "fas fa-chart-line",
        title: "Predictive Insights",
        description:
          "AI models predict trends and help you stay ahead of challenges.",
      },
      {
        icon: "fas fa-file-medical-alt",
        title: "Automated Reporting",
        description:
          "Reduce manual work with smart, automated and accurate reports.",
      },
      {
        icon: "fas fa-project-diagram",
        title: "Workflow Optimisation",
        description:
          "Identify bottlenecks and optimise processes across departments.",
      },
      {
        icon: "fas fa-rupee-sign",
        title: "Revenue Intelligence",
        description:
          "Track performance, detect opportunities and improve financial outcomes.",
      },
      {
        icon: "fas fa-users-cog",
        title: "Resource Utilisation",
        description:
          "Optimise the use of beds, staff, OT, equipment and other resources.",
      },
      {
        icon: "fas fa-procedures",
        title: "Patient-Flow Analytics",
        description:
          "Monitor patient journeys and improve flow from admission to discharge.",
      },
      {
        icon: "fas fa-shield-alt",
        title: "Quality Monitoring",
        description:
          "Track quality indicators and ensure compliance with standards.",
      },
      {
        icon: "fas fa-brain",
        title: "Decision-Support Tools",
        description:
          "AI-driven recommendations to support smarter clinical and operational decisions.",
      },
    ],
  },
  solutions: {
    hero: {
      title: "Solutions for Every Stage of Your Healthcare Journey.",
      subtitle: "Our Solutions",
      description:
        "From planning to operations, our complete end-to-end solutions help you build smarter, compliant and future-ready hospitals.",
    },
    page_content: "",
    what_we_serve: [
      {
        icon: "fas fa-hospital",
        short_title: "STARTING A HOSPITAL?",
        title: "Hospital Planning & Design",
        description:
          "Feasibility studies, architectural master planning, clinical layouts, equipment planning and functional design.",
        button_link: "/contact",
      },
      {
        icon: "fas fa-users-cog",
        short_title: "BUILDING A HOSPITAL?",
        title: "Project & Clinical Consultancy",
        description:
          "End-to-end project management, clinical workflow planning, vendor coordination and quality assurance.",
        button_link: "/contact",
      },
      {
        icon: "fas fa-award",
        short_title: "SEEKING ACCREDITATION?",
        title: "NABH / NABL Consultancy",
        description:
          "Complete support for NABH, NABL accreditation, documentation, training and compliance readiness.",
        button_link: "/contact",
      },
      {
        icon: "fas fa-cogs",
        short_title: "RUNNING A HOSPITAL?",
        title: "Hospital Management Solutions",
        description:
          "Operations management, HR, finance, supply chain, patient experience and performance improvement.",
        button_link: "/contact",
      },
      {
        icon: "fas fa-desktop",
        short_title: "DIGITISING YOUR HOSPITAL?",
        title: "Hospital ERP / HIS",
        description:
          "Integrated Hospital Information Systems, EMR, billing, inventory, pharmacy and reporting.",
        button_link: "/contact",
      },
      {
        icon: "fas fa-brain",
        short_title: "WANT SMARTER OPERATIONS?",
        title: "AI & Healthcare Analytics",
        description:
          "AI-powered insights, predictive analytics, dashboards and decision support for better outcomes.",
        button_link: "/contact",
      },
    ],
  },
  contact: {
    hero: {
      title: "Let’s Build Better Healthcare Together.",
      description:
        "Whether you are planning a new hospital, improving an existing facility or exploring digital healthcare solutions, our team is ready to help.",
    },
    page_content: "",
  },
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
  return fillMissingDeep(
    defaults,
    parsed && typeof parsed === "object" ? parsed : {},
  );
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
              {text("Button text", item.button_text, (value) =>
                change({ button_text: value }),
              )}
              {text("Button link", item.button_link, (value) =>
                change({ button_link: value }),
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
            button_text: "Explore Solutions",
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
              {text("Button text", item.button_text, (value) =>
                change({ button_text: value }),
              )}
              {text("Button link", item.button_link, (value) =>
                change({ button_link: value }),
              )}
            </div>
          )}
        </RepeatEditor>
        <fieldset className="admin-section">
          <legend>Home page about</legend>
          {text("Short title", sections.about?.short_title, (value) =>
            group("about", { short_title: value }),
          )}
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
          <div className="admin-grid admin-grid--2">
            {text("Stat number", sections.about?.stat_number, (value) =>
              group("about", { stat_number: value }),
            )}
            {text("Stat text", sections.about?.stat_text, (value) =>
              group("about", { stat_text: value }),
            )}
            {text("Button text", sections.about?.button_text, (value) =>
              group("about", { button_text: value }),
            )}
            {text("Button link", sections.about?.button_link, (value) =>
              group("about", { button_link: value }),
            )}
          </div>
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
        <fieldset className="admin-section">
          <legend>Service showcase</legend>
          {text("Short title", sections.showcase?.short_title, (value) =>
            group("showcase", { short_title: value }),
          )}
          {text("Title", sections.showcase?.title, (value) =>
            group("showcase", { title: value }),
          )}
          <RepeatEditor
            title="Showcase cards"
            items={sections.showcase?.cards || []}
            blank={{
              image: "",
              icon: "fas fa-hospital",
              title: "",
              description: "",
              button_text: "Learn More",
              button_link: "",
            }}
            onChange={(value) => group("showcase", { cards: value })}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                <ImageField
                  label="Card image"
                  value={item.image}
                  onChange={(value) => change({ image: value })}
                  upload={upload}
                />
                {text("Icon class", item.icon, (value) =>
                  change({ icon: value }),
                )}
                {text("Title", item.title, (value) => change({ title: value }))}
                {text(
                  "Description",
                  item.description,
                  (value) => change({ description: value }),
                  true,
                )}
                {text("Button text", item.button_text, (value) =>
                  change({ button_text: value }),
                )}
                {text("Button link", item.button_link, (value) =>
                  change({ button_link: value }),
                )}
              </div>
            )}
          </RepeatEditor>
        </fieldset>
        <fieldset className="admin-section">
          <legend>Testimonials</legend>
          {text("Short title", sections.testimonials?.short_title, (value) =>
            group("testimonials", { short_title: value }),
          )}
          {text("Title", sections.testimonials?.title, (value) =>
            group("testimonials", { title: value }),
          )}
          <RepeatEditor
            title="Testimonials"
            items={sections.testimonials?.items || []}
            blank={{ quote: "", name: "", role: "" }}
            onChange={(value) => group("testimonials", { items: value })}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                {text(
                  "Quote",
                  item.quote,
                  (value) => change({ quote: value }),
                  true,
                )}
                {text("Name", item.name, (value) => change({ name: value }))}
                {text("Role / project", item.role, (value) =>
                  change({ role: value }),
                )}
              </div>
            )}
          </RepeatEditor>
          {text("Rating", sections.testimonials?.rating, (value) =>
            group("testimonials", { rating: value }),
          )}
          {text("Rating title", sections.testimonials?.rating_title, (value) =>
            group("testimonials", { rating_title: value }),
          )}
          {text("Rating text", sections.testimonials?.rating_text, (value) =>
            group("testimonials", { rating_text: value }),
          )}
        </fieldset>
        <fieldset className="admin-section">
          <legend>What Makes Us Different</legend>
          {text("Short title", sections.difference?.short_title, (value) =>
            group("difference", { short_title: value }),
          )}
          {text("Title", sections.difference?.title, (value) =>
            group("difference", { title: value }),
          )}
          <RepeatEditor
            title="Features"
            items={sections.difference?.features || []}
            blank={{ icon: "fas fa-check", title: "" }}
            onChange={(value) => group("difference", { features: value })}
          >
            {(item, _index, change) => (
              <div className="admin-card-fields">
                {text("Icon class", item.icon, (value) =>
                  change({ icon: value }),
                )}
                {text("Title", item.title, (value) => change({ title: value }))}
              </div>
            )}
          </RepeatEditor>
          {text(
            "CTA short title",
            sections.difference?.cta_short_title,
            (value) => group("difference", { cta_short_title: value }),
          )}
          {text("CTA title", sections.difference?.cta_title, (value) =>
            group("difference", { cta_title: value }),
          )}
          {text("Button text", sections.difference?.button_text, (value) =>
            group("difference", { button_text: value }),
          )}
          {text("Button link", sections.difference?.button_link, (value) =>
            group("difference", { button_link: value }),
          )}
        </fieldset>
        <fieldset className="admin-section">
          <legend>FAQ heading</legend>
          {text("Short title", sections.faq_heading?.short_title, (value) =>
            group("faq_heading", { short_title: value }),
          )}
          {text("Title", sections.faq_heading?.title, (value) =>
            group("faq_heading", { title: value }),
          )}
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
            <RichTextEditor
              value={sections.page_content || ""}
              onChange={(value) => set("page_content", value)}
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
    ...(pageMetadataDefaults[pageKey] || {}),
    page_title: pageMetadataDefaults[pageKey]?.page_title || "",
    seo_description: pageMetadataDefaults[pageKey]?.seo_description || "",
    hero_title: pageMetadataDefaults[pageKey]?.hero_title || "",
    hero_subtitle: pageMetadataDefaults[pageKey]?.hero_subtitle || "",
    body: pageMetadataDefaults[pageKey]?.body || "",
    image_url: "",
    status: "published",
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
        const next = fillMissing(blank, data);
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
          <RichTextEditor
            value={page.body || ""}
            onChange={(value) =>
              setPage((current) => ({ ...current, body: value }))
            }
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
    page_title: pageMetadataDefaults[pageKey]?.page_title || "",
    seo_description: pageMetadataDefaults[pageKey]?.seo_description || "",
    status: "published",
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
        const next = fillMissing(blank, data);
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

const emptyTestimonial = {
  project_name: "",
  client_name: "",
  star_rating: 5,
  review: "",
  status: "published",
};

function TestimonialManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyTestimonial);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const load = () =>
    api("/api/admin/testimonials")
      .then(setItems)
      .catch((error) => setMessage(error.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setMessage("Saving…");
    try {
      await api(
        editing
          ? `/api/admin/testimonials/${editing}`
          : "/api/admin/testimonials",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(form),
        },
      );
      setForm(emptyTestimonial);
      setEditing(null);
      setMessage("Testimonial saved.");
      await load();
      setView("list");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const choose = (item) => {
    setEditing(item.id);
    setForm({
      project_name: item.project_name,
      client_name: item.client_name,
      star_rating: item.star_rating,
      review: item.review,
      status: item.status,
    });
    setView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (item) => {
    if (!confirm(`Delete testimonial from “${item.client_name}”?`)) return;
    await api(`/api/admin/testimonials/${item.id}`, { method: "DELETE" });
    if (editing === item.id) {
      setEditing(null);
      setForm(emptyTestimonial);
    }
    await load();
  };
  return (
    <section
      className={`admin-layout admin-content-manager admin-entry-manager testimonial-${view}-view`}
    >
      <form className="admin-editor" onSubmit={save}>
        <div className="admin-title">
          <h1>{editing ? "Edit testimonial" : "Testimonial Entry"}</h1>
          <button
            type="button"
            className="admin-entry-back"
            onClick={() => setView("list")}
          >
            <i className="fas fa-arrow-left" /> Back to list
          </button>
        </div>
        <label>
          Project Name
          <input
            required
            value={form.project_name}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          />
        </label>
        <label>
          Client Name
          <input
            required
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />
        </label>
        <label>
          Star Rating
          <select
            value={form.star_rating}
            onChange={(e) =>
              setForm({ ...form, star_rating: Number(e.target.value) })
            }
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star{rating === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Review
          <textarea
            required
            rows="7"
            value={form.review}
            onChange={(e) => setForm({ ...form, review: e.target.value })}
          />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        {message && (
          <p
            className={
              message.includes("saved") ? "admin-success" : "admin-error"
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">
          {editing ? "Update testimonial" : "Add testimonial"}
        </button>
      </form>
      <section className="admin-list">
        <div className="admin-entry-list-heading">
          <div>
            <small>Content</small>
            <h2>
              Testimonials <span>{items.length}</span>
            </h2>
            <p>Manage client reviews and project testimonials.</p>
          </div>
          <button
            type="button"
            className="admin-entry-add"
            onClick={() => {
              setEditing(null);
              setForm(emptyTestimonial);
              setMessage("");
              setView("editor");
            }}
          >
            <i className="fas fa-plus" /> Add Testimonial
          </button>
        </div>
        <label className="admin-entry-search">
          <i className="fas fa-search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by client or project…"
          />
        </label>
        {!items.length && <p>No testimonials yet.</p>}
        {items
          .filter((item) =>
            `${item.client_name} ${item.project_name} ${item.review}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((item) => (
            <article className="admin-list-text" key={item.id}>
              <div>
                <span className={`admin-status ${item.status}`}>
                  {item.status}
                </span>
                <h3>{item.client_name}</h3>
                <small>
                  {item.project_name} · {"★".repeat(item.star_rating)}
                </small>
                <p>{item.review}</p>
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
}

function PolicyEditor({ policyKey, title }) {
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setMessage("");
    api(`/api/admin/policies/${policyKey}`)
      .then((data) => setBody(data.body || ""))
      .catch((error) => setMessage(error.message));
  }, [policyKey]);
  const save = async (event) => {
    event.preventDefault();
    setMessage("Saving…");
    try {
      await api(`/api/admin/policies/${policyKey}`, {
        method: "PUT",
        body: JSON.stringify({ body }),
      });
      setMessage(`${title} saved.`);
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <section className="admin-page-editor">
      <div className="admin-page-heading">
        <div>
          <small>Content</small>
          <h1>{title}</h1>
          <p>Manage the content displayed on the {title.toLowerCase()} page.</p>
        </div>
      </div>
      <form className="admin-page-fields" onSubmit={save}>
        <fieldset>
          <legend>{title} (Editor)</legend>
          <label>
            Page Content
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder={`Write the ${title.toLowerCase()} here…`}
            />
          </label>
        </fieldset>
        {message && (
          <p
            className={
              message.includes("saved") ? "admin-success" : "admin-error"
            }
          >
            {message}
          </p>
        )}
        <button className="admin-primary">Save {title}</button>
      </form>
    </section>
  );
}

function ReportsManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [message, setMessage] = useState("");
  const load = () =>
    api("/api/admin/enquiries")
      .then(setEnquiries)
      .catch((error) => setMessage(error.message));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setEnquiries((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  const remove = async (item) => {
    if (!confirm(`Delete enquiry from ${item.name || item.email}?`)) return;
    await api(`/api/admin/enquiries/${item.id}`, { method: "DELETE" });
    setEnquiries((current) => current.filter(({ id }) => id !== item.id));
  };

  const labels = {
    home_consultation: "Home consultation",
    contact: "Contact page",
    newsletter: "Newsletter",
  };
  const filtered = enquiries.filter((item) => {
    const matchesType = type === "all" || item.enquiry_type === type;
    const haystack = `${item.name || ""} ${item.organisation || ""} ${item.email || ""} ${item.phone || ""} ${item.message || ""}`.toLowerCase();
    return matchesType && haystack.includes(query.toLowerCase());
  });

  return (
    <section className="admin-reports">
      <div className="admin-reports__heading">
        <div>
          <small>Content</small>
          <h1>Reports</h1>
          <p>All website enquiries and newsletter subscriptions.</p>
        </div>
        <span>{enquiries.length} total</span>
      </div>
      <div className="admin-reports__filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, phone or organisationâ€¦"
        />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">All enquiries</option>
          <option value="home_consultation">Home consultation</option>
          <option value="contact">Contact page</option>
          <option value="newsletter">Newsletter</option>
        </select>
      </div>
      {message && <p className="admin-error">{message}</p>}
      {!filtered.length && <div className="admin-reports__empty">No enquiries found.</div>}
      <div className="admin-reports__list">
        {filtered.map((item) => (
          <article key={item.id}>
            <div className="admin-reports__meta">
              <strong>{labels[item.enquiry_type] || item.enquiry_type}</strong>
              <time>{new Date(item.created_at).toLocaleString()}</time>
            </div>
            <div className="admin-reports__details">
              <div><small>Name</small><b>{item.name || "â€”"}</b></div>
              <div><small>Organisation</small><b>{item.organisation || "â€”"}</b></div>
              <div><small>Email</small><a href={`mailto:${item.email}`}>{item.email}</a></div>
              <div><small>Phone</small>{item.phone ? <a href={`tel:${item.phone}`}>{item.phone}</a> : <b>â€”</b>}</div>
              {item.requirement && <div><small>Requirement</small><b>{item.requirement}</b></div>}
              {item.address && <div className="is-wide"><small>Address</small><p>{item.address}</p></div>}
              {item.message && <div className="is-wide"><small>Message</small><p>{item.message}</p></div>}
            </div>
            <div className="admin-reports__actions">
              <span className={`email-${item.email_status}`}>Email: {item.email_status}</span>
              <select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
              <button className="admin-delete" onClick={() => remove(item)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
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
  const [blogView, setBlogView] = useState("list");
  const [blogQuery, setBlogQuery] = useState("");

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
      setBlogView("list");
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
      category: item.category || "",
      author: item.author || "",
      published_at: item.published_at
        ? new Date(item.published_at).toISOString().slice(0, 16)
        : "",
      seo_title: item.seo_title || "",
      seo_description: item.seo_description || "",
      status: item.status,
    });
    setBlogView("editor");
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
    <section
      className={`admin-layout admin-entry-manager blog-${blogView}-view`}
    >
      <form className="admin-editor" onSubmit={save}>
        <div className="admin-title">
          <h1>{editing ? "Edit blog" : "Blog Entry"}</h1>
          <button
            type="button"
            className="admin-entry-back"
            onClick={() => setBlogView("list")}
          >
            <i className="fas fa-arrow-left" /> Back to blogs
          </button>
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
        <div className="admin-field-row">
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label>
            Author
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </label>
        </div>
        <label>
          Publish date
          <input
            type="datetime-local"
            value={form.published_at}
            onChange={(e) => setForm({ ...form, published_at: e.target.value })}
          />
        </label>
        <label>
          Blog Content (Editor)
          <RichTextEditor
            value={form.body}
            onChange={(value) => setForm({ ...form, body: value })}
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
        <fieldset>
          <legend>Search &amp; publishing</legend>
          <label>
            SEO title
            <input
              value={form.seo_title}
              onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
            />
          </label>
          <label>
            SEO description
            <textarea
              rows="3"
              maxLength="500"
              value={form.seo_description}
              onChange={(e) =>
                setForm({ ...form, seo_description: e.target.value })
              }
            />
          </label>
        </fieldset>
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
          {editing ? "Update blog" : "Create blog"}
        </button>
      </form>
      <section className="admin-list">
        <div className="admin-entry-list-heading">
          <div>
            <small>Content</small>
            <h2>
              Blogs <span>{items.length}</span>
            </h2>
            <p>Manage your website's blog posts.</p>
          </div>
          <button
            type="button"
            className="admin-entry-add"
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setMessage("");
              setBlogView("editor");
            }}
          >
            <i className="fas fa-plus" /> Add Blog
          </button>
        </div>
        <label className="admin-entry-search">
          <i className="fas fa-search" />
          <input
            value={blogQuery}
            onChange={(event) => setBlogQuery(event.target.value)}
            placeholder="Search by heading, category or author…"
          />
        </label>
        {items.length === 0 && <p>No blogs yet. Create your first entry.</p>}
        {items
          .filter((item) =>
            `${item.title} ${item.category || ""} ${item.author || ""}`
              .toLowerCase()
              .includes(blogQuery.toLowerCase()),
          )
          .map((item) => (
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
                {(item.category || item.author) && (
                  <small>
                    {[item.category, item.author].filter(Boolean).join(" · ")}
                  </small>
                )}
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
          <button
            className={`admin-library-link ${section === "blogs" ? "active" : ""}`}
            onClick={() => {
              setSection("blogs");
              setBlogView("list");
            }}
          >
            <i className="fas fa-newspaper" />
            <span>Blog Entry</span>
          </button>
          <button
            className={`admin-library-link ${section === "testimonials" ? "active" : ""}`}
            onClick={() => setSection("testimonials")}
          >
            <i className="fas fa-star" />
            <span>Testimonial Entry</span>
          </button>
          <button
            className={`admin-library-link ${section === "reports" ? "active" : ""}`}
            onClick={() => setSection("reports")}
          >
            <i className="fas fa-clipboard-list" />
            <span>Reports</span>
          </button>
          <button
            className={`admin-library-link ${section === "terms" ? "active" : ""}`}
            onClick={() => setSection("terms")}
          >
            <i className="fas fa-file-contract" />
            <span>Terms &amp; Condition</span>
          </button>
          <button
            className={`admin-library-link ${section === "privacy" ? "active" : ""}`}
            onClick={() => setSection("privacy")}
          >
            <i className="fas fa-user-shield" />
            <span>Privacy Policy</span>
          </button>
          <button
            className={`admin-library-link ${section === "cookie" ? "active" : ""}`}
            onClick={() => setSection("cookie")}
          >
            <i className="fas fa-cookie-bite" />
            <span>Cookie Policy</span>
          </button>
        </aside>
        <section className="admin-workspace">
          {section === "general" ? (
            <GeneralSettings />
          ) : section === "page" ? (
            <PageEditor pageKey={pageKey} />
          ) : section === "content" ? (
            <GalleryManager />
          ) : section === "blogs" ? (
            contentLibrary
          ) : section === "testimonials" ? (
            <TestimonialManager />
          ) : section === "reports" ? (
            <ReportsManager />
          ) : section === "terms" ? (
            <PolicyEditor policyKey="terms" title="Terms & Conditions" />
          ) : section === "privacy" ? (
            <PolicyEditor policyKey="privacy" title="Privacy Policy" />
          ) : (
            <PolicyEditor policyKey="cookie" title="Cookie Policy" />
          )}
        </section>
      </div>
    </main>
  );
}
