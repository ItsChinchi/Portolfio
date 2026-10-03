/* ==========================================================================
   Project data
   --------------------------------------------------------------------------
   To add a new game: copy the TEMPLATE below, paste it at the TOP of the
   `PROJECTS` array (newest first), fill it in, and drop the screenshot in
   assets/images/. Nothing else needs to change — layout, alternating rows
   and the engine filter are generated automatically.
   ========================================================================== */

/* Engines: key -> label, icon name (see the sprite in index.html), accent class (see css: .p-engine.<accent>) */
window.ENGINES = {
  ue:    { label: "Unreal Engine 5", icon: "box", accent: "ue" },
  unity: { label: "Unity",           icon: "gamepad",          accent: "unity" },
};

window.PROJECTS = [
  /* ---- TEMPLATE (copy me) --------------------------------------------------
  {
    title: "Game Title",
    engine: "ue",                         // "ue" | "unity"  (see ENGINES above)
    engineNote: "Unreal Engine 5 — C++",  // line shown above the title
    description: "Two or three sentences about what the game is and what you built.",
    tags: ["UE5", "C++", "Gameplay"],
    image: "assets/images/my-game.webp",  // omit to show a text placeholder
    imageAlt: "My Game gameplay screenshot",
    links: [
      { label: "View on GitHub", href: "https://github.com/ItsChinchi/…", icon: "github" },
      { label: "Watch Gameplay", href: "https://…", icon: "play", variant: "play" },
    ],
  },
  ------------------------------------------------------------------------- */

  {
    title: "Crystal Collector",
    engine: "ue",
    engineNote: "Unreal Engine 5 — Blueprints",
    description:
      "A top-down game built with Blueprints in UE5 where the player collects crystals while avoiding cannon fire. Covers Player Controller possession, damage system, timeline animations, dynamic lighting, and modular Blueprint architecture across 2 custom levels.",
    tags: ["UE5", "Blueprints", "Top-Down", "Player Controller", "Apply Damage", "Timelines", "Dynamic Lighting", "2 Levels"],
    image: "assets/images/crystal-collector.webp",
    imageAlt: "Crystal Collector — top-down UE5 game screenshot",
    links: [
      { label: "View on GitHub", href: "https://github.com/ItsChinchi/Crystal-Collector", icon: "github" },
      { label: "Watch Gameplay", href: "https://drive.google.com/file/d/10nWpTtS1Cc4Uvsp5_JvOSg_7CCe6RYPj/view?usp=sharing", icon: "play", variant: "play" },
    ],
  },
  {
    title: "Third-Person Combat System",
    engine: "unity",
    engineNote: "Unity — C#",
    description:
      "A third-person action game built in Unity from a GameDev.tv course, featuring fluid character movement, melee combat with attack combos, state-based enemy AI, lock-on targeting, dodge & block mechanics, and ragdoll physics on enemy death.",
    tags: ["Unity", "C#", "State Machine", "Melee Combat", "NavMesh AI", "Cinemachine", "Root Motion", "IK", "Ragdoll"],
    image: "assets/images/third-person-combat.webp",
    imageAlt: "Third-Person Combat System gameplay screenshot",
    links: [
      { label: "View on GitHub", href: "https://github.com/ItsChinchi/Third-Person-Compat-System", icon: "github" },
      { label: "Watch Gameplay", href: "https://drive.google.com/file/d/13DlJscDqQwMSsaRS3rxXI6MyuhzrSZhx/view?usp=sharing", icon: "play", variant: "play" },
    ],
  },
  {
    title: "Unity Cinematic System",
    engine: "unity",
    engineIcon: "film",
    engineNote: "Unity URP — Timeline & Cinemachine",
    description:
      "A cinematic scene built with Unity's Universal Render Pipeline from a GameDev.tv course. Explores cutscene creation with Timeline, Cinemachine camera sequencing, and URP post-processing — Bloom, Depth of Field, and Color Grading — for a cinematic look.",
    tags: ["Unity", "URP", "Timeline", "Cinemachine", "Post-Processing", "Bloom", "Depth of Field", "Color Grading"],
    image: "assets/images/unity-cinematic.webp",
    imageAlt: "Unity Cinematic System scene",
    links: [
      { label: "View on GitHub", href: "https://github.com/ItsChinchi/Unity-Cinematic_System", icon: "github" },
      { label: "Watch Cinematic Video", href: "https://drive.google.com/file/d/1d6IMqC9H9_l7GPXN2FlFF0RAftKq05-h/view?usp=sharing", icon: "play", variant: "play" },
    ],
  },
  {
    title: "Mshmsh & The Last Tuna",
    engine: "unity",
    engineNote: "Unity — C#  ·  GGI 2021",
    description:
      "A game jam entry for GGI 2021 built with Unity and C#. Focused on delivering a complete, polished game under tight time constraints — rapid prototyping and shipping a finished product.",
    tags: ["Unity", "C#", "2D Game", "Game Jam", "GGI 2021"],
    image: "assets/images/mshmsh-last-tuna.webp",
    imageAlt: "Mshmsh & The Last Tuna gameplay screenshot",
    links: [
      { label: "View on GitHub", href: "https://github.com/ItsChinchi/Mshmsh-And-The-Last-Tuna-", icon: "github" },
      { label: "Try Demo", href: "https://sharafabacery.itch.io/meshmesh-and-the-lost-tuna", icon: "gamepad", variant: "play" },
    ],
  },
];

/* "In development" card at the bottom of the projects list. Set to null to hide. */
window.UPCOMING = {
  title: "Next UE5 Project",
  description:
    "Currently building a deeper Unreal Engine project focused on C++ gameplay systems — combat, inventory, and AI behavior. Targeting AAA-level system design and clean code architecture.",
};
