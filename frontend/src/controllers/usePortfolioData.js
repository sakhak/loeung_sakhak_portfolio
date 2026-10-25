import { useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from "../models/siteContent.js";
import { normalizeProjectImage } from "../models/projects.js";

export default function usePortfolioData() {
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const [projects, setProjects] = useState([]);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSiteContent() {
      try {
        const response = await fetch("/api/content");
        if (!response.ok) throw new Error(`Site content request failed (${response.status})`);
        const data = await response.json();
        if (active) {
          const savedContent = mergeSiteContent(DEFAULT_SITE_CONTENT, data.content);
          setSiteContent({
            ...savedContent,
            profile: {
              ...savedContent.profile,
              photo: data.content?.profile?.photo || "",
            },
          });
        }
      } catch (error) {
        console.error("Unable to load saved site content.", error);
      }
    }

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error(`Project request failed (${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("The projects response was not a list.");
        if (active) {
          setProjects(data.map(normalizeProjectImage));
          setProjectError("");
        }
      } catch (error) {
        if (active) setProjectError(error.message);
      }
    }

    loadSiteContent();
    loadProjects();
    return () => { active = false; };
  }, []);

  return { siteContent, projects, projectError };
}
