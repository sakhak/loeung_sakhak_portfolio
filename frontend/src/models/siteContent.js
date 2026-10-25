/* =====================================================================
   1. PORTFOLIO DEFAULTS
   ===================================================================== */

/* YOUR PHOTO: put your picture in your project's  public/  folder and name it
   profile.jpg  (so the file is  public/profile.jpg).  Square photos look best.
   If the file is missing, the page shows your initials instead. */
export const PHOTO = "/profile.jpg";

const NAME = "Loeung SakHak";
const INITIALS = "SK";
const EMAIL = "loeungsakhak438@gmail.com";
const PHONE = "(+855) 016 607 238";
const PHONE_LINK = "+85516607238";
export const CONTACT_ENDPOINT = "/api/contact";

/* LITE MODE (uses less RAM and power): "auto" turns it on only for weak computers,
   true = always on, false = always off. Visitors can also toggle it in the Playground. */
export const START_LITE = "auto";

/* Put your shared CV file in the public folder: public/cv.pdf */
export const CV = "/cv.pdf";
export const CV_EN = CV;
export const CV_KM = CV;
export const GUESTBOOK_ENDPOINT = "/api/guestbook";
export const CHAT_ENDPOINT = "/api/chat.php";
export const TIME_MODES = ["auto", "day", "dusk", "night"];

export const categories = ["All", "Full-stack", "API", "Frontend"];

/* colour themes visitors can pick in the Playground */
export const palettes = [
  { id: "neon", a: "#8a5cff", b: "#ff2e93", c: "#00f0ff" },
  { id: "sunset", a: "#ff8a00", b: "#ff2e63", c: "#ffd84d" },
  { id: "toxic", a: "#39ff14", b: "#00c2a8", c: "#d4ff00" },
  { id: "ice", a: "#4da3ff", b: "#9b8cff", c: "#a8f0ff" },
  { id: "ember", a: "#ff3b30", b: "#ff8a00", c: "#ffd0a8" },
];
const orbit = ["React", "Laravel", "Ps", "Pr"]; /* badges floating around your photo */
const skills = {
  Code: ["HTML", "CSS", "JavaScript", "React", "PHP", "Laravel", "SQL", "C#"],
  Design: ["Adobe Photoshop", "Adobe Illustrator"],
  Video: ["Adobe Premiere Pro", "Adobe After Effects"],
};
export const icons = ["</>", "◐", "▶"];
const socials = [
  ["GitHub", "https://github.com/sakhak"],
  ["LinkedIn", "https://www.linkedin.com/in/sakhak-loeung-4149a532a/"],
  ["Facebook", "https://www.facebook.com/sakhak.loeung.1"],
  ["Telegram", "https://t.me/sakhak_loeung"],
];

/* English and Khmer fallback copy. Edit the saved version from /admin. */
export const text = {
  en: {
    switchTo: "ខ្មែរ", switchAria: "Switch to Khmer",
    backToTop: "Back to top",
    dark: "Dark mode", light: "Light mode", themeAria: "Switch between light and dark mode",
    n: { about: "About", skills: "Skills", projects: "Projects", experience: "Experience", education: "Education", contact: "Contact", guestbook: "Guestbook", showcase: "3D showcase" },
    hi: "Hello, I am from Phnom Penh, Cambodia", iam: "I'm",
    typed: ["Full-Stack Developer", "Graphic Designer", "Video Editor"],
    summary: "I build responsive web apps, design brands and cut videos, with a focus on clean experience and reliable code.",
    seeProjects: "See my projects", getInTouch: "Get in touch",
    stats: [["5", "Projects built"], ["1+", "Year of experience"], ["3", "Creative skills"]],
    about: "I am a creative and motivated full-stack developer based in Phnom Penh, Cambodia. I build modern, responsive web applications and design clean visual experiences that combine strong technical skills with creativity. I enjoy developing useful digital products, creating polished user interfaces, and producing professional visual content.",
    facts: [["City", "Phnom Penh"], ["Nationality", "Cambodian"], ["Experience", "1+ year"], ["Languages", "Khmer (native), English (intermediate)"]],
    services: [
      { title: "Full-stack development", items: ["Responsive web applications", "React and Laravel", "REST API integration", "Clean, easy-to-use interfaces"] },
      { title: "Graphic design", items: ["Branding", "Social media design", "UI assets and visual content"] },
      { title: "Video editing", items: ["Video production and editing", "Motion graphics", "Visual storytelling"] },
    ],
    g: { Code: "Code", Design: "Design", Video: "Video" },
    cat: { All: "All", "Full-stack": "Full-stack", API: "API", Frontend: "Frontend" },
    filterAria: "Filter projects by type",
    empty: "No {category} projects yet. More coming soon.",
    live: "Live site", source: "Source code",
    experience: [
      { when: "2023 – Present", title: "IT Support Internship", where: "Pethyoeung Healthtech Co., LTD", points: ["Supported customers with app installation and setup", "Helped solve minor technical issues", "Improved user experience through clear guidance"] },
      { when: "2023 – 2024", title: "Personal Projects", where: "Independent", points: ["Built multiple front-end and full-stack projects", "Developed CRUD systems and reusable UI components", "Created a job search platform with React, Laravel and MySQL", "Built a user management system with Laravel Sanctum and role-based access control"] },
    ],
    education: [
      { when: "2022 – Present", title: "Information Technology", where: "SETEC Institute", points: ["Web development and programming fundamentals", "Software design and project-based learning"] },
      { when: "2021 – 2022", title: "High School (BacII)", where: "Chea Sim SonthorMok High School", points: [] },
    ],
    contactIntro: "Have a project in mind, or want to work together? Send me a message or reach me here:",
    f: { name: "Your name", email: "Your email", message: "Message", send: "Send message", sending: "Sending…", ok: "Message sent. I will reply to your email soon.", err: "The message was not sent. Email me directly at {email}." },
    cv: "Download CV", ask: "💬 Ask SakHak",
    show: "A little 3D laptop showing my projects. Drag it to turn it.",
    gb: { intro: "Leave a message, say hello or share feedback. New messages appear after I approve them.", name: "Your name", msg: "Your message", send: "Sign the guestbook", sending: "Sending…", ok: "Thank you! Your message will appear after I approve it.", err: "Could not send. Please try again later.", empty: "No messages yet. Be the first!" },
    chat: { title: "Ask SakHak", hello: "Hi! I am SakHak's assistant. Ask me about his skills, projects or how to hire him.", ph: "Type your question…", send: "Send", thinking: "Thinking…", offline: "(offline answer: the AI server is not connected yet)", s: ["What are your skills?", "Which projects did you build?", "How can I hire you?"] },
    game: { title: "Catch the shapes!", intro: "Catch as many shapes as you can in 30 seconds. Tap or click them!", start: "Start", score: "Score", best: "Best", time: "Time", over: "Time is up!", again: "Play again", close: "Close" },
    play: { open: "⚡ Playground", title: "Playground", color: "PICK YOUR NEON", warp: "🚀 Warp", matrix: "🌧 Matrix", confetti: "🎉 Confetti", terminal: "💻 Terminal", explode: "💥 Explode", soundOn: "🔊 Sound: on", soundOff: "🔇 Sound: off", tip: "Secrets: click my photo, hover my name, press the ` key, or try the Konami code ↑ ↑ ↓ ↓ ← → ← → B A", konami: "🎮 Konami code unlocked!", idle: "👀 Still there? Here is a little surprise.", liteOn: "🍃 Lite: on", liteOff: "🍃 Lite: off", magnetOn: "🧲 Magnet: on", magnetOff: "🧲 Magnet: off", fireworks: "🎆 Fireworks", game: "🎯 Catch game", timeAuto: "🕒 Time: auto", timeDay: "☀️ Time: day", timeDusk: "🌇 Time: dusk", timeNight: "🌙 Time: night", shake: "📳 Shake detected!", photo: "🏆 Secret unlocked: 7 clicks on my photo!" },
    footer: "© {year} {name}. Built with React.",
  },
  km: {
    switchTo: "EN", switchAria: "ប្តូរទៅភាសាអង់គ្លេស",
    backToTop: "ត្រឡប់ទៅលើវិញ",
    dark: "មុខងារងងឹត", light: "មុខងារភ្លឺ", themeAria: "ប្តូររវាងមុខងារភ្លឺ និងងងឹត",
    n: { about: "អំពីខ្ញុំ", skills: "ជំនាញ", projects: "គម្រោង", experience: "បទពិសោធន៍", education: "ការអប់រំ", contact: "ទំនាក់ទំនង", guestbook: "សៀវភៅភ្ញៀវ", showcase: "ការបង្ហាញ 3D" },
    hi: "សួស្តី ខ្ញុំមកពីភ្នំពេញ ប្រទេសកម្ពុជា", iam: "ខ្ញុំគឺ",
    typed: ["អ្នកអភិវឌ្ឍន៍ Full-Stack", "អ្នករចនាក្រាហ្វិក", "អ្នកកាត់តវីដេអូ"],
    summary: "ខ្ញុំបង្កើតកម្មវិធីគេហទំព័រដែលប្រើបានលើគ្រប់ឧបករណ៍ រចនាម៉ាកយីហោ និងកាត់តវីដេអូ ដោយផ្តោតលើបទពិសោធន៍ប្រើប្រាស់ស្អាត និងកូដដែលអាចទុកចិត្តបាន។",
    seeProjects: "មើលគម្រោងរបស់ខ្ញុំ", getInTouch: "ទាក់ទងខ្ញុំ",
    stats: [["5", "គម្រោងដែលបានបង្កើត"], ["1+", "ឆ្នាំនៃបទពិសោធន៍"], ["3", "ជំនាញច្នៃប្រឌិត"]],
    about: "ខ្ញុំជាអ្នកអភិវឌ្ឍន៍ full-stack ដែលមានគំនិតច្នៃប្រឌិត និងមានការលះបង់ រស់នៅភ្នំពេញ ប្រទេសកម្ពុជា។ ខ្ញុំបង្កើតកម្មវិធីគេហទំព័រទំនើបដែលប្រើបានលើគ្រប់ឧបករណ៍ និងរចនាបទពិសោធន៍មើលឃើញស្អាតៗ ដោយរួមបញ្ចូលជំនាញបច្ចេកទេសខ្លាំង និងភាពច្នៃប្រឌិត។ ខ្ញុំចូលចិត្តបង្កើតផលិតផលឌីជីថលដែលមានប្រយោជន៍ បង្កើតចំណុចប្រទាក់អ្នកប្រើដែលមានគុណភាព និងផលិតមាតិកាមើលឃើញបែបវិជ្ជាជីវៈ។",
    facts: [["ទីក្រុង", "ភ្នំពេញ"], ["សញ្ជាតិ", "ខ្មែរ"], ["បទពិសោធន៍", "ជាង ១ ឆ្នាំ"], ["ភាសា", "ខ្មែរ (ភាសាកំណើត) អង់គ្លេស (កម្រិតមធ្យម)"]],
    services: [
      { title: "ការអភិវឌ្ឍន៍ Full-Stack", items: ["កម្មវិធីគេហទំព័រដែលប្រើបានលើគ្រប់ឧបករណ៍", "React និង Laravel", "ការភ្ជាប់ REST API", "ចំណុចប្រទាក់ស្អាត ងាយស្រួលប្រើ"] },
      { title: "ការរចនាក្រាហ្វិក", items: ["ការបង្កើតម៉ាកយីហោ", "ការរចនាសម្រាប់បណ្តាញសង្គម", "ធនធាន UI និងមាតិកាមើលឃើញ"] },
      { title: "ការកាត់តវីដេអូ", items: ["ការផលិត និងកាត់តវីដេអូ", "ក្រាហ្វិកចលនា", "ការនិទានរឿងតាមរយៈរូបភាព"] },
    ],
    g: { Code: "កូដ", Design: "រចនា", Video: "វីដេអូ" },
    cat: { All: "ទាំងអស់", "Full-stack": "Full-stack", API: "API", Frontend: "Frontend" },
    filterAria: "ត្រងគម្រោងតាមប្រភេទ",
    empty: "មិនទាន់មានគម្រោងប្រភេទនេះទេ។ នឹងមានបន្ថែមឆាប់ៗនេះ។",
    live: "គេហទំព័រផ្ទាល់", source: "កូដប្រភព",
    experience: [
      { when: "2023 – បច្ចុប្បន្ន", title: "កម្មសិក្សាផ្នែកជំនួយ IT", where: "Pethyoeung Healthtech Co., LTD", points: ["ជួយអតិថិជនក្នុងការដំឡើង និងរៀបចំកម្មវិធី", "ជួយដោះស្រាយបញ្ហាបច្ចេកទេសតូចៗ", "កែលម្អបទពិសោធន៍អ្នកប្រើតាមរយៈការណែនាំច្បាស់លាស់"] },
      { when: "2023 – 2024", title: "គម្រោងផ្ទាល់ខ្លួន", where: "ឯករាជ្យ", points: ["បង្កើតគម្រោង front-end និង full-stack ជាច្រើន", "បង្កើតប្រព័ន្ធ CRUD និងសមាសភាគ UI ដែលប្រើឡើងវិញបាន", "បង្កើតវេទិកាស្វែងរកការងារដោយប្រើ React, Laravel និង MySQL", "បង្កើតប្រព័ន្ធគ្រប់គ្រងអ្នកប្រើជាមួយ Laravel Sanctum និងការគ្រប់គ្រងសិទ្ធិតាមតួនាទី"] },
    ],
    education: [
      { when: "2022 – បច្ចុប្បន្ន", title: "បច្ចេកវិទ្យាព័ត៌មាន", where: "វិទ្យាស្ថាន SETEC", points: ["មូលដ្ឋានគ្រឹះនៃការអភិវឌ្ឍន៍គេហទំព័រ និងការសរសេរកម្មវិធី", "ការរចនាកម្មវិធី និងការរៀនតាមគម្រោង"] },
      { when: "2021 – 2022", title: "វិទ្យាល័យ (បាក់ឌុប II)", where: "Chea Sim SonthorMok High School", points: [] },
    ],
    contactIntro: "មានគម្រោងក្នុងចិត្ត ឬចង់សហការគ្នា? សូមផ្ញើសារមកខ្ញុំ ឬទាក់ទងតាមរយៈ៖",
    f: { name: "ឈ្មោះរបស់អ្នក", email: "អ៊ីមែលរបស់អ្នក", message: "សារ", send: "ផ្ញើសារ", sending: "កំពុងផ្ញើ…", ok: "បានផ្ញើសារហើយ។ ខ្ញុំនឹងឆ្លើយតបទៅអ៊ីមែលរបស់អ្នកឆាប់ៗនេះ។", err: "មិនអាចផ្ញើសារបានទេ។ សូមផ្ញើអ៊ីមែលមកខ្ញុំដោយផ្ទាល់នៅ {email}។" },
    cv: "ទាញយក CV", ask: "💬 សួរ SakHak",
    show: "កុំព្យូទ័រយួរដៃ 3D បង្ហាញគម្រោងរបស់ខ្ញុំ។ អូសដើម្បីបង្វិល។",
    gb: { intro: "ទុកសារ សួរសុខទុក្ខ ឬផ្តល់មតិយោបល់។ សារថ្មីនឹងបង្ហាញបន្ទាប់ពីខ្ញុំអនុម័ត។", name: "ឈ្មោះរបស់អ្នក", msg: "សាររបស់អ្នក", send: "ចុះហត្ថលេខាក្នុងសៀវភៅភ្ញៀវ", sending: "កំពុងផ្ញើ…", ok: "សូមអរគុណ! សាររបស់អ្នកនឹងបង្ហាញបន្ទាប់ពីខ្ញុំអនុម័ត។", err: "មិនអាចផ្ញើបានទេ។ សូមព្យាយាមម្តងទៀតពេលក្រោយ។", empty: "មិនទាន់មានសារទេ។ ធ្វើជាអ្នកដំបូង!" },
    chat: { title: "សួរ SakHak", hello: "សួស្តី! ខ្ញុំជាជំនួយការរបស់ SakHak។ សួរខ្ញុំអំពីជំនាញ គម្រោង ឬរបៀបជួលគាត់។", ph: "វាយសំណួររបស់អ្នក…", send: "ផ្ញើ", thinking: "កំពុងគិត…", offline: "(ចម្លើយក្រៅបណ្តាញ៖ ម៉ាស៊ីនមេ AI មិនទាន់ភ្ជាប់ទេ)", s: ["តើអ្នកមានជំនាញអ្វីខ្លះ?", "តើអ្នកបានបង្កើតគម្រោងអ្វីខ្លះ?", "តើខ្ញុំអាចជួលអ្នកដោយរបៀបណា?"] },
    game: { title: "ចាប់រូបរាង!", intro: "ចាប់រូបរាងឱ្យបានច្រើនបំផុតក្នុងរយៈពេល ៣០វិនាទី។ ចុចលើវា!", start: "ចាប់ផ្តើម", score: "ពិន្ទុ", best: "ល្អបំផុត", time: "ពេល", over: "អស់ពេលហើយ!", again: "លេងម្តងទៀត", close: "បិទ" },
    play: { open: "⚡ កន្លែងលេង", title: "កន្លែងលេង", color: "ជ្រើសរើសពណ៌ NEON", warp: "🚀 Warp", matrix: "🌧 Matrix", confetti: "🎉 Confetti", terminal: "💻 Terminal", explode: "💥 Explode", soundOn: "🔊 សំឡេង៖ បើក", soundOff: "🔇 សំឡេង៖ បិទ", tip: "អាថ៌កំបាំង៖ ចុចលើរូបខ្ញុំ ដាក់កណ្តុរលើឈ្មោះខ្ញុំ ចុចគ្រាប់ចុច ` ឬសាកល្បង Konami code ↑ ↑ ↓ ↓ ← → ← → B A", konami: "🎮 បើកសោ Konami code ហើយ!", idle: "👀 នៅទីនោះទេ? នេះជាអំណោយតូចមួយសម្រាប់អ្នក។", liteOn: "🍃 ស្រាល៖ បើក", liteOff: "🍃 ស្រាល៖ បិទ", magnetOn: "🧲 ម៉ាញេទិច៖ បើក", magnetOff: "🧲 ម៉ាញេទិច៖ បិទ", fireworks: "🎆 កាំជ្រួច", game: "🎯 ល្បែងចាប់រូប", timeAuto: "🕒 ពេល៖ ស្វ័យប្រវត្តិ", timeDay: "☀️ ពេល៖ ថ្ងៃ", timeDusk: "🌇 ពេល៖ ល្ងាច", timeNight: "🌙 ពេល៖ យប់", shake: "📳 ចាប់បានការអង្រួន!", photo: "🏆 បើកសោអាថ៌កំបាំង៖ ចុចលើរូបខ្ញុំ ៧ដង!" },
    footer: "© {year} {name}។ បង្កើតដោយ React។",
  },
};

export const DEFAULT_SITE_CONTENT = {
  profile: {
    photo: "",
    name: NAME,
    name_km: "",
    pageTitle: `${NAME} Portfolio`,
    initials: INITIALS,
    email: EMAIL,
    phone: PHONE,
    phoneLink: PHONE_LINK,
    cv: CV,
    cvEn: CV,
    cvKm: CV,
    idTag: "ID // SK-001",
    onlineTag: "ONLINE · 11.56°N 104.93°E",
    orbit,
    skills,
    socials,
  },
  text,
};

export function mergeSiteContent(defaultValue, savedValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(savedValue) ? savedValue : defaultValue;
  }
  if (defaultValue && typeof defaultValue === "object") {
    const saved = savedValue && typeof savedValue === "object" && !Array.isArray(savedValue)
      ? savedValue
      : {};
    return Object.fromEntries(
      Object.entries(defaultValue).map(([key, value]) => [
        key,
        mergeSiteContent(value, saved[key]),
      ]),
    );
  }
  return typeof savedValue === typeof defaultValue ? savedValue : defaultValue;
}
