import { useMemo, useState } from "react";

const CONTENT_GROUPS = [
  { title: "Navigation", keys: ["switchTo", "switchAria", "backToTop", "dark", "light", "themeAria", "n"] },
  { title: "Introduction", keys: ["hi", "iam", "typed", "summary", "seeProjects", "getInTouch", "stats"] },
  { title: "About", keys: ["about", "facts", "services", "g"] },
  { title: "Projects", keys: ["cat", "filterAria", "empty", "live", "source"] },
  { title: "Experience and education", keys: ["experience", "education"] },
  { title: "Contact", keys: ["contactIntro", "f", "cv", "ask"] },
  { title: "Guestbook and chat", keys: ["gb", "chat"] },
  { title: "Playground and footer", keys: ["game", "play", "footer"] },
];

const PROFILE_GROUPS = [
  { title: "Personal details", keys: ["name", "name_km", "pageTitle", "initials"] },
  { title: "Contact details", keys: ["email", "phone", "phoneLink", "cv", "cvEn", "cvKm", "socials"] },
  { title: "Profile appearance", keys: ["idTag", "onlineTag", "orbit"] },
  { title: "Skills", keys: ["skills"] },
];

const FIELD_LABELS = {
  name: "Name — English",
  name_km: "Name — Khmer",
  pageTitle: "Browser page title",
  initials: "Initials",
  email: "Email address",
  phone: "Phone number",
  phoneLink: "Phone link",
  cv: "Shared CV URL",
  cvEn: "English CV URL (legacy)",
  cvKm: "Khmer CV URL (legacy)",
  idTag: "Profile badge",
  onlineTag: "Location badge",
  orbit: "Floating badges",
  skills: "Skills",
  socials: "Social links",
  typed: "Animated job titles",
  hi: "Greeting",
  iam: "Introduction label",
  summary: "Short introduction",
  about: "About me",
  facts: "Quick facts",
  services: "Services",
  when: "Date or period",
  title: "Title",
  where: "Organization",
  points: "Details",
  items: "Included services",
  title_en: "English title",
  title_km: "Khmer title",
};

function labelFor(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return String(key)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function matchesQuery(label, value, query) {
  if (!query) return true;
  const needle = query.toLocaleLowerCase();
  if (label.toLocaleLowerCase().includes(needle)) return true;
  if (typeof value === "string" || typeof value === "number") {
    return String(value).toLocaleLowerCase().includes(needle);
  }
  if (Array.isArray(value)) {
    return value.some((item, index) => matchesQuery(`Item ${index + 1}`, item, needle));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) => matchesQuery(labelFor(key), item, needle));
  }
  return false;
}

function emptyLike(value) {
  if (Array.isArray(value)) return value.map(emptyLike);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, emptyLike(item)]));
  }
  return typeof value === "number" ? 0 : "";
}

function emptyItem(path, value) {
  if (value.length > 0) return emptyLike(value[0]);
  switch (path.at(-1)) {
    case "experience":
    case "education":
      return { when: "", title: "", where: "", points: [] };
    case "services":
      return { title: "", items: [] };
    case "stats":
    case "facts":
    case "socials":
      return ["", ""];
    default:
      return "";
  }
}

function updateAtPath(value, path, nextValue) {
  if (path.length === 0) return nextValue;
  const [key, ...rest] = path;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  copy[key] = updateAtPath(value[key], rest, nextValue);
  return copy;
}

function removeAtPath(value, path) {
  const [key, ...rest] = path;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  if (rest.length === 0 && Array.isArray(copy)) {
    copy.splice(key, 1);
    return copy;
  }
  copy[key] = removeAtPath(value[key], rest);
  return copy;
}

function itemLabel(value, index, path) {
  if (path.at(-1) === "socials") {
    return Array.isArray(value) && value[0] ? value[0] : `Social link ${index + 1}`;
  }
  if (path.at(-1) === "orbit") return `Badge ${index + 1}`;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const title = value.title || value.title_en || value.name;
    if (title) return `${index + 1}. ${title}`;
  }
  return `Item ${index + 1}`;
}

function childLabel(key, path) {
  const list = path.at(-1);
  if (list === "socials") return key === 0 ? "Platform name" : "Profile URL";
  if (list === "stats") return key === 0 ? "Value" : "Description";
  if (list === "facts") return key === 0 ? "Label" : "Details";
  if (list === "typed" || list === "orbit" || list === "points" || list === "items") return "Text";
  return labelFor(key);
}

function ContentNode({ label, value, path, rootValue, onChange, query = "" }) {
  if (!matchesQuery(label, value, query)) return null;

  if (Array.isArray(value)) {
    const labelMatches = Boolean(query) && label.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    const simpleList = value.every((item) => item === null || typeof item !== "object");
    const tupleList = value.length > 0 && value.every((item) => (
      Array.isArray(item) && item.every((field) => field === null || typeof field !== "object")
    ));
    const visibleItems = value
      .map((item, index) => ({ item, index, label: itemLabel(item, index, path) }))
      .filter(({ item, index, label: itemTitle }) => (
        !query || labelMatches || matchesQuery(itemTitle, item, query) || matchesQuery(`Item ${index + 1}`, item, query)
      ));

    return (
      <section className="admin-content-list">
        <div className="admin-content-list-heading">
          <div>
            <h4>{label}</h4>
            <span>{value.length} {value.length === 1 ? "item" : "items"}</span>
          </div>
          {!query && (
            <button
              type="button"
              className="admin-secondary"
              onClick={() => onChange(updateAtPath(rootValue, path, [emptyItem(path, value), ...value]))}
            >
              + Add item
            </button>
          )}
        </div>
        {value.length === 0 ? (
          <p className="admin-content-hint">No items yet. Add one if you want this section to appear.</p>
        ) : visibleItems.length === 0 ? (
          <p className="admin-content-hint">No matching items in this list.</p>
        ) : simpleList ? (
          <div className="admin-content-simple-list">
            {visibleItems.map(({ item, index }) => (
              <div className="admin-content-simple-row" key={index}>
                <ContentNode
                  label={`${label} ${index + 1}`}
                  value={item}
                  path={[...path, index]}
                  rootValue={rootValue}
                  onChange={onChange}
                  query={labelMatches ? "" : query}
                />
                {!query && (
                  <button
                    type="button"
                    className="admin-danger admin-text-button"
                    onClick={() => onChange(removeAtPath(rootValue, [...path, index]))}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : tupleList ? (
          <div className="admin-content-list-items">
            {visibleItems.map(({ item, index, label: title }) => (
              <div className="admin-content-item" key={index}>
                <div className="admin-content-item-heading">
                  <strong>{title}</strong>
                  {!query && (
                    <button
                      type="button"
                      className="admin-danger admin-text-button"
                      onClick={() => onChange(removeAtPath(rootValue, [...path, index]))}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="admin-content-fields">
                  {item.map((field, fieldIndex) => (
                    <ContentNode
                      key={fieldIndex}
                      label={childLabel(fieldIndex, path)}
                      value={field}
                      path={[...path, index, fieldIndex]}
                      rootValue={rootValue}
                      onChange={onChange}
                      query={labelMatches ? "" : query}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-content-list-items">
            {visibleItems.map(({ item, index, label: title }) => {
              const nextPath = [...path, index];
              return (
                <div className="admin-content-item" key={index}>
                  <div className="admin-content-item-heading">
                    <strong>{title}</strong>
                    {!query && (
                      <button
                        type="button"
                        className="admin-danger admin-text-button"
                        onClick={() => onChange(removeAtPath(rootValue, nextPath))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <ContentNode
                    label={title}
                    value={item}
                    path={nextPath}
                    rootValue={rootValue}
                    onChange={onChange}
                    query={labelMatches ? "" : query}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="admin-content-object">
        <h4>{label}</h4>
        <div className="admin-content-object-fields">
          {Object.entries(value).map(([key, item]) => (
            <ContentNode
              key={key}
              label={childLabel(key, path)}
              value={item}
              path={[...path, key]}
              rootValue={rootValue}
              onChange={onChange}
              query={query}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <label className="admin-content-field">
      <span>{label}</span>
      <textarea
        rows={String(value).length > 180 ? 5 : String(value).length > 80 ? 4 : 2}
        value={String(value)}
        onChange={(event) => onChange(updateAtPath(rootValue, path, event.target.value))}
      />
      {!query && value !== "" && (
        <button
          type="button"
          className="admin-secondary admin-text-button"
          onClick={() => onChange(updateAtPath(rootValue, path, ""))}
        >
          Clear
        </button>
      )}
    </label>
  );
}

function ContentSection({ group, value, rootValue, path, onChange, query }) {
  const entries = group.keys
    .filter((key) => Object.hasOwn(value, key))
    .filter((key) => matchesQuery(labelFor(key), value[key], query));
  if (!entries.length) return null;

  return (
    <section className="admin-content-section">
      <div className="admin-content-section-heading">
        <h3>{group.title}</h3>
        <p>{query ? "Matching content and text fields." : "Edit the fields in this part of your portfolio."}</p>
      </div>
      <div className="admin-content-fields">
        {entries.map((key) => (
          <ContentNode
            key={key}
            label={labelFor(key)}
            value={value[key]}
            path={[...path, key]}
            rootValue={rootValue}
            onChange={onChange}
            query={query}
          />
        ))}
      </div>
    </section>
  );
}

function ContentCategoryEditor({ groups, value, rootValue, path, onChange, query, selected, onSelect }) {
  const availableGroups = useMemo(() => groups.map((group) => ({
    ...group,
    hasContent: group.keys.some((key) => (
      Object.hasOwn(value, key) && matchesQuery(labelFor(key), value[key], query)
    )),
  })).filter((group) => group.hasContent), [groups, query, value]);
  const current = availableGroups.find((group) => group.title === selected);
  const visibleGroups = query ? availableGroups : current ? [current] : [];

  return (
    <>
      {query ? (
        <p className="admin-search-summary" role="status">
          Search results across {availableGroups.length} {availableGroups.length === 1 ? "section" : "sections"}.
          Clear search to return to section navigation.
        </p>
      ) : (
        <nav className="admin-content-section-nav" aria-label="Content sections">
          {groups.map((group) => (
            <button
              key={group.title}
              type="button"
              className={selected === group.title ? "admin-content-section-button is-active" : "admin-content-section-button"}
              aria-current={selected === group.title ? "page" : undefined}
              onClick={() => onSelect(group.title)}
            >
              {group.title}
            </button>
          ))}
        </nav>
      )}
      <div className="admin-content-sections">
        {visibleGroups.map((group) => (
          <ContentSection
            key={group.title}
            group={group}
            value={value}
            rootValue={rootValue}
            path={path}
            onChange={onChange}
            query={query}
          />
        ))}
        {query && !visibleGroups.length && (
          <div className="admin-content-no-results">
            <strong>No matching text found</strong>
            <span>Try another word, or clear the search to browse all sections.</span>
          </div>
        )}
      </div>
    </>
  );
}

function BilingualContentEditor({ value, onChange, query, selected, onSelect }) {
  const availableGroups = useMemo(() => CONTENT_GROUPS.filter((group) => (
    group.keys.some((key) => (
      Object.hasOwn(value.en, key)
      && (matchesQuery(labelFor(key), value.en[key], query) || matchesQuery(labelFor(key), value.km[key], query))
    ))
  )), [query, value]);
  const current = availableGroups.find((group) => group.title === selected);
  const visibleGroups = query ? availableGroups : current ? [current] : [];

  return (
    <>
      {query ? (
        <p className="admin-search-summary" role="status">
          Search results across {availableGroups.length} {availableGroups.length === 1 ? "section" : "sections"} in both languages.
          Clear search to return to section navigation.
        </p>
      ) : (
        <nav className="admin-content-section-nav" aria-label="Bilingual content sections">
          {CONTENT_GROUPS.map((group) => (
            <button
              key={group.title}
              type="button"
              className={selected === group.title ? "admin-content-section-button is-active" : "admin-content-section-button"}
              aria-current={selected === group.title ? "page" : undefined}
              onClick={() => onSelect(group.title)}
            >
              {group.title}
            </button>
          ))}
        </nav>
      )}
      {visibleGroups.length ? (
        <div className="admin-bilingual-columns">
          {[
            ["en", "English", "LEFT"],
            ["km", "Khmer", "RIGHT"],
          ].map(([language, label]) => (
            <div className={`admin-bilingual-column admin-language-${language}`} key={language}>
              <h3><span>{label}</span><small>{language === "en" ? "LEFT COLUMN" : "RIGHT COLUMN"}</small></h3>
              {visibleGroups.map((group) => (
                <ContentSection
                  key={group.title}
                  group={group}
                  value={value[language]}
                  rootValue={value[language]}
                  path={[]}
                  onChange={(languageContent) => onChange({
                    ...value,
                    [language]: languageContent,
                  })}
                  query={query}
                />
              ))}
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="admin-content-no-results">
          <strong>No matching text found</strong>
          <span>Try another word, or clear search to browse all sections.</span>
        </div>
      ) : null}
    </>
  );
}

export default function ContentEditor({ value, onChange }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileSection, setProfileSection] = useState("Contact details");
  const [bilingualSection, setBilingualSection] = useState(CONTENT_GROUPS[0].title);
  const [query, setQuery] = useState("");
  const search = query.trim();
  return (
    <div className="admin-content-editor">
      <div className="admin-content-toolbar">
        <div className="admin-content-tabs" role="tablist" aria-label="Choose content language">
          {[
            ["profile", "Profile"],
            ["bilingual", "English + Khmer"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "admin-content-tab is-active" : "admin-content-tab"}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="admin-content-search">
          <span className="admin-content-search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${activeTab === "profile" ? "profile" : "English and Khmer"} content`}
            aria-label="Search website content"
          />
          {query && (
            <button type="button" className="admin-text-button" onClick={() => setQuery("")}>
              Clear
            </button>
          )}
        </label>
      </div>
      <p className="admin-content-help">
        {search
          ? "Search checks section names, field names, and saved text."
          : activeTab === "profile"
            ? "Edit your email, phone, CV links, and social profiles in Contact details. To change the contact introduction, choose English + Khmer → Contact. Save website content when finished."
            : "Choose a section to edit only those fields. Search to find text anywhere in this tab."}
      </p>
      {activeTab === "profile" ? (
        <ContentCategoryEditor
          groups={PROFILE_GROUPS}
          value={value.profile}
          rootValue={value.profile}
          path={[]}
          onChange={(profile) => onChange({ ...value, profile })}
          query={search}
          selected={profileSection}
          onSelect={setProfileSection}
        />
      ) : (
        <BilingualContentEditor
          value={value.text}
          onChange={(text) => onChange({ ...value, text })}
          query={search}
          selected={bilingualSection}
          onSelect={setBilingualSection}
        />
      )}
    </div>
  );
}
