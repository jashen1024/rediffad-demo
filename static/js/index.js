const DEFECT_IMAGE_BASE = "./static/images/defect-showcase";

const PRODUCT_RESULTS = [
  {
    id: "bottle",
    label: "Bottle",
    defects: ["broken_large", "broken_small", "contamination"],
  },
  {
    id: "cable",
    label: "Cable",
    defects: [
      "bent_wire",
      "cable_swap",
      "combined",
      "cut_inner_insulation",
      "cut_outer_insulation",
      "missing_cable",
      "missing_wire",
      "poke_insulation",
    ],
  },
  {
    id: "capsule",
    label: "Capsule",
    defects: ["crack", "faulty_imprint", "poke", "scratch", "squeeze"],
  },
  {
    id: "carpet",
    label: "Carpet",
    defects: ["color", "cut", "hole", "metal_contamination", "thread"],
  },
  {
    id: "grid",
    label: "Grid",
    defects: ["bent", "broken", "glue", "metal_contamination", "thread"],
  },
  {
    id: "hazelnut",
    label: "Hazelnut",
    defects: ["crack", "cut", "hole", "print"],
  },
  {
    id: "leather",
    label: "Leather",
    defects: ["color", "cut", "fold", "glue", "poke"],
  },
  {
    id: "metal_nut",
    label: "Metal Nut",
    defects: ["bent", "color", "flip", "scratch"],
  },
  {
    id: "pill",
    label: "Pill",
    defects: [
      "color",
      "combined",
      "contamination",
      "crack",
      "faulty_imprint",
      "pill_type",
      "scratch",
    ],
  },
  {
    id: "screw",
    label: "Screw",
    defects: ["manipulated_front", "scratch_head", "scratch_neck", "thread_side", "thread_top"],
  },
  {
    id: "tile",
    label: "Tile",
    defects: ["crack", "glue_strip", "gray_stroke", "oil", "rough"],
  },
  {
    id: "toothbrush",
    label: "Toothbrush",
    defects: ["defective"],
  },
  {
    id: "transistor",
    label: "Transistor",
    defects: ["bent_lead", "cut_lead", "damaged_case", "misplaced"],
  },
  {
    id: "wood",
    label: "Wood",
    defects: ["color", "combined", "hole", "liquid", "scratch"],
  },
  {
    id: "zipper",
    label: "Zipper",
    defects: [
      "broken_teeth",
      "combined",
      "fabric_border",
      "fabric_interior",
      "rough",
      "split_teeth",
      "squeezed_teeth",
    ],
  },
];

const REFERENCE_IDS = {
  "capsule/crack": "001",
  "capsule/scratch": "001",
  "wood/scratch": "003",
  "zipper/combined": "004",
};

function titleCase(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createImage(src, alt, className) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.className = className;
  image.loading = "lazy";
  image.decoding = "async";
  return image;
}

function setVisualState(button, showMask) {
  const sourceLabel = button.dataset.sourceLabel;
  const maskLabel = button.dataset.maskLabel;
  button.classList.toggle("is-mask-pinned", showMask);
  button.setAttribute("aria-pressed", String(showMask));
  button.setAttribute(
    "aria-label",
    showMask ? `Show ${sourceLabel}` : `Show ${maskLabel}`,
  );
}

function createVisual(product, defect, kind) {
  const isOurs = kind === "ours";
  const key = `${product.id}/${defect}`;
  const referenceId = REFERENCE_IDS[key] || "000";
  const directory = `${DEFECT_IMAGE_BASE}/${product.id}/${defect}`;
  const defectLabel = titleCase(defect);

  const sourcePath = isOurs
    ? `${directory}/edit/edit.webp`
    : `${directory}/reference/${referenceId}.webp`;
  const maskPath = isOurs
    ? `${directory}/mask/refine_mask.webp`
    : `${directory}/reference/${referenceId}_mask.webp`;
  const sourceName = isOurs ? "REDiff-AD result" : "reference image";
  const maskName = isOurs ? "paired pseudo-mask" : "ground-truth reference mask";

  const figure = document.createElement("figure");
  figure.className = `defect-figure${isOurs ? " defect-figure--ours" : ""}`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "defect-visual";
  button.dataset.sourceLabel = `${sourceName} for ${product.label}, ${defectLabel}`;
  button.dataset.maskLabel = `${maskName} for ${product.label}, ${defectLabel}`;
  setVisualState(button, false);

  button.appendChild(
    createImage(
      sourcePath,
      `${product.label} ${defectLabel}, ${sourceName}`,
      "source-image",
    ),
  );
  button.appendChild(createImage(maskPath, "", "mask-image"));

  const imageMode = document.createElement("span");
  imageMode.className = "visual-mode image-mode";
  imageMode.textContent = "Image";
  button.appendChild(imageMode);

  const maskMode = document.createElement("span");
  maskMode.className = "visual-mode mask-mode";
  maskMode.textContent = isOurs ? "Pseudo-mask" : "GT mask";
  button.appendChild(maskMode);

  button.addEventListener("click", () => {
    setVisualState(button, !button.classList.contains("is-mask-pinned"));
  });

  const caption = document.createElement("figcaption");
  const captionLabel = document.createElement(isOurs ? "strong" : "span");
  captionLabel.textContent = isOurs ? "REDiff-AD" : "Reference";
  caption.appendChild(captionLabel);

  const badge = document.createElement("span");
  if (isOurs) {
    badge.className = "ours-badge";
    badge.textContent = "Ours";
  } else {
    badge.textContent = "Real";
  }
  caption.appendChild(badge);

  figure.appendChild(button);
  figure.appendChild(caption);
  return figure;
}

function createDefectCard(product, defect) {
  const card = document.createElement("article");
  card.className = "defect-card";

  const title = document.createElement("h5");
  title.className = "defect-card__title";
  title.textContent = titleCase(defect);

  const pair = document.createElement("div");
  pair.className = "defect-pair";
  pair.appendChild(createVisual(product, defect, "reference"));
  pair.appendChild(createVisual(product, defect, "ours"));

  card.appendChild(title);
  card.appendChild(pair);
  return card;
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelector(".product-tabs");
  const panel = document.querySelector(".defect-results");
  const grid = document.getElementById("defect-grid");
  const productName = document.getElementById("active-product-name");
  const productSummary = document.getElementById("active-product-summary");
  const normalImage = document.getElementById("active-normal-image");

  if (!tabs || !panel || !grid || !productName || !productSummary || !normalImage) {
    return;
  }

  const tabButtons = PRODUCT_RESULTS.map((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "product-tab";
    button.id = `product-tab-${product.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "defect-results-panel");
    button.textContent = product.label;
    button.addEventListener("click", () => renderProduct(index));
    tabs.appendChild(button);
    return button;
  });

  function renderProduct(index) {
    const product = PRODUCT_RESULTS[index];
    const selectedTab = tabButtons[index];

    tabButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    panel.setAttribute("aria-labelledby", selectedTab.id);
    productName.textContent = product.label;
    productSummary.textContent = `${product.defects.length} defect ${product.defects.length === 1 ? "type" : "types"}`;
    normalImage.src = `${DEFECT_IMAGE_BASE}/${product.id}/good.webp`;
    normalImage.alt = `${product.label} normal target without defects`;

    const fragment = document.createDocumentFragment();
    product.defects.forEach((defect) => {
      fragment.appendChild(createDefectCard(product, defect));
    });
    grid.replaceChildren(fragment);
  }

  tabs.addEventListener("keydown", (event) => {
    const currentIndex = tabButtons.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabButtons.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabButtons.length - 1;
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    renderProduct(nextIndex);
    tabButtons[nextIndex].focus();
    tabButtons[nextIndex].scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  const initialProduct = PRODUCT_RESULTS.findIndex((product) => product.id === "hazelnut");
  renderProduct(initialProduct);
});
