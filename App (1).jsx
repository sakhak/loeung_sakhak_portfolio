import { useState, useMemo, useEffect, useRef } from "react";

/* =====================================================================
   1. YOUR DATA — edit only this part
   ===================================================================== */

/* YOUR PHOTO: put your picture in your project's  public/  folder and name it
   profile.jpg  (so the file is  public/profile.jpg).  Square photos look best.
   If the file is missing, the page shows your initials instead. */
const PHOTO = "/profile.jpg";

const NAME = "Loeung SakHak";
const INITIALS = "SK";
const EMAIL = "loeungsakhak438@gmail.com";
const PHONE = "(+855) 016 607 238";
const PHONE_LINK = "+85516607238";
const CONTACT_ENDPOINT = "/api/contact.php";

/* HOW TO ADD A PROJECT: copy one { ... } block, paste it in the list and give it a
   new id. Set category to "Full-stack", "API" or "Frontend" (spelled exactly like that).
   Write the title and description in English (en) and Khmer (km).
   If you leave km out, the English text is shown. Leave link / github / image as ""
   if you have none. Project images go in  public/images/  and are written as "/images/name.jpg". */
const projects = [
  { id: 1, category: "Full-stack", tech: ["React", "Laravel", "MySQL"], link: "", github: "https://github.com/sakhak", image: "",
    en: { title: "User Management System", description: "Role-based user management with authentication, profile management, a secure dashboard and access control using Laravel Sanctum." },
    km: { title: "ប្រព័ន្ធគ្រប់គ្រងអ្នកប្រើប្រាស់", description: "ការគ្រប់គ្រងអ្នកប្រើតាមតួនាទី ជាមួយការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ ការគ្រប់គ្រងប្រវត្តិរូប ផ្ទាំងគ្រប់គ្រងដែលមានសុវត្ថិភាព និងការគ្រប់គ្រងសិទ្ធិដោយប្រើ Laravel Sanctum។" } },
  { id: 2, category: "Full-stack", tech: ["React", "Laravel", "MySQL"], link: "", github: "https://github.com/sakhak", image: "",
    en: { title: "Construction Company Website and Admin Dashboard", description: "A public website with an admin panel. Staff manage dynamic content through CRUD pages connected to a Laravel API." },
    km: { title: "គេហទំព័រក្រុមហ៊ុនសំណង់ និងផ្ទាំងគ្រប់គ្រង", description: "គេហទំព័រសាធារណៈជាមួយផ្ទាំងគ្រប់គ្រង។ បុគ្គលិកគ្រប់គ្រងមាតិកាតាមរយៈទំព័រ CRUD ដែលភ្ជាប់ជាមួយ Laravel API។" } },
  { id: 3, category: "Full-stack", tech: ["React", "Laravel", "MySQL"], link: "", github: "https://github.com/sakhak", image: "",
    en: { title: "Job Search Platform", description: "Job listings with search and filters, user accounts and profiles. A full-stack app built with React and Laravel." },
    km: { title: "វេទិកាស្វែងរកការងារ", description: "បញ្ជីការងារជាមួយការស្វែងរក និងតម្រង គណនីអ្នកប្រើ និងប្រវត្តិរូប។ កម្មវិធី full-stack ដែលបង្កើតដោយ React និង Laravel។" } },
  { id: 4, category: "Full-stack", tech: ["React", "Laravel", "MySQL"], link: "", github: "https://github.com/sakhak", image: "",
    en: { title: "Basic System", description: "A CRUD application for creating, editing and managing data records." },
    km: { title: "ប្រព័ន្ធមូលដ្ឋាន", description: "កម្មវិធី CRUD សម្រាប់បង្កើត កែសម្រួល និងគ្រប់គ្រងកំណត់ត្រាទិន្នន័យ។" } },
  { id: 5, category: "Frontend", tech: ["HTML", "CSS", "JavaScript"], link: "", github: "https://github.com/sakhak", image: "",
    en: { title: "Employee CRUD", description: "An employee management app that adds, edits and deletes records, with data saved locally in the browser." },
    km: { title: "ប្រព័ន្ធគ្រប់គ្រងបុគ្គលិក (Employee CRUD)", description: "កម្មវិធីគ្រប់គ្រងបុគ្គលិកដែលបន្ថែម កែសម្រួល និងលុបកំណត់ត្រា ដោយរក្សាទុកទិន្នន័យក្នុងកម្មវិធីរុករក។" } },
];

const categories = ["All", "Full-stack", "API", "Frontend"];
const orbit = ["React", "Laravel", "Ps", "Pr"]; /* badges floating around your photo */
const skills = {
  Code: ["HTML", "CSS", "JavaScript", "React", "PHP", "Laravel", "SQL", "C#"],
  Design: ["Adobe Photoshop", "Adobe Illustrator"],
  Video: ["Adobe Premiere Pro", "Adobe After Effects"],
};
const icons = ["</>", "◐", "▶"];
const socials = [
  ["GitHub", "https://github.com/sakhak"],
  ["LinkedIn", "https://www.linkedin.com/in/sakhak-loeung-4149a532a/"],
  ["Facebook", "https://www.facebook.com/sakhak.loeung.1"],
  ["Telegram", "https://t.me/sakhak_loeung"],
];

/* All the words on the page, in English (en) and Khmer (km).
   Change any sentence here and it updates on the website. */
const text = {
  en: {
    switchTo: "ខ្មែរ", switchAria: "Switch to Khmer",
    dark: "Dark mode", light: "Light mode", themeAria: "Switch between light and dark mode",
    n: { about: "About", skills: "Skills", projects: "Projects", experience: "Experience", education: "Education", contact: "Contact" },
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
    empty: (c) => `No ${c} projects yet. More coming soon.`,
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
    f: { name: "Your name", email: "Your email", message: "Message", send: "Send message", sending: "Sending…", ok: "Message sent. I will reply to your email soon.", err: (e) => `The message was not sent. Email me directly at ${e}.` },
    footer: (y) => `© ${y} ${NAME}. Built with React.`,
  },
  km: {
    switchTo: "EN", switchAria: "ប្តូរទៅភាសាអង់គ្លេស",
    dark: "មុខងារងងឹត", light: "មុខងារភ្លឺ", themeAria: "ប្តូររវាងមុខងារភ្លឺ និងងងឹត",
    n: { about: "អំពីខ្ញុំ", skills: "ជំនាញ", projects: "គម្រោង", experience: "បទពិសោធន៍", education: "ការអប់រំ", contact: "ទំនាក់ទំនង" },
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
    empty: () => "មិនទាន់មានគម្រោងប្រភេទនេះទេ។ នឹងមានបន្ថែមឆាប់ៗនេះ។",
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
    f: { name: "ឈ្មោះរបស់អ្នក", email: "អ៊ីមែលរបស់អ្នក", message: "សារ", send: "ផ្ញើសារ", sending: "កំពុងផ្ញើ…", ok: "បានផ្ញើសារហើយ។ ខ្ញុំនឹងឆ្លើយតបទៅអ៊ីមែលរបស់អ្នកឆាប់ៗនេះ។", err: (e) => `មិនអាចផ្ញើសារបានទេ។ សូមផ្ញើអ៊ីមែលមកខ្ញុំដោយផ្ទាល់នៅ ${e}។` },
    footer: (y) => `© ${y} ${NAME}។ បង្កើតដោយ React។`,
  },
};

/* =====================================================================
   2. STYLES
   ===================================================================== */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&family=Manrope:wght@400;500;700&family=Noto+Sans+Khmer:wght@400;600;800&display=swap');
.pf{--bg:#0A0912;--surface:#14122200;--card:#15132390;--ink:#F1EFFA;--muted:#A19EB8;--line:#2A2740;--a:#7C5CFF;--b:#FF5C8A;--c:#2DE2E6;
 --grad:linear-gradient(120deg,var(--a),var(--b) 55%,var(--c));--display:'Sora','Segoe UI',system-ui,sans-serif;--body:'Manrope','Segoe UI',system-ui,sans-serif;
 background:var(--bg);color:var(--ink);font:17px/1.65 var(--body);min-height:100vh;position:relative;overflow-x:hidden}
.pf[data-theme="light"]{--bg:#F6F5FC;--card:#FFFFFFcc;--ink:#15122A;--muted:#625E7C;--line:#DCD8F0;--a:#5B3FE0;--b:#E23B72;--c:#0BA9B0}
.pf *,.pf *::before,.pf *::after{box-sizing:border-box}
.pf a{color:inherit}.pf p{margin:0}
.pf :focus-visible{outline:3px solid var(--c);outline-offset:3px;border-radius:6px}
html{scroll-behavior:smooth}
.pf .glow{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(500px circle at var(--mx,50%) var(--my,30%),color-mix(in srgb,var(--a) 22%,transparent),transparent 70%)}
.pf .blobs{position:absolute;inset:0 0 auto 0;height:900px;overflow:hidden;pointer-events:none;z-index:0}
.pf .blobs i{position:absolute;border-radius:50%;filter:blur(90px);opacity:.35;animation:drift 18s ease-in-out infinite alternate}
.pf .blobs i:nth-child(1){width:420px;height:420px;background:var(--a);top:-80px;left:-100px}
.pf .blobs i:nth-child(2){width:360px;height:360px;background:var(--b);top:120px;right:-80px;animation-delay:-6s}
.pf .blobs i:nth-child(3){width:300px;height:300px;background:var(--c);top:420px;left:35%;animation-delay:-11s;opacity:.2}
@keyframes drift{to{transform:translate(70px,50px) scale(1.18)}}
.pf .wrap{width:min(1080px,100% - 40px);margin-inline:auto;position:relative;z-index:1}
.pf section{padding:100px 0 0;scroll-margin-top:60px}
.pf h2{font-family:var(--display);font-size:clamp(30px,4.5vw,46px);line-height:1.1;margin:0 0 34px;letter-spacing:-.03em}
.pf h2::after{content:"";display:block;width:64px;height:5px;border-radius:9px;background:var(--grad);margin-top:14px}
.pf h3{font-family:var(--display);margin:0;letter-spacing:-.01em}
.grad{background:var(--grad);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 6s linear infinite}
@keyframes shine{to{background-position:200% center}}

/* reveal on scroll */
.rv{opacity:0;transform:translateY(34px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}
.rv.in{opacity:1;transform:none}

/* nav */
.pf nav{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.pf nav .wrap{display:flex;align-items:center;justify-content:space-between;height:62px}
.pf .brand{font-family:var(--display);font-weight:800;text-decoration:none}
.pf .links{display:flex;gap:22px;align-items:center}
.pf .links a{text-decoration:none;color:var(--muted);font-weight:500;font-size:15px}.pf .links a:hover{color:var(--ink)}
.pf .theme{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:99px;padding:6px 14px;font:inherit;font-size:14px;cursor:pointer}
@media(max-width:760px){.pf .links a{display:none}}

/* hero */
.pf .hero{display:grid;grid-template-columns:1.15fr 1fr;gap:40px;align-items:center;padding-top:70px;min-height:calc(100vh - 62px)}
@media(max-width:860px){.pf .hero{grid-template-columns:1fr;text-align:center;padding-top:40px}.pf .hero .cta,.pf .stats{justify-content:center}.pf .lead{margin-inline:auto}.pf .photo{order:-1}}
.pf .hi{display:inline-block;border:1px solid var(--line);background:var(--card);border-radius:99px;padding:6px 16px;font-size:15px;margin-bottom:22px}
.pf .hi b{display:inline-block;animation:wave 2.2s ease-in-out infinite;transform-origin:70% 70%}
@keyframes wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(16deg)}20%,40%{transform:rotate(-10deg)}50%{transform:rotate(8deg)}}
.pf h1{font-family:var(--display);font-weight:800;font-size:clamp(44px,8.5vw,92px);line-height:.98;letter-spacing:-.045em;margin:0 0 18px}
.pf .typed{font-family:var(--display);font-size:clamp(20px,3vw,28px);font-weight:600;min-height:1.5em;margin-bottom:18px}
.pf .typed::after{content:"";display:inline-block;width:3px;height:1em;background:var(--c);margin-left:4px;vertical-align:-.12em;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.pf .lead{max-width:50ch;color:var(--muted);font-size:18px}
.pf .cta{display:flex;gap:14px;margin-top:30px;flex-wrap:wrap}
.pf .btn{display:inline-block;text-decoration:none;font:700 16px var(--body);padding:14px 28px;border-radius:99px;border:0;color:#fff;background:var(--grad);background-size:200% auto;cursor:pointer;transition:transform .2s,background-position .4s,box-shadow .2s;box-shadow:0 10px 30px -10px var(--a)}
.pf .btn:hover{transform:translateY(-3px);background-position:100% center}
.pf .btn.ghost{background:transparent;color:var(--ink);box-shadow:none;border:1.5px solid var(--line)}
.pf .btn.ghost:hover{border-color:var(--c)}
.pf .btn:disabled{opacity:.6;cursor:wait}
.pf .stats{display:flex;gap:34px;margin-top:38px;flex-wrap:wrap}
.pf .stats b{display:block;font:800 30px var(--display)}.pf .stats span{color:var(--muted);font-size:14px}

/* photo */
.pf .photo{position:relative;width:min(400px,80vw);aspect-ratio:1;margin-inline:auto}
.pf .ring{position:absolute;inset:-14px;border-radius:50%;background:conic-gradient(from 0deg,var(--a),var(--b),var(--c),var(--a));animation:spin 7s linear infinite;filter:blur(1px)}
.pf .ring::after{content:"";position:absolute;inset:0;border-radius:inherit;background:inherit;filter:blur(40px);opacity:.55}
@keyframes spin{to{transform:rotate(360deg)}}
.pf .frame{position:absolute;inset:0;overflow:hidden;background:var(--bg);animation:morph 9s ease-in-out infinite;border:6px solid var(--bg);display:grid;place-items:center}
@keyframes morph{0%,100%{border-radius:58% 42% 55% 45%/48% 55% 45% 52%}50%{border-radius:42% 58% 45% 55%/55% 42% 58% 45%}}
.pf .ring{animation:spin 7s linear infinite,morph 9s ease-in-out infinite}
.pf .frame img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}
.pf .photo:hover .frame img{transform:scale(1.07)}
.pf .frame .ini{font:800 110px var(--display)}
.pf .badge{position:absolute;z-index:3;padding:8px 16px;border-radius:14px;font:700 14px var(--display);background:var(--card);border:1px solid var(--line);backdrop-filter:blur(10px);box-shadow:0 12px 30px -12px #0008;animation:float 5s ease-in-out infinite}
.pf .badge:nth-of-type(1){top:6%;left:-6%}.pf .badge:nth-of-type(2){top:18%;right:-8%;animation-delay:-1.2s}
.pf .badge:nth-of-type(3){bottom:14%;left:-8%;animation-delay:-2.4s}.pf .badge:nth-of-type(4){bottom:2%;right:2%;animation-delay:-3.6s}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}

/* marquee */
.pf .marq{overflow:hidden;border-block:1px solid var(--line);margin-top:70px;padding:18px 0;position:relative;z-index:1;background:var(--card)}
.pf .track{display:flex;gap:44px;width:max-content;animation:scroll 28s linear infinite}
.pf .marq:hover .track{animation-play-state:paused}
.pf .track span{font:800 26px var(--display);white-space:nowrap;color:transparent;-webkit-text-stroke:1.2px var(--muted)}
.pf .track span:nth-child(3n){-webkit-text-stroke:0;color:var(--ink)}
@keyframes scroll{to{transform:translateX(-50%)}}

/* about / services / skills */
.pf .about{display:grid;grid-template-columns:1.4fr 1fr;gap:48px}
@media(max-width:780px){.pf .about{grid-template-columns:1fr;gap:28px}}
.pf dl{margin:0;border-top:1px solid var(--line)}
.pf dl div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}
.pf dt{color:var(--muted)}.pf dd{margin:0;font-weight:700;text-align:right}
.pf .svc{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:56px}
.pf .tilt,.pf .svc>div{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;backdrop-filter:blur(8px)}
.pf .svc>div:hover{border-color:var(--a)}
.pf .ico{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:var(--grad);color:#fff;font:800 20px var(--display);margin-bottom:16px}
.pf .svc ul{margin:12px 0 0;padding-left:18px;color:var(--muted);font-size:15.5px}
.pf .sg{display:grid;grid-template-columns:110px 1fr;gap:12px 20px;padding:18px 0;border-top:1px solid var(--line);align-items:center}
.pf .chips{display:flex;flex-wrap:wrap;gap:8px}
.pf .chip{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:5px 15px;font-size:15px;transition:transform .2s,border-color .2s,background .2s}
.pf .chip:hover{transform:translateY(-3px) rotate(-2deg);border-color:var(--b)}

/* projects */
.pf .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px}
.pf .filters button{font:600 15px var(--body);padding:7px 18px;border-radius:99px;border:1.5px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;transition:.2s}
.pf .filters button[aria-pressed="true"]{background:var(--grad);border-color:transparent;color:#fff}
.pf .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:22px;perspective:1000px}
.pf .tilt{padding:0;overflow:hidden;display:flex;flex-direction:column;transition:transform .15s,border-color .3s,box-shadow .3s;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));will-change:transform}
.pf .tilt:hover{border-color:var(--a);box-shadow:0 24px 60px -24px var(--a)}
.pf .thumb{aspect-ratio:16/9;background:var(--grad);background-size:200% 200%;animation:shine 8s linear infinite;display:grid;place-items:center;color:#fff;font:800 56px var(--display)}
.pf .thumb img{width:100%;height:100%;object-fit:cover;display:block}
.pf .body{padding:22px;display:flex;flex-direction:column;gap:12px;flex:1}
.pf .body h3{font-size:20px;line-height:1.25}.pf .body p{color:var(--muted);font-size:15.5px}
.pf .body .chips{margin-top:auto}.pf .body .chip{font-size:13px;padding:2px 11px}
.pf .actions{display:flex;gap:18px;font-weight:700;font-size:15px}.pf .actions a{color:var(--c)}

/* timeline */
.pf .cols{display:grid;grid-template-columns:1fr 1fr;gap:48px}
@media(max-width:840px){.pf .cols{grid-template-columns:1fr;gap:70px}}
.pf .tl{list-style:none;margin:0;padding:0 0 0 24px;border-left:2px solid var(--line)}
.pf .tl>li{position:relative;padding-bottom:30px}
.pf .tl>li::before{content:"";position:absolute;left:-32px;top:7px;width:14px;height:14px;border-radius:50%;background:var(--grad);box-shadow:0 0 0 5px color-mix(in srgb,var(--a) 25%,transparent);animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{50%{box-shadow:0 0 0 10px transparent}}
.pf .when{color:var(--c);font-size:14.5px;font-weight:700}.pf .tl h3{font-size:20px;margin:2px 0}.pf .org{font-weight:600}
.pf .tl ul{margin:10px 0 0;padding-left:18px;color:var(--muted);font-size:15.5px}

/* contact */
.pf .contact{display:grid;grid-template-columns:1fr 1.2fr;gap:48px}
@media(max-width:780px){.pf .contact{grid-template-columns:1fr;gap:32px}}
.pf .contact ul{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:10px}.pf .contact li a{font-weight:700}
.pf form{display:grid;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px}
.pf label{display:grid;gap:6px;font-weight:700;font-size:15px}
.pf input,.pf textarea{font:inherit;font-weight:400;color:var(--ink);background:transparent;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;width:100%;transition:border-color .2s}
.pf input:focus,.pf textarea:focus{border-color:var(--a);outline:0}
.pf textarea{min-height:130px;resize:vertical}
.pf .status{font-weight:600;min-height:1.6em}.pf .status.ok{color:#3DDC84}.pf .status.err{color:#FF6B6B}
.pf .hp{position:absolute;left:-9999px}
.pf footer{margin-top:100px;border-top:1px solid var(--line);padding:28px 0;color:var(--muted);font-size:15px;position:relative;z-index:1}

/* Khmer text needs its own font and looser spacing */
.pf[lang="km"]{--display:'Noto Sans Khmer','Khmer OS',system-ui,sans-serif;--body:'Noto Sans Khmer','Khmer OS',system-ui,sans-serif;line-height:1.85}
.pf[lang="km"] h1,.pf[lang="km"] h2,.pf[lang="km"] h3,.pf[lang="km"] .typed,.pf[lang="km"] .stats b{letter-spacing:0;line-height:1.45}
.pf[lang="km"] h1{font-size:clamp(36px,6.5vw,72px)}
.pf[lang="km"] .links{gap:16px}

@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.pf *,.pf *::before,.pf *::after{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}
`;

/* =====================================================================
   3. SMALL HELPERS
   ===================================================================== */

/* fades a block in when it scrolls into view */
function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${seen ? "in" : ""} ${className}`} style={{ "--d": `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

/* splits text into letters the way people read them (needed for Khmer) */
const letters = (s) =>
  typeof Intl !== "undefined" && Intl.Segmenter
    ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].map((x) => x.segment)
    : Array.from(s);

/* types and deletes the job titles */
function Typed({ words }) {
  const parts = useMemo(() => words.map(letters), [words]);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const len = parts[i].length;
    const t = setTimeout(() => {
      if (!del && n < len) setN(n + 1);
      else if (!del) setDel(true);
      else if (n > 0) setN(n - 1);
      else { setDel(false); setI((i + 1) % parts.length); }
    }, !del && n === len ? 1400 : del ? 40 : 85);
    return () => clearTimeout(t);
  }, [n, del, i, parts]);
  return <span className="grad">{parts[i].slice(0, n).join("")}</span>;
}

/* card that leans toward the mouse */
function Tilt({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    ref.current.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
  };
  const leave = () => { ref.current.style.setProperty("--rx", "0deg"); ref.current.style.setProperty("--ry", "0deg"); };
  return <article ref={ref} className="tilt" onMouseMove={move} onMouseLeave={leave}>{children}</article>;
}

function Timeline({ items }) {
  return (
    <ul className="tl">
      {items.map((it, k) => (
        <Reveal as="li" delay={k * 0.1} key={it.title}>
          <div className="when">{it.when}</div>
          <h3>{it.title}</h3>
          <div className="org">{it.where}</div>
          {it.points.length > 0 && <ul>{it.points.map((p) => <li key={p}>{p}</li>)}</ul>}
        </Reveal>
      ))}
    </ul>
  );
}

function ContactForm({ t }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [state, setState] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setState({ type: "", text: "" });
    try {
      const res = await fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setState({ type: "ok", text: t.f.ok });
      setForm({ name: "", email: "", message: "", website: "" });
    } catch {
      setState({ type: "err", text: t.f.err(EMAIL) });
    } finally {
      setSending(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <label>{t.f.name}<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
      <label>{t.f.email}<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" /></label>
      <label>{t.f.message}<textarea name="message" value={form.message} onChange={change} required /></label>
      <input className="hp" name="website" value={form.website} onChange={change} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div><button className="btn" type="submit" disabled={sending}>{sending ? t.f.sending : t.f.send}</button></div>
      <p className={`status ${state.type}`} role="status" aria-live="polite">{state.text}</p>
    </form>
  );
}

/* =====================================================================
   4. APP
   ===================================================================== */

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("lang") === "km" ? "km" : "en"; } catch { return "en"; }
  });
  const [filter, setFilter] = useState("All");
  const [photoOk, setPhotoOk] = useState(true);
  const root = useRef(null);
  const t = text[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
  }, [lang]);

  const shown = (filter === "All" ? projects : projects.filter((p) => p.category === filter)).map((p) => ({ ...p, ...(p[lang] || p.en) }));
  const marquee = [...Object.values(skills).flat(), ...Object.values(skills).flat()];

  const onMove = (e) => {
    root.current?.style.setProperty("--mx", `${e.clientX}px`);
    root.current?.style.setProperty("--my", `${e.clientY}px`);
  };

  return (
    <div className="pf" lang={lang} data-theme={theme} ref={root} onMouseMove={onMove}>
      <style>{css}</style>
      <div className="glow" aria-hidden="true" />
      <div className="blobs" aria-hidden="true"><i /><i /><i /></div>

      <nav aria-label="Main">
        <div className="wrap">
          <a className="brand" href="#top">{NAME}</a>
          <div className="links">
            <a href="#about">{t.n.about}</a><a href="#skills">{t.n.skills}</a><a href="#projects">{t.n.projects}</a>
            <a href="#experience">{t.n.experience}</a><a href="#contact">{t.n.contact}</a>
            <button className="theme" onClick={() => setLang(lang === "en" ? "km" : "en")} aria-label={t.switchAria}>{t.switchTo}</button>
            <button className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t.themeAria}>
              {theme === "dark" ? t.light : t.dark}
            </button>
          </div>
        </div>
      </nav>

      <main id="top">
        <header className="wrap hero">
          <div>
            <p className="hi"><b>👋</b> {t.hi}</p>
            <h1>{t.iam} <span className="grad">{NAME}</span></h1>
            <p className="typed" aria-live="off"><Typed key={lang} words={t.typed} /></p>
            <p className="lead">{t.summary}</p>
            <div className="cta">
              <a className="btn" href="#projects">{t.seeProjects}</a>
              <a className="btn ghost" href="#contact">{t.getInTouch}</a>
            </div>
            <div className="stats">
              {t.stats.map(([n, l]) => <div key={l}><b className="grad">{n}</b><span>{l}</span></div>)}
            </div>
          </div>

          <div className="photo">
            <div className="ring" aria-hidden="true" />
            <div className="frame">
              {photoOk
                ? <img src={PHOTO} alt={NAME} onError={() => setPhotoOk(false)} />
                : <span className="ini grad">{INITIALS}</span>}
            </div>
            {orbit.map((o) => <span className="badge" key={o} aria-hidden="true">{o}</span>)}
          </div>
        </header>

        <div className="marq" aria-hidden="true">
          <div className="track">{marquee.map((s, i) => <span key={i}>{s}</span>)}</div>
        </div>

        <section id="about" className="wrap">
          <Reveal><h2>{t.n.about}</h2></Reveal>
          <div className="about">
            <Reveal><p>{t.about}</p></Reveal>
            <Reveal delay={0.15}>
              <dl>{t.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </Reveal>
          </div>
          <div className="svc">
            {t.services.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="ico" aria-hidden="true">{icons[i]}</div>
                <h3>{s.title}</h3>
                <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="skills" className="wrap">
          <Reveal><h2>{t.n.skills}</h2></Reveal>
          {Object.entries(skills).map(([g, list], k) => (
            <Reveal className="sg" delay={k * 0.1} key={g}>
              <h3>{t.g[g]}</h3>
              <div className="chips">{list.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
            </Reveal>
          ))}
        </section>

        <section id="projects" className="wrap">
          <Reveal><h2>{t.n.projects}</h2></Reveal>
          <div className="filters" role="group" aria-label={t.filterAria}>
            {categories.map((c) => <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)}>{t.cat[c]}</button>)}
          </div>
          {shown.length === 0 && <p style={{ color: "var(--muted)" }}>{t.empty(t.cat[filter])}</p>}
          <div className="grid">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <Tilt>
                  <div className="thumb">
                    {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <span aria-hidden="true">{p.title.charAt(0)}</span>}
                  </div>
                  <div className="body">
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="chips">{p.tech.map((x) => <span className="chip" key={x}>{x}</span>)}</div>
                    {(p.link || p.github) && (
                      <div className="actions">
                        {p.link && <a href={p.link} target="_blank" rel="noreferrer">{t.live}</a>}
                        {p.github && <a href={p.github} target="_blank" rel="noreferrer">{t.source}</a>}
                      </div>
                    )}
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="experience" className="wrap">
          <div className="cols">
            <div><Reveal><h2>{t.n.experience}</h2></Reveal><Timeline items={t.experience} /></div>
            <div><Reveal><h2>{t.n.education}</h2></Reveal><Timeline items={t.education} /></div>
          </div>
        </section>

        <section id="contact" className="wrap">
          <Reveal><h2>{t.n.contact}</h2></Reveal>
          <div className="contact">
            <Reveal>
              <p>{t.contactIntro}</p>
              <ul>
                <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><a href={`tel:${PHONE_LINK}`}>{PHONE}</a></li>
                {socials.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noreferrer">{n}</a></li>)}
              </ul>
            </Reveal>
            <Reveal delay={0.15}><ContactForm t={t} /></Reveal>
          </div>
        </section>
      </main>

      <footer><div className="wrap">{t.footer(new Date().getFullYear())}</div></footer>
    </div>
  );
}
