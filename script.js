// Data model: organisms and simple interactions
const organisms = [
  {
    id: "strawberry",
    name: "Strawberry",
    role: "Producer",
    emoji: "🌱",
    description: "A sweet fruit plant that photosynthesizes.",
    img: "organisms/Cartoon_strawberry_plant_eb02f891.png",
    traits: ["Photosynthesis", "Fruit-bearing", "Ground cover"],
    interactions: ["pollinated by Bee", "eaten by Goat", "requires sunlight and water"]
  },
  {
    id: "potato",
    name: "Potato",
    role: "Producer",
    emoji: "🌱",
    description: "A root vegetable that grows underground.",
    img: "organisms/Cartoon_potato_plant_e58e9460.png",
    traits: ["Tuber storage", "Cool climate", "Soil-rich"],
    interactions: ["eaten by Chicken", "competes with weeds", "benefits from good soil drainage"]
  },
  {
    id: "pumpkin-seeds",
    name: "Pumpkin Seeds",
    role: "Producer",
    emoji: "🌱",
    description: "Seeds that grow into pumpkin vines.",
    img: "organisms/Cartoon_pumpkin_seeds_576b5ec3.png",
    traits: ["Vining growth", "Large leaves", "Seasonal"],
    interactions: ["pollinated by Bee", "seed dispersal by animals", "needs space to sprawl"]
  },
  {
    id: "corn",
    name: "Corn",
    role: "Producer",
    emoji: "🌱",
    description: "A tall grass crop that loves sunlight.",
    img: "organisms/Cartoon_corn_plant_58a724ab.png",
    traits: ["Wind-pollinated", "High sunlight", "Nitrogen hungry"],
    interactions: ["eaten by Duck", "provides shelter to small animals", "competes for nutrients"]
  },
  {
    id: "goat",
    name: "Goat",
    role: "Consumer",
    emoji: "🍖",
    description: "A herbivore that eats plants.",
    img: "organisms/Cartoon_goat_character_0191fba2.png",
    traits: ["Grazing", "Agile", "Ruminant"],
    interactions: ["feeds on Strawberry and Corn", "preyed upon by Wolf", "competes with other herbivores"]
  },
  {
    id: "duck",
    name: "Duck",
    role: "Consumer",
    emoji: "🍖",
    description: "An omnivore that eats plants and insects.",
    img: "organisms/Cartoon_duck_character_e6efd23f.png",
    traits: ["Aquatic", "Omnivorous", "Migratory"],
    interactions: ["feeds on Corn, insects", "avoids Wolf", "disperses seeds"]
  },
  {
    id: "chicken",
    name: "Chicken",
    role: "Consumer",
    emoji: "🍖",
    description: "A bird that pecks for seeds and bugs.",
    img: "organisms/Cartoon_chicken_character_78ddbb39.png",
    traits: ["Pecking", "Ground forager", "Social"],
    interactions: ["feeds on Potato, seeds", "preyed upon by Wolf", "controls insect populations"]
  },
  {
    id: "wolf",
    name: "Wolf",
    role: "Consumer",
    emoji: "🍖",
    description: "A carnivore that hunts other animals.",
    img: "organisms/Cartoon_wolf_character_6ecadd03.png",
    traits: ["Pack hunter", "Territorial", "Apex predator"],
    interactions: ["preys on Goat and Chicken", "regulates herbivore populations", "competes with other predators"]
  },
  {
    id: "bee",
    name: "Bee",
    role: "Consumer",
    emoji: "🍖",
    description: "A pollinator that feeds on nectar.",
    img: "organisms/Cartoon_bee_character_cd9dafe6.png",
    traits: ["Pollination", "Social", "Nectar-feeding"],
    interactions: ["pollinates Strawberry and Pumpkin", "supports fruit set", "sensitive to pesticides"]
  },
  {
    id: "yeast",
    name: "Yeast",
    role: "Decomposer",
    emoji: "🍄",
    description: "A fungus that breaks down organic matter.",
    img: "organisms/Cartoon_yeast_cells_8e9a2b32.png",
    traits: ["Fermentation", "Microscopic", "Rapid growth"],
    interactions: ["breaks down sugars", "part of decomposition", "supports nutrient cycling"]
  }
];

// Helpers
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const roleColors = {
  Producer: "producer",
  Consumer: "consumer",
  Decomposer: "decomposer"
};

function renderCards(list) {
  const grid = qs("#cardGrid");
  grid.innerHTML = "";
  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.cursor = "pointer";
    card.setAttribute("data-id", item.id);
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="title-row">${item.name}</div>
      <div class="role">
        <span class="badge ${roleColors[item.role]}">${item.role}</span>
        <span style="margin-left:.5rem">${item.emoji}</span>
      </div>
      <p class="desc">${item.description}</p>
    `;
    grid.appendChild(card);
  });
}

function openDetails(item) {
  const panel = qs("#detailPanel");
  const content = qs("#detailContent");
  panel.classList.remove("hidden");
  content.innerHTML = `
    <div class="panel">
      <button class="close-btn" id="closePanelBtn" aria-label="Close details">×</button>
      <div>
        <img src="${item.img}" alt="${item.name}" style="width:100%;border-radius:.5rem;background:rgba(255,255,255,.03)" />
      </div>
      <div>
        <h2 style="margin:.25rem 0">${item.name} <span class="badge ${roleColors[item.role]}" style="margin-left:.5rem">${item.role}</span></h2>
        <p style="color:#9ca3af">${item.description}</p>
        <h3 style="margin-top:1rem">Traits</h3>
        <ul>
          ${item.traits.map(t => `<li>${t}</li>`).join("")}
        </ul>
        <h3 style="margin-top:1rem">Interactions</h3>
        <ul>
          ${item.interactions.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>
      <div style="grid-column: 1 / -1; margin-top: 1rem; display: flex; justify-content: center;">
        <button class="button primary" id="playButton" data-id="${item.id}" style="padding:.75rem 2rem; font-size: 1rem;">Play as ${item.name}</button>
      </div>
    </div>
  `;
  
  // Add event listener for play button
  qs("#playButton").addEventListener("click", () => {
    window.location.href = `game.html?organism=${item.id}`;
  });
  
  // Add event listener for close button inside panel
  qs("#closePanelBtn").addEventListener("click", closeDetails);
}

function closeDetails() {
  qs("#detailPanel").classList.add("hidden");
}

// Simple simulation: show a lightweight narrative
function simulate(id) {
  const item = organisms.find(o => o.id === id);
  const outcomes = {
    Producer: [
      "Sunlight is abundant. Photosynthesis boosts growth.",
      "Drought stress reduces yield; watering helps.",
      "Pollinators increase fruit set—Bee activity detected."
    ],
    Consumer: [
      "Found ample food; energy levels rise.",
      "Competition increases; territory shrinks.",
      "Predator nearby—Wolf patrol detected."
    ],
    Decomposer: [
      "Organic matter rich; decomposition accelerates.",
      "Low moisture slows activity.",
      "Nutrient cycling improves soil health."
    ]
  };
  const pool = outcomes[item.role] || ["A day passes quietly in the ecosystem."];
  const event = pool[Math.floor(Math.random() * pool.length)];
  alert(`${item.name}: ${event}`);
}

function applyFilters() {
  const role = qs("#roleFilter").value;
  const term = qs("#searchInput").value.trim().toLowerCase();

  const filtered = organisms.filter(o => {
    const roleMatch = role === "all" ? true : o.role === role;
    const termMatch = term ? o.name.toLowerCase().includes(term) : true;
    return roleMatch && termMatch;
  });

  renderCards(filtered);
}

function init() {
  renderCards(organisms);

  // Events: filters
  qs("#roleFilter").addEventListener("change", applyFilters);
  qs("#searchInput").addEventListener("input", applyFilters);

  // Events: card clicks
  qs("#cardGrid").addEventListener("click", (e) => {
    const card = e.target.closest("article.card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    const item = organisms.find(o => o.id === id);
    if (!item) return;
    
    openDetails(item);
  });

  // Detail panel
  qs("#closeDetail").addEventListener("click", closeDetails);
  qs("#detailPanel").addEventListener("click", (e) => {
    if (e.target.id === "detailPanel") closeDetails();
  });
}

document.addEventListener("DOMContentLoaded", init);