export function normalizeProjectImage(project) {
  return {
    ...project,
    image: project.image?.replace(/^https?:\/\/localhost(?::\d+)?(?=\/storage\/)/, "") || "",
  };
}

export function translateProjects(projects, language) {
  return projects.map((rawProject) => {
    const project = normalizeProjectImage(rawProject);
    return {
      ...project,
      title: language === "km" && project.title_km ? project.title_km : project.title_en,
      description: language === "km" && project.description_km
        ? project.description_km
        : project.description_en,
    };
  });
}
