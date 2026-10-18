import React, { useMemo, useState } from "react";

/**
 * LI-RADS Visual Calculator (CT/MRI v2018)
 * ---------------------------------------------------------------
 * This single-file React + Tailwind app uses the following sequence: observation type → special conditions → major features → size →
 * ancillary features → category. It also adds an optional image layer so you
 * can show real APHE/washout/capsule/threshold-growth examples from the LI-RADS
 * manual
 *
 * IMPORTANT: Educational aid only. Not a medical device. Do not use for primary
 * diagnosis. Verify with the official LI-RADS manual and institutional policy.
 */

import { Analytics } from "@vercel/analytics/react";

// -------- Special-question image imports --------
import ApheRim2 from "./assets/features/special/malignant-non-hcc/aphe-rim/positive/aphe-rim-ref11.png";
import ApheRim3 from "./assets/features/special/malignant-non-hcc/aphe-rim/positive/aphe-rim-ref12.png";
import ApheRim4 from "./assets/features/special/malignant-non-hcc/aphe-rim/positive/aphe-rim-ref13.png";
import ApheRim5 from "./assets/features/special/malignant-non-hcc/aphe-rim/positive/aphe-rim-ref14.png";
import ApheRim6 from "./assets/features/special/malignant-non-hcc/aphe-rim/positive/aphe-rim-ref15.png";

import PeripheralWashout1 from "./assets/features/special/malignant-non-hcc/peripheral-washout/examples/washout-peripheral1.png";
import PeripheralWashout2 from "./assets/features/special/malignant-non-hcc/peripheral-washout/examples/washout-peripheral2.png";
import PeripheralWashout3 from "./assets/features/special/malignant-non-hcc/peripheral-washout/examples/washout-peripheral3.png";
import PeripheralWashout4 from "./assets/features/special/malignant-non-hcc/peripheral-washout/examples/washout-peripheral-ex4.png";

import DelayedCentral1 from "./assets/features/special/malignant-non-hcc/delayed-central/examples/delayed-hyper-ex1.png";
import DelayedCentral2 from "./assets/features/special/malignant-non-hcc/delayed-central/examples/delayed-hyper-ex2.png";
import DelayedCentral3 from "./assets/features/special/malignant-non-hcc/delayed-central/examples/delayed-hyper-ex3.png";

import TpHbp1 from "./assets/features/special/malignant-non-hcc/tp-hbp/examples/targetoid-tp-or-hbp-ex1.png";

import TargRestriction1 from "./assets/features/special/malignant-non-hcc/targetoid-restriction/examples/targetoid-restriction-ex1.png";

import TivEx1 from "./assets/features/special/tiv/examples/tiv-ref1.png";
import TivEx2 from "./assets/features/special/tiv/examples/tiv-ref2.png";

import TivPit1 from "./assets/features/special/tiv/pitfalls/tiv-ex1-occludedVeinWithillDefinedWalls.png";
import TivPit2 from "./assets/features/special/tiv/pitfalls/tiv-ex2-RestrictedDiffusion.png";
import TivPit3 from "./assets/features/special/tiv/pitfalls/tiv-ex3-parenchymalMass.png";

import SizeRef from "./assets/features/size/SizeReferenceGuideUpdated.png";

import HemangEx1 from "./assets/features/benign-def/hemangioma/examples/def-benign-hemangioma-ex1.png";
import HemangPit1 from "./assets/features/benign-def/hemangioma/pitfalls/def-benign-hemangioma-pit1.png";
import HemangPit2 from "./assets/features/benign-def/hemangioma/pitfalls/benign-def-hemangioma-pit2.png";
import HemangPit3 from "./assets/features/benign-def/hemangioma/pitfalls/benign-def-hemangioma-pit3.png";
import HemangPit4 from "./assets/features/benign-def/hemangioma/pitfalls/benign-def-hemangioma-pit4.png";
import HemangPit5 from "./assets/features/benign-def/hemangioma/pitfalls/benign-def-hemangioma-pit5.png";

import PerfAlt1 from "./assets/features/benign-def/perfusion-alt/examples/benign-perfusion-alt-ex1.png";
import PerfAlt2 from "./assets/features/benign-def/perfusion-alt/examples/benign-perfusion-alt-ex2.png";

import confluentFib1 from "./assets/features/benign-def/confluentFib/benign-confluentFib-ex1.png";
import confluentFib2 from "./assets/features/benign-def/confluentFib/benign-confluentFib-ex2.png";
import confluentFib3 from "./assets/features/benign-def/confluentFib/benign-confluentFib-ex3.png";

import focalFat1 from "./assets/features/benign-def/focalFat/benign-focalFat-ex1.png";
import focalFat2 from "./assets/features/benign-def/focalFat/benign-focalFat-ex2.png";

import hyperPseudo from "./assets/features/benign-def/hypertrophicPseudo/benign-hypertrophicPseudo-ex1.png";

import focalScar from "./assets/features/benign-def/focalScar/benign-focalScar-ex1.png";

import vascularAnomaly from "./assets/features/benign-def/vascularAnomaly/benign-vascularAnomaly-ex1.png";

import distinctiveNodWithout1 from "./assets/features/benign-def/distinctiveNodWithoutMalig/benign-distinctiveNodWithoutMalig-ex1.png";
import distinctiveNodWithout2 from "./assets/features/benign-def/distinctiveNodWithoutMalig/benign-distinctiveNodWithoutMalig-ex2.png";

import liverAbEx1 from "./assets/features/benign-def/liverAbscess/examples/benign-liverAbscess-ex1.png";

// -------- Image helpers --------
type GalleryItem = { url: string; label: string };

// ✅ NEW: allow certain galleries to use wider lightbox sizing
type LightboxLayout = "default" | "wide";

function listFrom(
  mods: Record<string, string>,
  positiveLabel: string,
  negativeLabel: string
): GalleryItem[] {
  return Object.entries(mods).map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const isNegative = /(?:^|[_-])(neg|not|absent)/i.test(file);
    return { url, label: isNegative ? negativeLabel : positiveLabel };
  });
}

function parseFirstNumber(raw: string): number | null {
  if (!raw) return null;

  // Replace commas with dots (handles European decimal input like "5,5")
  const cleaned = raw.trim().replace(",", ".");

  // Grab the first number pattern in the string
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (!m) return null;

  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

function toMm(value: number, unit: "mm" | "cm"): number {
  return unit === "cm" ? value * 10 : value;
}

// function maxReportedSizeMm(
//   sizeA: string,
//   sizeB: string,
//   unit: "mm" | "cm"
// ): number | null {
//   const a = parseFirstNumber(sizeA);
//   const b = parseFirstNumber(sizeB);

//   if (a == null && b == null) return null;

//   const aMm = a == null ? null : toMm(a, unit);
//   const bMm = b == null ? null : toMm(b, unit);

//   if (aMm == null) return bMm;
//   if (bMm == null) return aMm;
//   return Math.max(aMm, bMm);
// }

type SizeBucket = "<10" | "10-19" | ">=20";

function bucketFromMm(mm: number): SizeBucket {
  if (mm < 10) return "<10";
  if (mm < 20) return "10-19";
  return ">=20";
}

// -------- Major-feature images (APHE, washout, capsule, growth) --------

const APHE_MODS = import.meta.glob(
  "./assets/features/aphe-nonrim/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;
const APHE_IMAGES = listFrom(APHE_MODS, "APHE present", "APHE not present");

const WASHOUT_MODS = import.meta.glob(
  "./assets/features/nonperipheral-washout/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;
const WASHOUT_IMAGES = listFrom(
  WASHOUT_MODS,
  "Nonperipheral washout",
  "No washout"
);

const CAPSULE_MODS = import.meta.glob(
  "./assets/features/capsule/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;
const CAPSULE_IMAGES = listFrom(
  CAPSULE_MODS,
  "Enhancing capsule",
  "No enhancing capsule"
);

const GROWTH_MODS = import.meta.glob(
  "./assets/features/growth/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;
const GROWTH_IMAGES = listFrom(
  GROWTH_MODS,
  "Threshold growth",
  "No threshold growth"
);

// Split APHE into examples vs pitfalls using labels
const APHE_EXAMPLE_IMAGES: GalleryItem[] = APHE_IMAGES.filter(
  (img) => img.label === "APHE present"
);
const APHE_PITFALL_IMAGES: GalleryItem[] = APHE_IMAGES.filter(
  (img) => img.label !== "APHE present"
);

// Split nonperipheral washout
const WASHOUT_EXAMPLE_IMAGES: GalleryItem[] = WASHOUT_IMAGES.filter(
  (img) => img.label === "Nonperipheral washout"
);
const WASHOUT_PITFALL_IMAGES: GalleryItem[] = WASHOUT_IMAGES.filter(
  (img) => img.label === "No washout"
);

// Split enhancing capsule
const CAPSULE_EXAMPLE_IMAGES: GalleryItem[] = CAPSULE_IMAGES.filter(
  (img) => img.label === "Enhancing capsule"
);
const CAPSULE_PITFALL_IMAGES: GalleryItem[] = CAPSULE_IMAGES.filter(
  (img) => img.label === "No enhancing capsule"
);

const LR_M_OVERRIDE_FEATURES = [
  {
    id: "infiltrative_appearance",
    label: "Infiltrative appearance",
  },
  {
    id: "necrosis",
    label: "Necrosis",
  },
  {
    id: "marked_diffusion_restriction",
    label: "Marked diffusion restriction",
  },
] as const;

// Re-usable benign sub-features used by LR-1 and LR-2

// -------- Special-question config --------

type SpecialKey =
  | "examCompromised"
  | "definitelyBenign"
  | "probablyBenign"
  | "tiv"
  | "malignantNotHcc";

type SpecialFeature = {
  id: string;
  label: string;
};

type ImagingModality = "" | "ct" | "mri";
type MriContrastAgent = "" | "extracellular" | "hepatobiliary";

interface ImagingSelection {
  modality: ImagingModality;
  mriContrastAgent: MriContrastAgent;
}

type SpecialVisualConfig =
  | { type: "simple"; keyPrefix: string }
  | { type: "features"; title: string; features: SpecialFeature[] };

const BENIGN_FEATURES: SpecialFeature[] = [
  // FeatureCheckboxPanel lays benign/probably-benign entities into two manual
  // columns so the left column ends with Other and does not stretch neighboring
  // cards when Other expands.
  { id: "cyst", label: "Cyst" },
  { id: "perfusionAlt", label: "Perfusion alteration" },
  { id: "hemangioma", label: "Hemangioma" },
  { id: "hepaticFat", label: "Hepatic fat deposition" },
  { id: "focalFat", label: "Focal fat sparing" },
  { id: "confluentFibrosis", label: "Confluent fibrosis" },
  { id: "otherBenign", label: "Other" },

  { id: "hyperPseudo", label: "Hypertrophic pseudomass" },
  { id: "focalScar", label: "Focal scar" },
  { id: "vascularAnomaly", label: "Vascular anomaly" },
  { id: "liverAbscess", label: "Liver abscess" },

  {
    id: "distinctiveNodWithout",
    label: "Distinctive nodule without malignant features",
  },
];

const DEFINITELY_BENIGN_FEATURES: SpecialFeature[] = BENIGN_FEATURES.filter(
  (f) => f.id !== "distinctiveNodWithout"
);

const PROBABLY_BENIGN_FEATURES: SpecialFeature[] = [
  ...DEFINITELY_BENIGN_FEATURES.map((feature) => ({
    ...feature,
    label:
      feature.id === "cyst"
        ? "Probable cyst"
        : feature.id === "hemangioma"
        ? "Probable hemangioma"
        : feature.id === "otherBenign"
        ? "Other"
        : `Probable ${feature.label.toLowerCase()}`,
  })),
  ...BENIGN_FEATURES.filter((f) => f.id === "distinctiveNodWithout"),
];

// Galleries keyed by logical name
const SPECIAL_GALLERIES: Record<string, GalleryItem[]> = {
  growth_examples: GROWTH_IMAGES,

  confluentFibrosis_positive: [
    { url: confluentFib1, label: "Confluent fibrosis example 1" },
    { url: confluentFib2, label: "Confluent fibrosis example 2" },
    { url: confluentFib3, label: "Confluent fibrosis example 3" },
  ],

  focalFat_positive: [
    { url: focalFat1, label: "Focal fat example 1" },
    { url: focalFat2, label: "Focal fat example 2" },
  ],

  hemangioma_positive: [{ url: HemangEx1, label: "Hemangioma" }],

  perfusionAlt_positive: [
    { url: PerfAlt1, label: "Perfusion alteration example 1" },
    { url: PerfAlt2, label: "Perfusion alteration example 2" },
  ],

  hemangioma_negative: [
    { url: HemangPit1, label: "Sclerosing hemangioma example 1" },
    { url: HemangPit2, label: "Sclerosing hemangioma example 2" },
    { url: HemangPit3, label: "Rapidly enhancing hemangioma example 1" },
    { url: HemangPit4, label: "Rapidly enhancing hemangioma example 2" },
    { url: HemangPit5, label: "Enhancement parallels blood pool" },
  ],

  focalNodularHyperplasia_positive: [],
  focalNodularHyperplasia_negative: [],

  hyperPseudo_positive: [
    { url: hyperPseudo, label: "Hypertrophic pseudomass example" },
  ],

  focalScar_positive: [{ url: focalScar, label: "Focal scar example" }],

  vascularAnomaly_positive: [
    { url: vascularAnomaly, label: "Vascular anomaly example" },
  ],

  distinctiveNodWithout_positive: [
    { url: distinctiveNodWithout1, label: "Distinctive nodule example 1" },
    { url: distinctiveNodWithout2, label: "Distinctive nodule example 2" },
  ],

  liverAbscess_positive: [{ url: liverAbEx1, label: "Liver abscess example" }],

  tiv_positive: [
    { url: TivEx1, label: "Tumor in vein example 1" },
    { url: TivEx2, label: "Tumor in vein example 2" },
  ],
  tiv_negative: [
    { url: TivPit1, label: "Occluded vein with ill-defined walls" },
    { url: TivPit2, label: "Restricted diffusion without enhancing TIV" },
    { url: TivPit3, label: "Parenchymal mass without definite TIV" },
  ],

  // Rim APHE
  rimAphe_positive: [
    { url: ApheRim2, label: "Rim APHE example 1" },
    { url: ApheRim3, label: "Rim APHE example 2" },
    { url: ApheRim4, label: "Rim APHE example 3" },
    { url: ApheRim5, label: "Rim APHE example 4" },
    { url: ApheRim6, label: "Rim APHE example 5" },
  ],

  // Peripheral washout (LR-M)
  peripheralWashout_positive: [
    { url: PeripheralWashout1, label: "Peripheral washout example 1 (CT)" },
    {
      url: PeripheralWashout2,
      label: "Peripheral washout example 2 (ECA-MRI)",
    },
    { url: PeripheralWashout3, label: "Peripheral washout example 3 (Gx-MRI)" },
    { url: PeripheralWashout4, label: "Peripheral washout example 4 (Gx-MRI)" },
  ],
  delayedCentralEnhancement_positive: [
    {
      url: DelayedCentral1,
      label: "Delayed central enhancement example 1 (CT)",
    },
    {
      url: DelayedCentral2,
      label: "Delayed central enhancement example 2 (ECA-MRI)",
    },
    {
      url: DelayedCentral3,
      label: "Delayed central enhancement example 3 (Gx-MRI)",
    },
  ],
  delayedCentralEnhancement_negative: [],

  targetoidTransitionalHbp_positive: [
    { url: TpHbp1, label: "Targetoid TP/HBP example" },
  ],
  targetoidTransitionalHbp_negative: [],

  targetoidDiffusionRestriction_positive: [
    { url: TargRestriction1, label: "Targetoid restriction example" },
  ],
  targetoidDiffusionRestriction_negative: [],

  size_reference: [
    { url: SizeRef, label: "Correct vs incorrect size measurement techniques" },
  ],

  // Major-feature examples/pitfalls
  aphe_examples: APHE_EXAMPLE_IMAGES,
  aphe_pitfalls: APHE_PITFALL_IMAGES,
  washout_examples: WASHOUT_EXAMPLE_IMAGES,
  washout_pitfalls: WASHOUT_PITFALL_IMAGES,
  capsule_examples: CAPSULE_EXAMPLE_IMAGES,
  capsule_pitfalls: CAPSULE_PITFALL_IMAGES,
};

// Special options + labels
const SPECIAL_OPTIONS: { value: SpecialKey | "none"; label: string }[] = [
  {
    value: "examCompromised",
    label:
      "The observation cannot be categorized due to image degradation or omission",
  },
  {
    value: "tiv",
    label: "The observation has definite enhancing tissue in vein (TIV)",
  },
  { value: "definitelyBenign", label: "The observation is definitely benign" },
  { value: "probablyBenign", label: "The observation is probably benign" },
  {
    value: "malignantNotHcc",
    label: "The observation has at least one targetoid imaging feature",
  },
  { value: "none", label: "None apply" },
];

// Visual config per special key
const SPECIAL_OPTION_CONFIG: Partial<Record<SpecialKey, SpecialVisualConfig>> =
  {
    examCompromised: { type: "simple", keyPrefix: "examCompromised" },
    tiv: { type: "simple", keyPrefix: "tiv" },
    malignantNotHcc: {
      type: "features",
      title: "TARGETOID FEATURES",
      features: [
        { id: "rimAphe", label: "Rim APHE" },
        { id: "peripheralWashout", label: "Peripheral washout" },
        {
          id: "delayedCentralEnhancement",
          label: "Delayed central enhancement",
        },
        {
          id: "targetoidDiffusionRestriction",
          label: "Targetoid diffusion restriction",
        },
        {
          id: "targetoidTransitionalHbp",
          label: "Targetoid transitional/hepatobiliary phase",
        },
      ],
    },
    definitelyBenign: {
      type: "features",
      title: "BENIGN PATTERNS",
      features: DEFINITELY_BENIGN_FEATURES,
    },

    probablyBenign: {
      type: "features",
      title: "PROBABLY BENIGN ENTITIES",
      features: PROBABLY_BENIGN_FEATURES,
    },
  };

function getAvailableTargetoidFeatures(
  imaging: ImagingSelection
): SpecialFeature[] {
  const config = SPECIAL_OPTION_CONFIG.malignantNotHcc;
  if (!config || config.type !== "features") return [];

  return config.features.filter((feature) => {
    if (imaging.modality === "ct") {
      return (
        feature.id !== "targetoidDiffusionRestriction" &&
        feature.id !== "targetoidTransitionalHbp"
      );
    }

    if (
      imaging.modality === "mri" &&
      imaging.mriContrastAgent === "extracellular"
    ) {
      return feature.id !== "targetoidTransitionalHbp";
    }

    return true;
  });
}

// --- helpers for special visual config ---

function hasGallery(key: string): boolean {
  return (SPECIAL_GALLERIES[key]?.length ?? 0) > 0;
}

function specialOptionHasVisuals(key: SpecialKey): boolean {
  const cfg = SPECIAL_OPTION_CONFIG[key];
  if (!cfg) return false;

  if (cfg.type === "simple") {
    const posKey = `${cfg.keyPrefix}_positive`;
    const negKey = `${cfg.keyPrefix}_negative`;
    return hasGallery(posKey) || hasGallery(negKey);
  }

  return cfg.features.some((f) => {
    const posKey = `${f.id}_positive`;
    const negKey = `${f.id}_negative`;
    return hasGallery(posKey) || hasGallery(negKey);
  });
}

// read current special selection from booleans
function getSelectedSpecial(u: UntreatedInputs): SpecialKey | "none" {
  if (u.examCompromised) return "examCompromised";
  if (u.definitelyBenign) return "definitelyBenign";
  if (u.probablyBenign) return "probablyBenign";
  if (u.tiv) return "tiv";
  if (u.malignantNotHcc) return "malignantNotHcc";
  return "none";
}

// LR recommendations shown in the output
const RECOMMENDATIONS: Record<string, string> = {
  "LR-TIV":
    "Multidisciplinary discussion for tailored workup. May include biopsy.",
  "LR-NC": "Repeat or alternative diagnostic imaging in ≤ 3 months.",
  "LR-M":
    "Multidisciplinary discussion for tailored workup. Often includes biopsy.",
  "LR-1": "Return to surveillance in 6 months.",
  "LR-2":
    "Return to surveillance in 6 months. Consider repeat diagnostic imaging in ≤ 6 months.",
  "LR-3": "Repeat or alternative diagnostic imaging in 3–6 months.",
  "LR-4":
    "Multidisciplinary discussion for tailored workup. May include biopsy.",
  "LR-5":
    "HCC confirmed. Multidisciplinary discussion for consensus management.",
};

const CATEGORY_COLORS: Record<
  string,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  "LR-NC": {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    color: "#111827",
  },
  "LR-TIV": {
    backgroundColor: "#E5E7EB",
    borderColor: "#010001",
    color: "#111827",
  },
  "LR-1": {
    backgroundColor: "#E6F5E1",
    borderColor: "#58BC3A",
    color: "#111827",
  },
  "LR-2": {
    backgroundColor: "#F0FADB",
    borderColor: "#8BCB32",
    color: "#111827",
  },
  "LR-3": {
    backgroundColor: "#FFFBC4",
    borderColor: "#D7C900",
    color: "#111827",
  },
  "LR-4": {
    backgroundColor: "#FCEAD7",
    borderColor: "#D47C21",
    color: "#111827",
  },
  "LR-5": {
    backgroundColor: "#FDE3E0",
    borderColor: "#D64032",
    color: "#111827",
  },
  "LR-M": {
    backgroundColor: "#F1DEDB",
    borderColor: "#882012",
    color: "#111827",
  },
};

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdn9ifHMhy2LwgmYPbMdC6AOEvL654C-s8NHCsJP6rY_XXjTw/viewform?usp=header";

// -------- Major-feature gallery (with zoom) --------

function CloseCircleButton({
  onClick,
  className = "",
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-full " +
        // subtle but visible contrast
        "bg-white/90 text-slate-525 border border-slate-200 shadow-sm " +
        "hover:bg-white hover:text-slate-900 hover:shadow " +
        "focus:outline-none focus:ring-2 focus:ring-blue-600/30 " +
        className
      }
    >
      {/* SVG is centered reliably; block prevents baseline drift */}
      <svg
        viewBox="0 0 24 24"
        className="block h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
      </svg>
    </button>
  );
}

// Lightbox for special-question galleries (examples/pitfalls) with zoom

// Ancillary feature summary choice
type AncillaryEffect = "malignancy" | "benignity" | "hcc";

type AncillaryFeature = {
  id: string;
  label: string;
  effect: AncillaryEffect;
};

const ANCILLARY_FEATURES: AncillaryFeature[] = [
  // Favoring malignancy
  {
    id: "us_visibility",
    label: "US visibility as discrete nodule",
    effect: "malignancy",
  },
  {
    id: "subthreshold_growth",
    label: "Subthreshold growth",
    effect: "malignancy",
  },
  {
    id: "restricted_diffusion",
    label: "Restricted diffusion",
    effect: "malignancy",
  },
  {
    id: "mild_moderate_t2",
    label: "Mild–moderate T2 hyperintensity",
    effect: "malignancy",
  },
  {
    id: "corona_enhancement",
    label: "Corona enhancement",
    effect: "malignancy",
  },
  {
    id: "tp_hbp_hypointensity",
    label: "Transitional or hepatobiliary phase hypointensity",
    effect: "malignancy",
  },
  {
    id: "iron_sparing",
    label: "Iron sparing in solid mass",
    effect: "malignancy",
  },
  {
    id: "blood_products",
    label: "Blood products in mass",
    effect: "malignancy",
  },

  // Favoring benignity
  {
    id: "size_stability",
    label: "Size stability > 2 years",
    effect: "benignity",
  },
  {
    id: "size_reduction",
    label: "Size reduction",
    effect: "benignity",
  },
  {
    id: "parallels_blood_pool",
    label: "Parallels blood pool / undistorted vessels",
    effect: "benignity",
  },
  {
    id: "iron_in_mass",
    label: "Iron in mass > liver",
    effect: "benignity",
  },
  {
    id: "marked_t2",
    label: "Marked T2 hyperintensity",
    effect: "benignity",
  },
  {
    id: "hbp_isointensity",
    label: "Hepatobiliary phase isointensity",
    effect: "benignity",
  },

  // Favoring HCC in particular
  {
    id: "nonenhancing_capsule",
    label: "Nonenhancing capsule",
    effect: "hcc",
  },
  {
    id: "nodule_in_nodule",
    label: "Nodule-in-nodule architecture",
    effect: "hcc",
  },
  {
    id: "mosaic_architecture",
    label: "Mosaic architecture",
    effect: "hcc",
  },
  {
    id: "fat_in_mass_more_than_liver",
    label: "Fat in mass, more than adjacent liver",
    effect: "hcc",
  },
  {
    id: "blood_products_hcc",
    label: "Blood products in mass",
    effect: "hcc",
  },
];

function getAvailableAncillaryFeatures(
  imaging: ImagingSelection
): AncillaryFeature[] {
  return ANCILLARY_FEATURES.filter((feature) => {
    if (imaging.modality === "ct") {
      return ![
        "hbp_isointensity",
        "tp_hbp_hypointensity",
        "mild_moderate_t2",
        "marked_t2",
        "restricted_diffusion",
      ].includes(feature.id);
    }

    if (
      imaging.modality === "mri" &&
      imaging.mriContrastAgent === "extracellular"
    ) {
      return !["hbp_isointensity", "tp_hbp_hypointensity"].includes(feature.id);
    }

    return true;
  });
}

function SpecialLightbox({
  //title,
  images,
  layout = "default",
  onClose,
}: {
  //title: string;
  images: GalleryItem[];
  layout?: LightboxLayout;
  onClose: () => void;
}) {
  const [idx, setIdx] = React.useState(0);

  const wrapClass =
    layout === "wide"
      ? "max-w-7xl max-h-[85vh] overflow-auto"
      : "max-w-5xl max-h-[80vh] overflow-auto";

  const imgWidthClass =
    layout === "wide" ? "w-[min(96vw,1500px)]" : "w-[min(92vw,1000px)]";

  React.useEffect(() => {
    if (!images.length) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % images.length);
        return;
      }
      if (e.key === "ArrowLeft") {
        setIdx((i) => (i + images.length - 1) % images.length);
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  if (!images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 p-4"
      onClick={() => {
        onClose();
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3">
          {/* <div className="text-sm text-white/80">{title}</div> */}

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-full bg-white/90 px-3 py-2 text-2xl text-gray-900 shadow"
              onClick={() => {
                setIdx((i) => (i + images.length - 1) % images.length);
              }}
              aria-label="Previous image"
            >
              ‹
            </button>

            <div className="relative">
              <CloseCircleButton
                className="absolute right-2 top-2 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(); // ✅ correct for SpecialLightbox
                }}
              />

              <div className={wrapClass}>
                <img
                  src={images[idx].url}
                  alt={images[idx].label}
                  className={
                    imgWidthClass + " max-h-[85vh] object-contain rounded-lg"
                  }
                />
              </div>
            </div>

            <button
              type="button"
              className="rounded-full bg-white/90 px-3 py-2 text-2xl text-gray-900 shadow"
              onClick={() => {
                setIdx((i) => (i + 1) % images.length);
              }}
              aria-label="Next image"
            >
              ›
            </button>
          </div>

          <div className="mt-2 text-center text-sm text-white/90">
            {images[idx].label} · {idx + 1}/{images.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// External image URLs for teaching tiles (optional)
interface ImageConfig {
  enabled: boolean;
  apheUrl: string;
  washoutUrl: string;
  capsuleUrl: string;
  tgUrl: string;
}

// Untreated inputs
type MajorFeatureStatus = "yes" | "no" | "nonEvaluable";

interface UntreatedInputs {
  examCompromised: boolean;
  definitelyBenign: boolean;
  probablyBenign: boolean;
  tiv: boolean;
  malignantNotHcc: boolean;

  aphe: boolean;
  capsule: boolean;
  washout: boolean;
  thresholdGrowth: boolean;

  apheStatus: MajorFeatureStatus;
  capsuleStatus: MajorFeatureStatus;
  washoutStatus: MajorFeatureStatus;
  thresholdGrowthStatus: MajorFeatureStatus;

  apheNonEvaluableReason: string;
  capsuleNonEvaluableReason: string;
  washoutNonEvaluableReason: string;
  thresholdGrowthNonEvaluableReason: string;

  sizeValue: string;
  sizeUnit: SizeUnit;
  sizeBucket: "<10" | "10-19" | ">=20";

  targetoidFeatureIds: string[];
  benignFeatureIds: string[];
  benignOtherText: string;

  lrMOverrideFeatureIds: string[];

  ancillaryFeatureIds: string[];
}

interface AppState {
  untreated: UntreatedInputs;
  images: ImageConfig;
  imaging: ImagingSelection;
  report: ReportMeta; // ✅ add
}

// ------------- Helpers -------------

// function Pill({ children }: { children: React.ReactNode }) {
//   return (
//     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 border">
//       {children}
//     </span>
//   );
// }

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-3xl border p-4 md:p-5 space-y-4">
      <div>
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
  category,
}: {
  label: string;
  value: string;
  detail?: string;
  category?: string;
}) {
  const categoryColors = category ? CATEGORY_COLORS[category] : undefined;
  const usesLightText = categoryColors?.color === "#FFFFFF";
  const isPending = !category;

  return (
    <div
      className="p-4 rounded-2xl border-2 bg-gray-50 shadow-sm"
      style={categoryColors}
    >
      <div
        className={
          "text-xs uppercase tracking-wide " +
          (usesLightText ? "text-white/80" : "text-black/70")
        }
      >
        {label}
      </div>
      <div
        className={
          isPending
            ? "mt-1 text-lg font-semibold text-gray-700"
            : "mt-1 text-2xl font-extrabold"
        }
      >
        {value}
      </div>
      {detail && (
        <div
          className={
            "text-sm mt-1 " +
            (usesLightText ? "text-white/80" : "text-black/70")
          }
        >
          {detail}
        </div>
      )}
    </div>
  );
}

// function RadioRow({
//   name,
//   value,
//   onChange,
//   options,
// }: {
//   name: string;
//   value: string;
//   onChange: (v: string) => void;
//   options: Array<{ value: string; label: string }>;
// }) {
//   return (
//     <div className="flex flex-col gap-3">
//       {options.map((opt) => (
//         <label
//           key={opt.value}
//           className="flex items-center gap-3 p-3 border rounded-2xl hover:shadow-sm cursor-pointer"
//         >
//           <input
//             type="radio"
//             name={name}
//             className="h-5 w-5 accent-blue-600"
//             checked={value === opt.value}
//             onChange={() => onChange(opt.value)}
//           />
//           <span className="font-medium">{opt.label}</span>
//         </label>
//       ))}
//     </div>
//   );
// }

// ------------- LI-RADS Decision Engine -------------

const CATEGORY_ORDER = ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5"] as const;

type UntreatedCategory =
  | (typeof CATEGORY_ORDER)[number]
  | "LR-M"
  | "LR-TIV"
  | "LR-NC";

type EngineResult = {
  category: UntreatedCategory | string;
  title: string;
  explanation: string[];
};

function computeBaseMajorCategory(inputs: UntreatedInputs): UntreatedCategory {
  const sizeBucket = inputs.sizeBucket;
  const hasAPHE = inputs.aphe;
  const hasWashout = inputs.washout;
  const hasCapsule = inputs.capsule;
  const hasTG = inputs.thresholdGrowth;
  const otherCount = [hasWashout, hasCapsule, hasTG].filter(Boolean).length;

  let base: UntreatedCategory = "LR-3";

  if (sizeBucket === "<10") {
    if (hasAPHE && (hasWashout || hasCapsule || hasTG)) {
      base = "LR-4";
    } else {
      base = "LR-3";
    }
  } else if (sizeBucket === "10-19") {
    if (hasAPHE && (hasWashout || hasTG)) {
      base = "LR-5";
    } else if (hasAPHE && otherCount >= 2) {
      base = "LR-5";
    } else if (
      hasAPHE &&
      otherCount === 1 &&
      hasCapsule &&
      !hasWashout &&
      !hasTG
    ) {
      base = "LR-4";
    } else if (hasAPHE && otherCount === 0) {
      base = "LR-3";
    } else if (!hasAPHE && otherCount >= 2) {
      base = "LR-4";
    } else {
      base = "LR-3";
    }
  } else if (sizeBucket === ">=20") {
    if (hasAPHE && otherCount >= 1) {
      base = "LR-5";
    } else if (hasAPHE && otherCount === 0) {
      base = "LR-4";
    } else if (!hasAPHE && otherCount >= 1) {
      base = "LR-4";
    } else {
      base = "LR-3";
    }
  }

  return base;
}

function computeUntreated(inputs: UntreatedInputs): EngineResult {
  const steps: string[] = [];

  if (inputs.examCompromised) {
    steps.push(
      "Exam compromised by artifact or missing phase(s) → LR-NC (non-categorizable)."
    );
    return {
      category: "LR-NC",
      title: "Non-categorizable",
      explanation: steps,
    };
  }
  if (inputs.definitelyBenign) {
    steps.push("Observation definitely benign → LR-1.");
    return { category: "LR-1", title: "Definitely Benign", explanation: steps };
  }
  if (inputs.probablyBenign) {
    steps.push("Observation probably benign → LR-2.");
    return { category: "LR-2", title: "Probably Benign", explanation: steps };
  }
  if (inputs.tiv) {
    steps.push("Definite tumor in vein (TIV) → LR-TIV.");
    return { category: "LR-TIV", title: "Tumor in Vein", explanation: steps };
  }
  if (inputs.malignantNotHcc) {
    steps.push("Probably/definitely malignant but not HCC-specific → LR-M.");
    return {
      category: "LR-M",
      title: "Probably/Definitely Malignant (non–HCC specific)",
      explanation: steps,
    };
  }

  const sizeBucket = inputs.sizeBucket;
  const hasAPHE = inputs.aphe;
  const hasWashout = inputs.washout;
  const hasCapsule = inputs.capsule;
  const hasTG = inputs.thresholdGrowth;
  const otherCount = [hasWashout, hasCapsule, hasTG].filter(Boolean).length;

  steps.push(`Size bucket: ${sizeBucket}`);
  steps.push(
    `Major features → APHE: ${hasAPHE ? "yes" : "no"}; washout: ${
      hasWashout ? "yes" : "no"
    }; capsule: ${hasCapsule ? "yes" : "no"}; threshold growth: ${
      hasTG ? "yes" : "no"
    }`
  );

  let base: UntreatedCategory = "LR-3";

  if (sizeBucket === "<10") {
    if (hasAPHE && (hasWashout || hasCapsule || hasTG)) {
      steps.push(
        "<10 mm with APHE and another major feature → LR-4 (cannot be LR-5 under 10 mm)."
      );
      base = "LR-4";
    } else {
      steps.push("<10 mm without sufficient features → LR-3.");
      base = "LR-3";
    }
  } else if (sizeBucket === "10-19") {
    if (hasAPHE && (hasWashout || hasTG)) {
      steps.push("10–19 mm + APHE + (washout OR threshold growth) → LR-5.");
      base = "LR-5";
    } else if (hasAPHE && otherCount >= 2) {
      steps.push(
        "10–19 mm + APHE + any two of {washout, capsule, threshold growth} → LR-5."
      );
      base = "LR-5";
    } else if (
      hasAPHE &&
      otherCount === 1 &&
      hasCapsule &&
      !hasWashout &&
      !hasTG
    ) {
      steps.push("10–19 mm + APHE + capsule only → LR-4.");
      base = "LR-4";
    } else if (hasAPHE && otherCount === 0) {
      steps.push("10–19 mm + APHE only → LR-3.");
      base = "LR-3";
    } else if (!hasAPHE && otherCount >= 2) {
      steps.push(
        "10–19 mm without APHE but with ≥2 other major features → LR-4."
      );
      base = "LR-4";
    } else {
      steps.push("10–19 mm without qualifying patterns → LR-3.");
      base = "LR-3";
    }
  } else if (sizeBucket === ">=20") {
    if (hasAPHE && otherCount >= 1) {
      steps.push(
        "≥20 mm + APHE + ≥1 of {washout, capsule, threshold growth} → LR-5."
      );
      base = "LR-5";
    } else if (hasAPHE && otherCount === 0) {
      steps.push("≥20 mm + APHE only → LR-4.");
      base = "LR-4";
    } else if (!hasAPHE && otherCount >= 1) {
      steps.push("≥20 mm without APHE but with ≥1 other major feature → LR-4.");
      base = "LR-4";
    } else {
      steps.push("≥20 mm without qualifying patterns → LR-3.");
      base = "LR-3";
    }
  }

  const selectedLrMOverrideFeatures = LR_M_OVERRIDE_FEATURES.filter((f) =>
    inputs.lrMOverrideFeatureIds.includes(f.id)
  );

  if (
    (base === "LR-3" || base === "LR-4") &&
    selectedLrMOverrideFeatures.length > 0
  ) {
    steps.push(
      `LR-M feature(s) present: ${selectedLrMOverrideFeatures
        .map((f) => f.label)
        .join("; ")} → LR-M.`
    );

    return {
      category: "LR-M",
      title: "Probably/Definitely Malignant (non–HCC specific)",
      explanation: steps,
    };
  }

  let finalCat: UntreatedCategory = base;

  const ORDER: readonly UntreatedCategory[] = [
    "LR-1",
    "LR-2",
    "LR-3",
    "LR-4",
    "LR-5",
  ] as const;
  const i = ORDER.indexOf(base);

  if (i !== -1) {
    const selectedAncillaryFeatures = ANCILLARY_FEATURES.filter((f) =>
      inputs.ancillaryFeatureIds.includes(f.id)
    );

    const hasFavoringMalignancy = selectedAncillaryFeatures.some(
      (f) => f.effect === "malignancy" || f.effect === "hcc"
    );

    const hasFavoringBenignity = selectedAncillaryFeatures.some(
      (f) => f.effect === "benignity"
    );

    if (hasFavoringMalignancy && !hasFavoringBenignity) {
      const upgraded = ORDER[Math.min(i + 1, ORDER.indexOf("LR-4"))];

      if (upgraded !== base) {
        steps.push(
          "Ancillary features favoring malignancy or HCC in particular: upgrade by one category, not above LR-4."
        );
        finalCat = upgraded as UntreatedCategory;
      }
    } else if (hasFavoringBenignity && !hasFavoringMalignancy) {
      const downgraded = ORDER[Math.max(i - 1, ORDER.indexOf("LR-1"))];

      if (downgraded !== base) {
        steps.push(
          "Ancillary features favoring benignity: downgrade by one category, not below LR-1."
        );
        finalCat = downgraded as UntreatedCategory;
      }
    } else if (hasFavoringMalignancy && hasFavoringBenignity) {
      steps.push(
        "Both malignancy/HCC-favoring and benignity-favoring ancillary features are present: no category adjustment applied."
      );
    }
  }

  const titles: Record<UntreatedCategory, string> = {
    "LR-1": "Definitely Benign",
    "LR-2": "Probably Benign",
    "LR-3": "Intermediate Probability of HCC",
    "LR-4": "Probably HCC",
    "LR-5": "Definite HCC",
    "LR-M": "Probably/Definitely Malignant (non–HCC specific)",
    "LR-TIV": "Tumor in Vein",
    "LR-NC": "Non-categorizable",
  } as const;

  return { category: finalCat, title: titles[finalCat], explanation: steps };
}

// -------- Styles for examples / pitfalls pills --------
const examplesButtonClass =
  "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100";

const majorExamplesPillClass =
  "inline-flex items-center gap-1 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700 hover:bg-blue-100";

// const ghostLinkClass =
//   "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium " +
//   "text-slate-700 hover:text-slate-900 hover:bg-slate-100 " +
//   "focus:outline-none focus:ring-2 focus:ring-blue-600/30";

const GALLERY_LAYOUT: Record<string, LightboxLayout> = {
  capsule_examples: "wide",
  tiv_positive: "wide",
  rimAphe_positive: "wide",
};

function renderSpecialVisualPanel(
  key: SpecialKey,
  openSpecialGallery: (
    title: string,
    galleryKey: string,
    layout?: LightboxLayout
  ) => void,
  featureOverride?: SpecialFeature[]
) {
  const cfg = SPECIAL_OPTION_CONFIG[key];
  if (!cfg) return null;

  // SIMPLE CASE (currently only TIV configured)
  if (cfg.type === "simple") {
    const posKey = `${cfg.keyPrefix}_positive`;
    const negKey = `${cfg.keyPrefix}_negative`;
    const hasPos = hasGallery(posKey);
    const hasNeg = hasGallery(negKey);
    if (!hasPos && !hasNeg) return null;

    return (
      <div className="mt-2 rounded-2xl border bg-gray-50 px-3 py-2 text-xs text-gray-700">
        <div className="flex gap-2">
          {hasPos && (
            <button
              type="button"
              className={examplesButtonClass}
              onClick={() =>
                openSpecialGallery(
                  "Examples of TIV (true tumor in vein)",
                  posKey
                )
              }
            >
              Examples
            </button>
          )}
        </div>
      </div>
    );
  }

  // The probably-benign panel doubles as a complete reference list, so show
  // every entity there even when an example image is not yet available.
  const configuredFeatures = featureOverride ?? cfg.features;
  const visibleFeatures =
    key === "probablyBenign"
      ? configuredFeatures
      : configuredFeatures.filter((f) => {
          const posKey = `${f.id}_positive`;
          const negKey = `${f.id}_negative`;
          return hasGallery(posKey) || hasGallery(negKey);
        });

  if (!visibleFeatures.length) return null;

  return (
    <div className="mt-2 rounded-2xl border bg-gray-50 px-3 py-2 text-xs text-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[13px] text-gray-700 tracking-wide uppercase">
          {cfg.title}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1">
        {visibleFeatures.map((f) => {
          const posKey = `${f.id}_positive`;
          const negKey = `${f.id}_negative`;
          const hasPos = hasGallery(posKey);
          const hasNeg = hasGallery(negKey);
          const hasAnyGallery = hasPos || hasNeg;

          return (
            <div key={f.id} className="flex items-center justify-between gap-3">
              {hasAnyGallery ? (
                <button
                  type="button"
                  onClick={() =>
                    openSpecialGallery(
                      `Visual references for what ${f.label} is`,
                      hasPos ? posKey : negKey
                    )
                  }
                  className={
                    "group w-full flex items-center justify-between rounded-xl px-3 py-2 " +
                    "text-left text-sm text-slate-800 " +
                    "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 " +
                    "border border-transparent hover:border-slate-200"
                  }
                >
                  <span className="leading-snug">{f.label}</span>

                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-slate-300 group-hover:text-slate-500"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <div className="w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm text-slate-800">
                  <span className="leading-snug">{f.label}</span>
                </div>
              )}

              {/* optional: if you ever add negatives/pitfalls later, you can add a second small button */}
            </div>
          );
        })}

        {key === "probablyBenign" && (
          <div className="relative min-h-[36px] sm:col-start-2">
            <div className="absolute inset-y-0 left-3 flex max-w-[280px] items-center text-left text-[11px] leading-snug text-slate-500">
              If unsure whether an entity is definitely or probably benign,
              categorize as probably benign.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------- App -------------

// function Alert({
//   title,
//   message,
//   actionLabel,
//   onAction,
//   variant = "danger",
// }: {
//   title: string;
//   message: string;
//   actionLabel?: string;
//   onAction?: () => void;
//   variant?: "danger" | "warning";
// }) {
//   const styles =
//     variant === "danger"
//       ? {
//           wrap: "border-red-200 bg-red-50 text-red-900",
//           title: "text-red-900",
//           msg: "text-red-800",
//           btn: "border-red-200 text-red-700 hover:bg-red-100",
//         }
//       : {
//           wrap: "border-red-200 bg-red-50 text-red-900",
//           title: "text-red-900",
//           msg: "text-red-800",
//           btn: "border-red-200 text-red-800 hover:bg-red-100",
//         };

//   return (
//     <div className={`rounded-2xl border px-4 py-3 ${styles.wrap}`}>
//       <div className={`font-semibold ${styles.title}`}>{title}</div>
//       <div className={`mt-1 text-sm ${styles.msg}`}>{message}</div>

//       {actionLabel && onAction && (
//         <div className="mt-3 flex justify-center">
//           <button
//             type="button"
//             className={`inline-flex items-center rounded-xl border bg-white px-3 py-2 text-sm font-medium ${styles.btn}`}
//             onClick={onAction}
//           >
//             {actionLabel}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

type SizeUnit = "mm" | "cm";

interface ReportMeta {
  observationNumber: string;
  segment: string;
  imageNumber: string;
  seriesNumber: string;
  tivVessels: string;
}

function SizeInputBlock({
  sizeValue,
  sizeUnit,
  onSizeChange,
  openSpecialGallery,
  title = "Size",
}: {
  sizeValue: string;
  sizeUnit: SizeUnit;
  title?: string;
  onSizeChange: (
    patch: Partial<Pick<UntreatedInputs, "sizeValue" | "sizeUnit">>
  ) => void;
  openSpecialGallery: (
    title: string,
    galleryKey: string,
    layout?: LightboxLayout
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 items-end sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
            {title}
          </div>
          <input
            type="number"
            min="0"
            step="0.1"
            value={sizeValue}
            onChange={(e) => onSizeChange({ sizeValue: e.target.value })}
            placeholder="e.g., 5"
            className="w-full rounded-2xl border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
            Units
          </div>
          <div className="inline-flex rounded-2xl border bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => onSizeChange({ sizeUnit: "mm" })}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold",
                sizeUnit === "mm"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-white",
              ].join(" ")}
            >
              mm
            </button>

            <button
              type="button"
              onClick={() => onSizeChange({ sizeUnit: "cm" })}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold",
                sizeUnit === "cm"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-white",
              ].join(" ")}
            >
              cm
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1 opacity-0">
            Reference
          </div>
          <button
            type="button"
            className="inline-flex h-[42px] items-center justify-center whitespace-nowrap rounded-2xl border border-blue-200 bg-blue-50 px-3 text-[12px] font-medium text-blue-700 hover:bg-blue-100"
            onClick={() =>
              openSpecialGallery(
                "How to measure observation size correctly",
                "size_reference"
              )
            }
          >
            How To Measure Size
          </button>
        </div>
      </div>
    </div>
  );
}

function MajorFeatureQuestion({
  title,
  name,
  status,
  reason,
  onChange,
  onReasonChange,
  examplesTitle,
  galleryKey,
  openSpecialGallery,
  galleryLayout,
}: {
  title: string;
  name: string;
  status: MajorFeatureStatus;
  reason: string;
  onChange: (status: MajorFeatureStatus) => void;
  onReasonChange: (reason: string) => void;
  examplesTitle: string;
  galleryKey: string;
  openSpecialGallery: (
    title: string,
    galleryKey: string,
    layout?: LightboxLayout
  ) => void;
  galleryLayout?: LightboxLayout;
}) {
  return (
    <Section title={title}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-3">
        <div className="flex flex-col gap-3">
          <label className="flex w-full items-center gap-3 p-3 border rounded-2xl hover:shadow-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              className="h-5 w-5 accent-blue-600"
              checked={status === "yes"}
              onChange={() => onChange("yes")}
            />
            <span className="font-medium">Yes</span>
          </label>

          <label className="flex w-full items-center gap-3 p-3 border rounded-2xl hover:shadow-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              className="h-5 w-5 accent-blue-600"
              checked={status === "no"}
              onChange={() => onChange("no")}
            />
            <span className="font-medium">No (or unsure)</span>
          </label>

          <label className="flex w-full items-center gap-3 p-3 border rounded-2xl hover:shadow-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              className="h-5 w-5 accent-blue-600"
              checked={status === "nonEvaluable"}
              onChange={() => onChange("nonEvaluable")}
            />
            <span className="font-medium">Non-evaluable</span>
          </label>

          {status === "nonEvaluable" && (
            <div className="rounded-2xl border bg-gray-50 p-3">
              <div className="mb-1 text-xs font-semibold text-gray-700">
                Reason non-evaluable
              </div>
              <input
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="e.g., arterial phase timing, motion artifact, missing phase"
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="h-full self-stretch">
          <button
            type="button"
            className={majorExamplesPillClass + " h-full self-stretch px-4"}
            onClick={() =>
              openSpecialGallery(examplesTitle, galleryKey, galleryLayout)
            }
          >
            <span className="text-[14px]" aria-hidden="true">
              👁
            </span>
            <span className="hidden sm:inline">Examples</span>
          </button>
        </div>
      </div>
    </Section>
  );
}

function FeatureCheckboxPanel({
  title,
  features,
  selectedIds,
  onToggle,
  openSpecialGallery,
  otherText,
  onOtherTextChange,
}: {
  title: string;
  features: SpecialFeature[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  openSpecialGallery: (
    title: string,
    galleryKey: string,
    layout?: LightboxLayout
  ) => void;
  otherText?: string;
  onOtherTextChange?: (value: string) => void;
}) {
  const isBenignEntityPanel = features.some(
    (feature) => feature.id === "otherBenign"
  );

  const benignLeftColumnOrder = [
    "cyst",
    "perfusionAlt",
    "hemangioma",
    "hepaticFat",
    "focalFat",
    "confluentFibrosis",
    "otherBenign",
  ];

  const renderFeatureCard = (feature: SpecialFeature) => {
    const galleryKey = `${feature.id}_positive`;
    const hasVisuals = hasGallery(galleryKey);

    const isOther = feature.id === "otherBenign";
    const isSelected = selectedIds.includes(feature.id);

    return (
      <div key={feature.id} className="rounded-xl border bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-blue-600"
              checked={isSelected}
              onChange={() => onToggle(feature.id)}
            />
            <span className="text-sm text-gray-800">{feature.label}</span>
          </label>

          {hasVisuals && (
            <button
              type="button"
              aria-label={`Images for ${feature.label}`}
              className="ml-2 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700 hover:bg-blue-100"
              onClick={() =>
                openSpecialGallery(
                  `Visual references for ${feature.label}`,
                  galleryKey,
                  GALLERY_LAYOUT[galleryKey]
                )
              }
            >
              <span className="text-[14px]" aria-hidden="true">
                👁
              </span>
            </button>
          )}
        </div>

        {isOther && isSelected && onOtherTextChange && (
          <div className="mt-3">
            <input
              value={otherText ?? ""}
              onChange={(e) => onOtherTextChange(e.target.value)}
              placeholder="Describe other benign entity"
              className="w-full rounded-2xl border px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>
    );
  };

  const orderedBenignLeftFeatures = benignLeftColumnOrder
    .map((id) => features.find((feature) => feature.id === id))
    .filter((feature): feature is SpecialFeature => Boolean(feature));

  const benignLeftIds = new Set(benignLeftColumnOrder);
  const benignRightFeatures = features.filter(
    (feature) => !benignLeftIds.has(feature.id)
  );

  return (
    <div className="rounded-2xl border bg-gray-50 px-3 py-3">
      <div className="mb-3 text-sm font-bold text-gray-900">{title}</div>

      {isBenignEntityPanel ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
          <div className="space-y-2">
            {orderedBenignLeftFeatures.map(renderFeatureCard)}
          </div>

          <div className="space-y-2">
            {benignRightFeatures.map(renderFeatureCard)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
          {features.map(renderFeatureCard)}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>({
    untreated: {
      examCompromised: false,
      definitelyBenign: false,
      probablyBenign: false,
      tiv: false,
      malignantNotHcc: false,
      aphe: false,
      capsule: false,
      washout: false,
      thresholdGrowth: false,
      apheStatus: "no",
      capsuleStatus: "no",
      washoutStatus: "no",
      thresholdGrowthStatus: "no",
      apheNonEvaluableReason: "",
      capsuleNonEvaluableReason: "",
      washoutNonEvaluableReason: "",
      thresholdGrowthNonEvaluableReason: "",
      sizeValue: "",
      sizeUnit: "mm",
      sizeBucket: "10-19",
      targetoidFeatureIds: [],
      benignFeatureIds: [],
      benignOtherText: "",
      lrMOverrideFeatureIds: [],
      ancillaryFeatureIds: [],
    },
    images: {
      enabled: true,
      apheUrl: "",
      washoutUrl: "",
      capsuleUrl: "",
      tgUrl: "",
    },
    imaging: {
      modality: "",
      mriContrastAgent: "",
    },
    report: {
      observationNumber: "",
      segment: "",
      imageNumber: "",
      seriesNumber: "",
      tivVessels: "",
    },
  });

  // const [isEditingSize, setIsEditingSize] = useState(false);

  // const sizeBlurTimerRef = React.useRef<number | null>(null);

  // const handleSizeFocus = () => {
  //   if (sizeBlurTimerRef.current) {
  //     window.clearTimeout(sizeBlurTimerRef.current);
  //     sizeBlurTimerRef.current = null;
  //   }
  //   setIsEditingSize(true);
  // };

  // const handleSizeBlur = () => {
  //   // Delay so switching between the two size inputs doesn't flash warnings
  //   sizeBlurTimerRef.current = window.setTimeout(() => {
  //     setIsEditingSize(false);
  //     sizeBlurTimerRef.current = null;
  //   }, 120);
  // };

  const [expandedSpecialKey, setExpandedSpecialKey] =
    useState<SpecialKey | null>(null);

  // ✅ UPDATED: store optional layout per gallery
  const [specialGallery, setSpecialGallery] = useState<{
    title: string;
    items: GalleryItem[];
    layout?: LightboxLayout;
  } | null>(null);

  const resultsRailRef = React.useRef<HTMLDivElement | null>(null);
  const [resultsRailNeedsScroll, setResultsRailNeedsScroll] = useState(false);

  const setReport = (patch: Partial<ReportMeta>) =>
    setState((s) => ({ ...s, report: { ...s.report, ...patch } }));

  const setImaging = (patch: Partial<ImagingSelection>) =>
    setState((s) => {
      const nextImaging = { ...s.imaging, ...patch };
      const availableTargetoidIds = new Set(
        getAvailableTargetoidFeatures(nextImaging).map((feature) => feature.id)
      );
      const availableAncillaryIds = new Set(
        getAvailableAncillaryFeatures(nextImaging).map((feature) => feature.id)
      );

      return {
        ...s,
        imaging: nextImaging,
        untreated: {
          ...s.untreated,
          targetoidFeatureIds: s.untreated.targetoidFeatureIds.filter((id) =>
            availableTargetoidIds.has(id)
          ),
          ancillaryFeatureIds: s.untreated.ancillaryFeatureIds.filter((id) =>
            availableAncillaryIds.has(id)
          ),
        },
      };
    });

  const result: EngineResult = useMemo(
    () => computeUntreated(state.untreated),
    [state.untreated]
  );

  React.useLayoutEffect(() => {
    const rail = resultsRailRef.current;
    if (!rail) return;

    const updateResultsRail = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        setResultsRailNeedsScroll(false);
        return;
      }

      const stickyTop = 24;
      const bottomGap = 12;
      const tolerance = 8;
      const availableHeight = window.innerHeight - stickyTop - bottomGap;
      const naturalHeight = rail.scrollHeight;

      setResultsRailNeedsScroll(naturalHeight > availableHeight + tolerance);
    };

    updateResultsRail();

    const resizeObserver = new ResizeObserver(updateResultsRail);
    resizeObserver.observe(rail);

    const mutationObserver = new MutationObserver(updateResultsRail);
    mutationObserver.observe(rail, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", updateResultsRail);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateResultsRail);
    };
  }, []);

  const setUntreated = (patch: Partial<UntreatedInputs>) =>
    setState((s) => ({
      ...s,
      untreated: { ...s.untreated, ...patch },
    }));

  const toggleLrMOverrideFeature = (id: string) => {
    setState((s) => {
      const selected = s.untreated.lrMOverrideFeatureIds;
      const nextSelected = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];

      return {
        ...s,
        untreated: {
          ...s.untreated,
          lrMOverrideFeatureIds: nextSelected,
        },
      };
    });
  };

  const toggleTargetoidFeature = (id: string) => {
    setState((s) => {
      const selected = s.untreated.targetoidFeatureIds;
      const nextSelected = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];

      return {
        ...s,
        untreated: {
          ...s.untreated,
          targetoidFeatureIds: nextSelected,
        },
      };
    });
  };

  const toggleBenignFeature = (id: string) => {
    setState((s) => {
      const selected = s.untreated.benignFeatureIds;
      const nextSelected = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];

      return {
        ...s,
        untreated: {
          ...s.untreated,
          benignFeatureIds: nextSelected,
        },
      };
    });
  };

  const toggleAncillaryFeature = (id: string) => {
    setState((s) => {
      const selected = s.untreated.ancillaryFeatureIds;
      const nextSelected = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];

      return {
        ...s,
        untreated: {
          ...s.untreated,
          ancillaryFeatureIds: nextSelected,
        },
      };
    });
  };

  const updateSize = (
    patch: Partial<Pick<UntreatedInputs, "sizeValue" | "sizeUnit">>
  ) => {
    setState((s) => {
      const nextSizeValue = patch.sizeValue ?? s.untreated.sizeValue;
      const nextSizeUnit = patch.sizeUnit ?? s.untreated.sizeUnit;

      const parsed = parseFirstNumber(nextSizeValue);
      const nextBucket =
        parsed == null
          ? s.untreated.sizeBucket
          : bucketFromMm(toMm(parsed, nextSizeUnit));

      return {
        ...s,
        untreated: {
          ...s.untreated,
          ...patch,
          sizeBucket: nextBucket,
        },
      };
    });
  };

  const [copied, setCopied] = useState(false);

  const [hasAnsweredInitialQuestion, setHasAnsweredInitialQuestion] =
    useState(false);

  const setSpecial = (which: SpecialKey | "none") => {
    setHasAnsweredInitialQuestion(true);
    setState((s) => ({
      ...s,
      untreated: {
        ...s.untreated,
        examCompromised: which === "examCompromised",
        definitelyBenign: which === "definitelyBenign",
        probablyBenign: which === "probablyBenign",
        tiv: which === "tiv",
        malignantNotHcc: which === "malignantNotHcc",

        // Clear conditional feature selections when switching major pathway
        targetoidFeatureIds:
          which === "malignantNotHcc" ? s.untreated.targetoidFeatureIds : [],
        benignFeatureIds:
          which === "definitelyBenign" || which === "probablyBenign"
            ? s.untreated.benignFeatureIds
            : [],
        benignOtherText:
          which === "definitelyBenign" || which === "probablyBenign"
            ? s.untreated.benignOtherText
            : "",
      },
    }));
  };

  const selectedSpecial = getSelectedSpecial(state.untreated);

  const imagingSelectionComplete =
    state.imaging.modality === "ct" ||
    (state.imaging.modality === "mri" && state.imaging.mriContrastAgent !== "");

  const showCalculatedResult =
    imagingSelectionComplete && hasAnsweredInitialQuestion;

  const availableTargetoidFeatures = useMemo(
    () => getAvailableTargetoidFeatures(state.imaging),
    [state.imaging]
  );

  const availableAncillaryFeatures = useMemo(
    () => getAvailableAncillaryFeatures(state.imaging),
    [state.imaging]
  );

  const baseMajorCategory = computeBaseMajorCategory(state.untreated);

  const showLrMOverrideBox =
    selectedSpecial === "none" &&
    (baseMajorCategory === "LR-3" || baseMajorCategory === "LR-4");

  React.useEffect(() => {
    if (
      !showLrMOverrideBox &&
      state.untreated.lrMOverrideFeatureIds.length > 0
    ) {
      setState((s) => ({
        ...s,
        untreated: {
          ...s.untreated,
          lrMOverrideFeatureIds: [],
        },
      }));
    }
  }, [showLrMOverrideBox, state.untreated.lrMOverrideFeatureIds.length]);

  const reset = () => window.location.reload();

  // ✅ UPDATED: accept layout override
  const openSpecialGallery = (
    title: string,
    galleryKey: string,
    layout?: LightboxLayout
  ) => {
    const items = SPECIAL_GALLERIES[galleryKey] ?? [];
    if (!items.length) return;

    const resolvedLayout: LightboxLayout =
      layout ?? GALLERY_LAYOUT[galleryKey] ?? "default";

    setSpecialGallery({ title, items, layout: resolvedLayout });
  };

  const setMajorFeatureStatus = (
    feature: "aphe" | "capsule" | "washout" | "thresholdGrowth",
    status: MajorFeatureStatus
  ) => {
    const statusKey = `${feature}Status` as keyof UntreatedInputs;
    const reasonKey = `${feature}NonEvaluableReason` as keyof UntreatedInputs;

    setUntreated({
      [feature]: status === "yes",
      [statusKey]: status,
      ...(status !== "nonEvaluable" ? { [reasonKey]: "" } : {}),
    } as Partial<UntreatedInputs>);
  };

  const setMajorFeatureNonEvaluableReason = (
    feature: "aphe" | "capsule" | "washout" | "thresholdGrowth",
    reason: string
  ) => {
    const reasonKey = `${feature}NonEvaluableReason` as keyof UntreatedInputs;
    setUntreated({ [reasonKey]: reason } as Partial<UntreatedInputs>);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {specialGallery && (
        <SpecialLightbox
          //title={specialGallery.title}
          images={specialGallery.items}
          layout={specialGallery.layout ?? "default"}
          onClose={() => setSpecialGallery(null)}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        <style>{`
          @keyframes result-change {
            0% { opacity: 0.72; transform: translateY(-2px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @media (prefers-reduced-motion: reduce) {
            .result-update { animation: none !important; }
          }

          .results-rail {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }

          .results-rail::-webkit-scrollbar {
            width: 6px;
          }

          .results-rail::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 999px;
          }
        `}</style>

        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              LI-RADS v2018 Visual Calculator
            </h1>
            <p className="text-gray-600">
              Calculator with visual references to features relevant to LI-RADS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-2xl border bg-white hover:bg-gray-50"
            >
              Reset Calculator
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Imaging Modality">
              <div className="space-y-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-gray-700">
                    Select the imaging modality
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { value: "ct", label: "CT" },
                      { value: "mri", label: "MRI" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3 hover:shadow-sm"
                      >
                        <input
                          type="radio"
                          name="imaging-modality"
                          className="h-5 w-5 accent-blue-600"
                          checked={state.imaging.modality === option.value}
                          onChange={() =>
                            setImaging({
                              modality: option.value as ImagingModality,
                              mriContrastAgent: "",
                            })
                          }
                        />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {state.imaging.modality === "mri" && (
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold text-gray-700">
                      Select the MRI contrast agent
                    </legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          value: "extracellular",
                          label: "Extracellular agent",
                        },
                        {
                          value: "hepatobiliary",
                          label: "Hepatobiliary agent",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3 hover:shadow-sm"
                        >
                          <input
                            type="radio"
                            name="mri-contrast-agent"
                            className="h-5 w-5 accent-blue-600"
                            checked={
                              state.imaging.mriContrastAgent === option.value
                            }
                            onChange={() =>
                              setImaging({
                                mriContrastAgent:
                                  option.value as MriContrastAgent,
                              })
                            }
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            </Section>

            <Section
              title="Case Report Fields"
              subtitle="These values will be inserted into the auto-generated report."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Observation # */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
                    Observation #
                  </div>
                  <input
                    value={state.report.observationNumber}
                    onChange={(e) =>
                      setReport({ observationNumber: e.target.value })
                    }
                    placeholder="e.g., 1"
                    className="w-full rounded-2xl border px-3 py-2"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
                    Segment (S)
                  </div>
                  <input
                    value={state.report.segment}
                    onChange={(e) => setReport({ segment: e.target.value })}
                    placeholder="e.g., 2, 4a, 7-8"
                    className="w-full rounded-2xl border px-3 py-2"
                  />
                </div>
              </div>
            </Section>
            <Section title="Do any of the following apply?">
              <div className="flex flex-col gap-3">
                {SPECIAL_OPTIONS.map((opt) => {
                  const key = opt.value;
                  const isNone = key === "none";
                  const isChecked = selectedSpecial === key;
                  const hasVisuals =
                    !isNone && specialOptionHasVisuals(key as SpecialKey);

                  return (
                    <div key={key} className="space-y-1">
                      <label className="flex items-center justify-between gap-3 p-3 border rounded-2xl hover:shadow-sm cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="special"
                            className="h-5 w-5 accent-blue-600"
                            checked={hasAnsweredInitialQuestion && isChecked}
                            onChange={() =>
                              setSpecial(key as SpecialKey | "none")
                            }
                          />
                          <span className="font-medium">{opt.label}</span>
                        </div>

                        {!isNone && hasVisuals && (
                          <button
                            type="button"
                            className="ml-2 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700 hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation();

                              // ✅ TIV: open examples immediately (no pitfalls, no expand panel)
                              if (key === "tiv") {
                                openSpecialGallery(
                                  "Examples of TIV (true tumor in vein)",
                                  "tiv_positive",
                                  "wide"
                                );
                                setExpandedSpecialKey(null);
                                return;
                              }

                              // Default behavior for other special options
                              setExpandedSpecialKey((prev) =>
                                prev === key ? null : (key as SpecialKey)
                              );
                            }}
                          >
                            <span className="text-[14px]" aria-hidden="true">
                              👁
                            </span>
                            <span className="hidden sm:inline">Examples</span>
                          </button>
                        )}
                      </label>

                      {!isNone &&
                        hasVisuals &&
                        key !== "tiv" &&
                        expandedSpecialKey === key &&
                        renderSpecialVisualPanel(
                          key as SpecialKey,
                          openSpecialGallery,
                          key === "malignantNotHcc"
                            ? availableTargetoidFeatures
                            : undefined
                        )}
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Observation Details">
              <div className="space-y-4">
                {/* Size is now always here, regardless of pathway */}
                <SizeInputBlock
                  title={
                    selectedSpecial === "tiv"
                      ? "Size of parenchymal component, if visible"
                      : selectedSpecial === "examCompromised"
                      ? "Size, if measurable"
                      : "Largest dimension"
                  }
                  sizeValue={state.untreated.sizeValue}
                  sizeUnit={state.untreated.sizeUnit}
                  onSizeChange={updateSize}
                  openSpecialGallery={openSpecialGallery}
                />

                {selectedSpecial === "tiv" && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
                      Vessels involved
                    </div>
                    <input
                      value={state.report.tivVessels}
                      onChange={(e) =>
                        setReport({ tivVessels: e.target.value })
                      }
                      placeholder="e.g., right portal vein, main portal vein"
                      className="w-full rounded-2xl border px-3 py-2"
                    />
                  </div>
                )}

                {selectedSpecial === "malignantNotHcc" &&
                  SPECIAL_OPTION_CONFIG.malignantNotHcc?.type ===
                    "features" && (
                    <FeatureCheckboxPanel
                      title="Select the targetoid features present:"
                      features={availableTargetoidFeatures}
                      selectedIds={state.untreated.targetoidFeatureIds}
                      onToggle={toggleTargetoidFeature}
                      openSpecialGallery={openSpecialGallery}
                    />
                  )}

                {selectedSpecial === "definitelyBenign" &&
                  SPECIAL_OPTION_CONFIG.definitelyBenign?.type ===
                    "features" && (
                    <FeatureCheckboxPanel
                      title="Select the benign entities present:"
                      features={SPECIAL_OPTION_CONFIG.definitelyBenign.features}
                      selectedIds={state.untreated.benignFeatureIds}
                      onToggle={toggleBenignFeature}
                      openSpecialGallery={openSpecialGallery}
                      otherText={state.untreated.benignOtherText}
                      onOtherTextChange={(value) =>
                        setUntreated({ benignOtherText: value })
                      }
                    />
                  )}

                {selectedSpecial === "probablyBenign" &&
                  SPECIAL_OPTION_CONFIG.probablyBenign?.type === "features" && (
                    <FeatureCheckboxPanel
                      title="Select the probably benign entities present:"
                      features={SPECIAL_OPTION_CONFIG.probablyBenign.features}
                      selectedIds={state.untreated.benignFeatureIds}
                      onToggle={toggleBenignFeature}
                      openSpecialGallery={openSpecialGallery}
                      otherText={state.untreated.benignOtherText}
                      onOtherTextChange={(value) =>
                        setUntreated({ benignOtherText: value })
                      }
                    />
                  )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image # */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
                      Image #
                    </div>
                    <input
                      value={state.report.imageNumber}
                      onChange={(e) =>
                        setReport({ imageNumber: e.target.value })
                      }
                      placeholder="e.g., 34"
                      className="w-full rounded-2xl border px-3 py-2"
                    />
                  </div>

                  {/* Series # */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-700 leading-none mb-1 pl-1">
                      Series #
                    </div>
                    <input
                      value={state.report.seriesNumber}
                      onChange={(e) =>
                        setReport({ seriesNumber: e.target.value })
                      }
                      placeholder="e.g., 7"
                      className="w-full rounded-2xl border px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </Section>

            {selectedSpecial === "none" && (
              <>
                <MajorFeatureQuestion
                  title="Is nonrim arterial phase hyperenhancement unequivocally present?"
                  name="aphe"
                  status={state.untreated.apheStatus}
                  reason={state.untreated.apheNonEvaluableReason}
                  onChange={(status) => setMajorFeatureStatus("aphe", status)}
                  onReasonChange={(reason) =>
                    setMajorFeatureNonEvaluableReason("aphe", reason)
                  }
                  examplesTitle="Examples of nonrim APHE (APHE present)"
                  galleryKey="aphe_examples"
                  openSpecialGallery={openSpecialGallery}
                />

                <MajorFeatureQuestion
                  title="Is enhancing capsule unequivocally present?"
                  name="capsule"
                  status={state.untreated.capsuleStatus}
                  reason={state.untreated.capsuleNonEvaluableReason}
                  onChange={(status) =>
                    setMajorFeatureStatus("capsule", status)
                  }
                  onReasonChange={(reason) =>
                    setMajorFeatureNonEvaluableReason("capsule", reason)
                  }
                  examplesTitle="Examples of enhancing capsule"
                  galleryKey="capsule_examples"
                  galleryLayout="wide"
                  openSpecialGallery={openSpecialGallery}
                />

                <MajorFeatureQuestion
                  title="Is nonperipheral washout unequivocally present?"
                  name="washout"
                  status={state.untreated.washoutStatus}
                  reason={state.untreated.washoutNonEvaluableReason}
                  onChange={(status) =>
                    setMajorFeatureStatus("washout", status)
                  }
                  onReasonChange={(reason) =>
                    setMajorFeatureNonEvaluableReason("washout", reason)
                  }
                  examplesTitle="Examples of nonperipheral washout"
                  galleryKey="washout_examples"
                  openSpecialGallery={openSpecialGallery}
                />

                <MajorFeatureQuestion
                  title="Is threshold growth unequivocally present (≥ 50% in ≤ 6 months)?"
                  name="thresholdGrowth"
                  status={state.untreated.thresholdGrowthStatus}
                  reason={state.untreated.thresholdGrowthNonEvaluableReason}
                  onChange={(status) =>
                    setMajorFeatureStatus("thresholdGrowth", status)
                  }
                  onReasonChange={(reason) =>
                    setMajorFeatureNonEvaluableReason("thresholdGrowth", reason)
                  }
                  examplesTitle="Visual references for threshold growth"
                  galleryKey="growth_examples"
                  openSpecialGallery={openSpecialGallery}
                />
              </>
            )}

            {showLrMOverrideBox && (
              <Section title="Are any non-targetoid features present?">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LR_M_OVERRIDE_FEATURES.map((feature) => (
                    <label
                      key={feature.id}
                      className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-blue-600"
                        checked={state.untreated.lrMOverrideFeatureIds.includes(
                          feature.id
                        )}
                        onChange={() => toggleLrMOverrideFeature(feature.id)}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {feature.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>
            )}

            {/* Ancillary */}
            {String(result.category) !== "LR-M" && (
              <Section title="Select any ancillary features present:">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="mb-3 text-sm font-bold text-gray-900">
                        Favoring malignancy
                      </div>

                      <div className="space-y-2">
                        {availableAncillaryFeatures
                          .filter((f) => f.effect === "malignancy")
                          .map((feature) => (
                            <label
                              key={feature.id}
                              className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                checked={state.untreated.ancillaryFeatureIds.includes(
                                  feature.id
                                )}
                                onChange={() =>
                                  toggleAncillaryFeature(feature.id)
                                }
                              />
                              <span className="text-sm text-gray-800">
                                {feature.label}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 text-sm font-bold text-gray-900">
                        Favoring benignity
                      </div>

                      <div className="space-y-2">
                        {availableAncillaryFeatures
                          .filter((f) => f.effect === "benignity")
                          .map((feature) => (
                            <label
                              key={feature.id}
                              className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                checked={state.untreated.ancillaryFeatureIds.includes(
                                  feature.id
                                )}
                                onChange={() =>
                                  toggleAncillaryFeature(feature.id)
                                }
                              />
                              <span className="text-sm text-gray-800">
                                {feature.label}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 text-sm font-bold text-gray-900">
                        Favoring HCC in particular
                      </div>

                      <div className="space-y-2">
                        {availableAncillaryFeatures
                          .filter((f) => f.effect === "hcc")
                          .map((feature) => (
                            <label
                              key={feature.id}
                              className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                checked={state.untreated.ancillaryFeatureIds.includes(
                                  feature.id
                                )}
                                onChange={() =>
                                  toggleAncillaryFeature(feature.id)
                                }
                              />
                              <span className="text-sm text-gray-800">
                                {feature.label}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            )}
          </div>

          {/* Right column: result & report */}
          <div
            ref={resultsRailRef}
            className={
              "results-rail space-y-6 lg:sticky lg:top-6 lg:self-start " +
              (resultsRailNeedsScroll
                ? "lg:max-h-[calc(100dvh-2.25rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
                : "lg:overflow-visible")
            }
          >
            <div
              key={
                showCalculatedResult
                  ? String(result.category)
                  : "not-categorized"
              }
              className="result-update"
              style={{ animation: "result-change 450ms ease-out" }}
            >
              <Section title="Category Result">
                <div className="grid grid-cols-1 gap-4">
                  <Stat
                    label="Category"
                    value={
                      showCalculatedResult
                        ? String(result.category)
                        : "Awaiting assessment"
                    }
                    detail={
                      showCalculatedResult
                        ? result.title
                        : "Complete the initial questions to view a result."
                    }
                    category={
                      showCalculatedResult ? String(result.category) : undefined
                    }
                  />
                </div>

                <div className="mt-3 p-4 rounded-2xl border bg-white shadow-sm">
                  <div className="font-semibold">Recommendation</div>
                  <p className="text-sm text-gray-700 mt-1">
                    {showCalculatedResult
                      ? RECOMMENDATIONS[String(result.category)] ?? "—"
                      : "A recommendation will appear once sufficient information is provided."}
                  </p>
                </div>
              </Section>
            </div>

            <Section title="Case Report">
              <div className="relative">
                {/* Anchor that doesn't create spacing */}
                <span
                  id="case-report-anchor"
                  className="absolute -top-2 left-0"
                />

                <textarea
                  rows={10}
                  className="w-full resize-y min-h-[15rem] max-h-[80vh] p-3 border rounded-2xl"
                  readOnly
                  value={buildReport(state, result)}
                />

                <div className="text-right mt-2">
                  <button
                    onClick={async () => {
                      const ok = await copyReport(state, result);
                      if (ok) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="px-4 py-2 rounded-2xl border bg-white hover:bg-gray-50"
                  >
                    {copied ? "Copied!" : "Copy report"}
                  </button>
                </div>
              </div>
            </Section>

            {/* <Section title="Quick Reference">
              <div className="flex flex-wrap gap-2">
                <Pill>Non-rim APHE</Pill>
                <Pill>Non-peripheral washout</Pill>
                <Pill>Enhancing capsule</Pill>
                <Pill>Threshold growth</Pill>
                <Pill>Size thresholds: &lt;10 / 10–19 / ≥20 mm</Pill>
              </div>
            </Section> */}

            <Section
              title="Feedback"
              subtitle="Help improve this tool by reporting bugs, suggesting changes, or sharing any other general input you have."
            >
              <div className="space-y-3">
                <a
                  href={FEEDBACK_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
                >
                  Submit feedback
                </a>
              </div>
            </Section>
          </div>
        </div>
      </div>

      <footer className="mx-auto max-w-7xl text-xs text-gray-500 pt-2 pb-10">
        <p>
          © 2018 LI-RADS Visual Calculator. Not associated with ACR or RSNA.
        </p>
      </footer>
      <Analytics />
    </div>
  );
}

// ------------- Report + Clipboard -------------

function buildReport(state: AppState, result: EngineResult) {
  const u = state.untreated;
  const r = state.report;

  const majorFeatureText = (
    status: MajorFeatureStatus,
    reason: string
  ): string => {
    if (status === "yes") return "Yes";
    if (status === "nonEvaluable") {
      const cleanedReason = reason.trim();
      return cleanedReason
        ? `Non-evaluable. (${cleanedReason})`
        : "Non-evaluable. (No reason provided)";
    }
    return "No (or unsure)";
  };

  const selectedTargetoidFeatures = getAvailableTargetoidFeatures(
    state.imaging
  ).filter((f) => u.targetoidFeatureIds.includes(f.id));

  const selectedLrMOverrideFeatures = LR_M_OVERRIDE_FEATURES.filter((f) =>
    u.lrMOverrideFeatureIds.includes(f.id)
  );

  const lrMOverrideText =
    selectedLrMOverrideFeatures.length > 0
      ? selectedLrMOverrideFeatures.map((f) => f.label).join("; ")
      : "None";

  const selectedBenignFeatures =
    u.definitelyBenign &&
    SPECIAL_OPTION_CONFIG.definitelyBenign?.type === "features"
      ? SPECIAL_OPTION_CONFIG.definitelyBenign.features.filter((f) =>
          u.benignFeatureIds.includes(f.id)
        )
      : u.probablyBenign &&
        SPECIAL_OPTION_CONFIG.probablyBenign?.type === "features"
      ? SPECIAL_OPTION_CONFIG.probablyBenign.features.filter((f) =>
          u.benignFeatureIds.includes(f.id)
        )
      : [];

  const lrMFeaturesText =
    u.malignantNotHcc && selectedTargetoidFeatures.length
      ? selectedTargetoidFeatures.map((f) => f.label).join("; ")
      : u.malignantNotHcc
      ? "None selected"
      : "None";

  const benignFeaturesText =
    (u.definitelyBenign || u.probablyBenign) && selectedBenignFeatures.length
      ? selectedBenignFeatures
          .map((f) => {
            if (f.id !== "otherBenign") return f.label;

            const otherText = u.benignOtherText.trim();
            return otherText ? `Other: ${otherText}` : "Other: __";
          })
          .join("; ")
      : u.definitelyBenign || u.probablyBenign
      ? "None selected"
      : "None";

  const selectedAncillaryFeatures = getAvailableAncillaryFeatures(
    state.imaging
  ).filter((f) => u.ancillaryFeatureIds.includes(f.id));

  const malignantAncText =
    selectedAncillaryFeatures
      .filter((f) => f.effect === "malignancy")
      .map((f) => f.label)
      .join("; ") || "None";
  const benignAncText =
    selectedAncillaryFeatures
      .filter((f) => f.effect === "benignity")
      .map((f) => f.label)
      .join("; ") || "None";

  const hccAncText =
    selectedAncillaryFeatures
      .filter((f) => f.effect === "hcc")
      .map((f) => f.label)
      .join("; ") || "None";

  const lines: string[] = [];

  // ✅ These are now filled from the UI (with sensible fallbacks if blank)
  const obs = r.observationNumber.trim() || "__";
  const seg = r.segment.trim() || "__";
  const sizeValue = u.sizeValue.trim() || "__";
  const sizeUnit = u.sizeUnit || "mm";
  const imgNo = r.imageNumber.trim() || "__";
  const seriesNo = r.seriesNumber.trim() || "__";
  const tivVessels = r.tivVessels.trim() || "__";

  lines.push(`Observation #: ${obs}`);
  lines.push(`Segment: ${seg}`);

  if (u.tiv) {
    lines.push(
      `Parenchymal component size, if visible: ${sizeValue} ${sizeUnit}, (image # ${imgNo}, series ${seriesNo})`
    );
    lines.push(`Tumor in Vein: Yes`);
    lines.push(`Vessels involved: ${tivVessels}`);
  } else if (u.examCompromised) {
    lines.push(
      `Size, if measurable: ${sizeValue} ${sizeUnit}, (image # ${imgNo}, series ${seriesNo})`
    );
    lines.push(`Tumor in Vein: No`);
  } else if (u.definitelyBenign || u.probablyBenign) {
    lines.push(
      `Size: ${sizeValue} ${sizeUnit}, (image # ${imgNo}, series ${seriesNo})`
    );
    lines.push(`Benign entities: ${benignFeaturesText}`);
    lines.push(`Tumor in Vein: No`);
  } else if (u.malignantNotHcc) {
    lines.push(
      `Size: ${sizeValue} ${sizeUnit}, (image # ${imgNo}, series ${seriesNo})`
    );
    lines.push(`Tumor in Vein: No`);
  } else {
    lines.push(
      `Size: ${sizeValue} ${sizeUnit}, (image # ${imgNo}, series ${seriesNo})`
    );
    lines.push(`Tumor in Vein: No`);
  }

  lines.push(`LR-M Features: ${lrMFeaturesText}`);
  lines.push(`LR-M override features: ${lrMOverrideText}`);
  lines.push(
    `Nonrim AP hyperenhancement: ${majorFeatureText(
      u.apheStatus,
      u.apheNonEvaluableReason
    )}`
  );
  lines.push(
    `Threshold growth: ${majorFeatureText(
      u.thresholdGrowthStatus,
      u.thresholdGrowthNonEvaluableReason
    )}`
  );
  lines.push(
    `Nonperipheral washout appearance: ${majorFeatureText(
      u.washoutStatus,
      u.washoutNonEvaluableReason
    )}`
  );
  lines.push(
    `Enhancing capsule appearance: ${majorFeatureText(
      u.capsuleStatus,
      u.capsuleNonEvaluableReason
    )}`
  );
  if (String(result.category) !== "LR-M") {
    lines.push("Ancillary features:");
    lines.push(`    Favoring malignancy: ${malignantAncText}`);
    lines.push(`    Favoring benignity: ${benignAncText}`);
    lines.push(`    Favoring HCC in particular: ${hccAncText}`);
  }
  lines.push(`LI-RADS v2018 Category: ${String(result.category)} `);

  return lines.join("\n");
}

async function copyReport(
  state: AppState,
  result: EngineResult
): Promise<boolean> {
  const text = buildReport(state, result);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      window.prompt("Copy the report below:", text);
      return false;
    }
  } catch {
    window.prompt("Copy the report below:", text);
    return false;
  }
}
