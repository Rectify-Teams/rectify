import type { RectifyNode, RectifyKey } from "./RectifyTypes";
import type {
  SyntheticMouseEvent,
  SyntheticKeyboardEvent,
  SyntheticFocusEvent,
  SyntheticInputEvent,
  SyntheticChangeEvent,
  SyntheticSubmitEvent,
  SyntheticWheelEvent,
  SyntheticPointerEvent,
  SyntheticTouchEvent,
  SyntheticDragEvent,
  SyntheticClipboardEvent,
  SyntheticAnimationEvent,
  SyntheticTransitionEvent,
  SyntheticEvent,
} from "./RectifySyntheticEvent";
// ─── Suspense ────────────────────────────────────────────────────────────────────────────────

export type SuspenseProps = {
  /** Rendered while any child (or lazy component) is loading. */
  fallback: RectifyNode;
  children?: RectifyNode;
};
// ─── CSS ─────────────────────────────────────────────────────────────────────

export type CSSProperties = Partial<
  Record<
    Exclude<
      keyof CSSStyleDeclaration,
      | number
      | typeof Symbol.iterator
      | "length"
      | "parentRule"
      | "getPropertyPriority"
      | "getPropertyValue"
      | "item"
      | "removeProperty"
      | "setProperty"
    >,
    string | number | null
  >
>;

// ─── Event handlers ───────────────────────────────────────────────────────────

export interface RectifyEventHandlers {
  onClick?: (e: SyntheticMouseEvent) => void;
  onDblClick?: (e: SyntheticMouseEvent) => void;
  onMouseDown?: (e: SyntheticMouseEvent) => void;
  onMouseUp?: (e: SyntheticMouseEvent) => void;
  onMouseEnter?: (e: SyntheticMouseEvent) => void;
  onMouseLeave?: (e: SyntheticMouseEvent) => void;
  onMouseOver?: (e: SyntheticMouseEvent) => void;
  onMouseOut?: (e: SyntheticMouseEvent) => void;
  onMouseMove?: (e: SyntheticMouseEvent) => void;
  onContextMenu?: (e: SyntheticMouseEvent) => void;
  onKeyDown?: (e: SyntheticKeyboardEvent) => void;
  onKeyUp?: (e: SyntheticKeyboardEvent) => void;
  onKeyPress?: (e: SyntheticKeyboardEvent) => void;
  onFocus?: (e: SyntheticFocusEvent) => void;
  onBlur?: (e: SyntheticFocusEvent) => void;
  onChange?: (e: SyntheticChangeEvent) => void;
  onInput?: (e: SyntheticInputEvent) => void;
  onSubmit?: (e: SyntheticSubmitEvent) => void;
  onReset?: (e: SyntheticEvent) => void;
  onScroll?: (e: SyntheticEvent) => void;
  onWheel?: (e: SyntheticWheelEvent) => void;
  onTouchStart?: (e: SyntheticTouchEvent) => void;
  onTouchEnd?: (e: SyntheticTouchEvent) => void;
  onTouchMove?: (e: SyntheticTouchEvent) => void;
  onTouchCancel?: (e: SyntheticTouchEvent) => void;
  onPointerDown?: (e: SyntheticPointerEvent) => void;
  onPointerUp?: (e: SyntheticPointerEvent) => void;
  onPointerEnter?: (e: SyntheticPointerEvent) => void;
  onPointerLeave?: (e: SyntheticPointerEvent) => void;
  onPointerMove?: (e: SyntheticPointerEvent) => void;
  onPointerCancel?: (e: SyntheticPointerEvent) => void;
  onDragStart?: (e: SyntheticDragEvent) => void;
  onDragEnd?: (e: SyntheticDragEvent) => void;
  onDragOver?: (e: SyntheticDragEvent) => void;
  onDrop?: (e: SyntheticDragEvent) => void;
  onAnimationStart?: (e: SyntheticAnimationEvent) => void;
  onAnimationEnd?: (e: SyntheticAnimationEvent) => void;
  onTransitionEnd?: (e: SyntheticTransitionEvent) => void;
  onLoad?: (e: SyntheticEvent) => void;
  onError?: (e: SyntheticEvent) => void;
  onCopy?: (e: SyntheticClipboardEvent) => void;
  onCut?: (e: SyntheticClipboardEvent) => void;
  onPaste?: (e: SyntheticClipboardEvent) => void;
}

// ─── ARIA ─────────────────────────────────────────────────────────────────────

export interface AriaAttributes {
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-expanded"?: boolean | "true" | "false";
  "aria-selected"?: boolean | "true" | "false";
  "aria-checked"?: boolean | "true" | "false" | "mixed";
  "aria-disabled"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  "aria-live"?: "off" | "assertive" | "polite";
  "aria-atomic"?: boolean | "true" | "false";
  "aria-busy"?: boolean | "true" | "false";
  "aria-controls"?: string;
  "aria-owns"?: string;
  "aria-current"?: boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time";
  "aria-haspopup"?: boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
  "aria-placeholder"?: string;
  "aria-multiline"?: boolean | "true" | "false";
  "aria-multiselectable"?: boolean | "true" | "false";
  "aria-orientation"?: "horizontal" | "vertical";
  "aria-readonly"?: boolean | "true" | "false";
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  "aria-colcount"?: number;
  "aria-colindex"?: number;
  "aria-colspan"?: number;
  "aria-rowcount"?: number;
  "aria-rowindex"?: number;
  "aria-rowspan"?: number;
  "aria-setsize"?: number;
  "aria-posinset"?: number;
  "aria-level"?: number;
  "aria-activedescendant"?: string;
  "aria-flowto"?: string;
}

// ─── Base HTML attributes ─────────────────────────────────────────────────────

export interface HTMLAttributes extends RectifyEventHandlers, AriaAttributes {
  id?: string;
  className?: string;
  name?: string;
  slot?: string;
  style?: string | CSSProperties;
  title?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  hidden?: boolean | "hidden" | "until-found";
  tabIndex?: number;
  tabindex?: number;
  draggable?: boolean | "true" | "false";
  contentEditable?: boolean | "true" | "false" | "inherit" | "plaintext-only";
  spellCheck?: boolean | "true" | "false";
  translate?: "yes" | "no";
  autofocus?: boolean;
  autoFocus?: boolean;
  innerHTML?: string;
  children?: RectifyNode | RectifyNode[];
  key?: RectifyKey;
  ref?: { current: any } | ((node: any) => void);
  [key: `data-${string}`]: string | number | boolean | undefined;
}

// ─── Element-specific attributes ─────────────────────────────────────────────

// ─── SVG attributes ───────────────────────────────────────────────────────────

export interface SVGAttributes extends HTMLAttributes {
  // Geometry
  viewBox?: string;
  preserveAspectRatio?: string;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  cx?: number | string;
  cy?: number | string;
  r?: number | string;
  rx?: number | string;
  ry?: number | string;
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  d?: string;
  points?: string;
  dx?: number | string;
  dy?: number | string;
  rotate?: number | string;
  // Presentation
  fill?: string;
  fillOpacity?: number | string;
  fillRule?: "nonzero" | "evenodd" | "inherit";
  stroke?: string;
  strokeWidth?: number | string;
  strokeOpacity?: number | string;
  strokeLinecap?: "butt" | "round" | "square" | "inherit";
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
  strokeDasharray?: string;
  strokeDashoffset?: number | string;
  opacity?: number | string;
  visibility?: string;
  transform?: string;
  clipPath?: string;
  clipRule?: "nonzero" | "evenodd" | "inherit";
  mask?: string;
  filter?: string;
  // Text
  textAnchor?: string;
  dominantBaseline?: string;
  fontFamily?: string;
  fontSize?: number | string;
  fontStyle?: string;
  fontWeight?: number | string;
  letterSpacing?: number | string;
  // Gradient / Pattern
  gradientUnits?: string;
  gradientTransform?: string;
  patternUnits?: string;
  patternTransform?: string;
  spreadMethod?: "pad" | "reflect" | "repeat";
  offset?: number | string;
  stopColor?: string;
  stopOpacity?: number | string;
  // Marker
  markerWidth?: number | string;
  markerHeight?: number | string;
  markerUnits?: string;
  refX?: number | string;
  refY?: number | string;
  orient?: string;
  // Filter primitives
  in?: string;
  in2?: string;
  result?: string;
  mode?: string;
  baseFrequency?: number | string;
  numOctaves?: number;
  seed?: number;
  stitchTiles?: string;
  stdDeviation?: number | string;
  // Namespace
  xmlns?: string;
  xmlnsXlink?: string;
  href?: string;
  xlinkHref?: string;
}

export interface AnchorHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
  rel?: string;
  download?: string | boolean;
  hrefLang?: string;
  ping?: string;
  referrerPolicy?: ReferrerPolicy;
}

export interface ButtonHTMLAttributes extends HTMLAttributes {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formMethod?: string;
  formEncType?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  value?: string | number;
}

export interface InputHTMLAttributes extends HTMLAttributes {
  type?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number;
  checked?: boolean;
  defaultChecked?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiple?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  accept?: string;
  capture?: "user" | "environment" | boolean;
  autoComplete?: string;
  list?: string;
  size?: number;
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  form?: string;
  indeterminate?: boolean;
}

export interface TextareaHTMLAttributes extends HTMLAttributes {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  form?: string;
  wrap?: "hard" | "soft" | "off";
  autoComplete?: string;
}

export interface SelectHTMLAttributes extends HTMLAttributes {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: number;
  form?: string;
  autoComplete?: string;
}

export interface OptionHTMLAttributes extends HTMLAttributes {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface OptGroupHTMLAttributes extends HTMLAttributes {
  label?: string;
  disabled?: boolean;
}

export interface FormHTMLAttributes extends HTMLAttributes {
  action?: string;
  method?: "get" | "post" | "dialog";
  encType?: string;
  noValidate?: boolean;
  target?: string;
  autoComplete?: "on" | "off";
  rel?: string;
}

export interface ImgHTMLAttributes extends HTMLAttributes {
  src?: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
  crossOrigin?: "anonymous" | "use-credentials";
  referrerPolicy?: ReferrerPolicy;
  useMap?: string;
  isMap?: boolean;
}

export interface LabelHTMLAttributes extends HTMLAttributes {
  for?: string;
  htmlFor?: string;
  form?: string;
}

export interface LinkHTMLAttributes extends HTMLAttributes {
  href?: string;
  rel?: string;
  type?: string;
  media?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  as?: string;
  disabled?: boolean;
  integrity?: string;
}

export interface MetaHTMLAttributes extends HTMLAttributes {
  name?: string;
  content?: string;
  httpEquiv?: string;
  charset?: string;
  media?: string;
  property?: string;
}

export interface ScriptHTMLAttributes extends HTMLAttributes {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
  integrity?: string;
  noModule?: boolean;
  nonce?: string;
}

export interface SourceHTMLAttributes extends HTMLAttributes {
  src?: string;
  srcSet?: string;
  type?: string;
  media?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
}

export interface VideoHTMLAttributes extends HTMLAttributes {
  src?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface AudioHTMLAttributes extends HTMLAttributes {
  src?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  crossOrigin?: "anonymous" | "use-credentials";
}

export interface TdHTMLAttributes extends HTMLAttributes {
  colSpan?: number;
  rowSpan?: number;
  headers?: string;
  abbr?: string;
}

export interface ThHTMLAttributes extends TdHTMLAttributes {
  scope?: "col" | "colgroup" | "row" | "rowgroup";
}

export interface ColHTMLAttributes extends HTMLAttributes {
  span?: number;
  width?: number | string;
}

export interface OlHTMLAttributes extends HTMLAttributes {
  reversed?: boolean;
  start?: number;
  type?: "1" | "a" | "A" | "i" | "I";
}

export interface DetailsHTMLAttributes extends HTMLAttributes {
  open?: boolean;
  name?: string;
}

export interface DialogHTMLAttributes extends HTMLAttributes {
  open?: boolean;
}

export interface FieldsetHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
}

export interface IframeHTMLAttributes extends HTMLAttributes {
  src?: string;
  srcdoc?: string;
  name?: string;
  width?: number | string;
  height?: number | string;
  allow?: string;
  allowFullScreen?: boolean;
  sandbox?: string;
  loading?: "lazy" | "eager";
  referrerPolicy?: ReferrerPolicy;
}

export interface ProgressHTMLAttributes extends HTMLAttributes {
  value?: number | string;
  max?: number | string;
}

export interface MeterHTMLAttributes extends HTMLAttributes {
  value?: number | string;
  min?: number | string;
  max?: number | string;
  low?: number | string;
  high?: number | string;
  optimum?: number | string;
}

export interface CanvasHTMLAttributes extends HTMLAttributes {
  width?: number | string;
  height?: number | string;
}

// ─── IntrinsicElements map ────────────────────────────────────────────────────

export interface RectifyIntrinsicElements {
  // Headings
  h1: HTMLAttributes;
  h2: HTMLAttributes;
  h3: HTMLAttributes;
  h4: HTMLAttributes;
  h5: HTMLAttributes;
  h6: HTMLAttributes;

  // Sections
  header: HTMLAttributes;
  footer: HTMLAttributes;
  main: HTMLAttributes;
  section: HTMLAttributes;
  article: HTMLAttributes;
  aside: HTMLAttributes;
  address: HTMLAttributes;
  hgroup: HTMLAttributes;
  nav: HTMLAttributes;

  // Document
  html: HTMLAttributes & { lang?: string };
  head: HTMLAttributes;
  body: HTMLAttributes;
  title: HTMLAttributes;
  meta: MetaHTMLAttributes;
  link: LinkHTMLAttributes;
  style: HTMLAttributes & { media?: string; nonce?: string };
  script: ScriptHTMLAttributes;
  noscript: HTMLAttributes;
  template: HTMLAttributes;
  slot: HTMLAttributes & { name?: string };
  base: HTMLAttributes & { href?: string; target?: string };

  // Block
  div: HTMLAttributes;
  p: HTMLAttributes;
  pre: HTMLAttributes;
  blockquote: HTMLAttributes & { cite?: string };
  figure: HTMLAttributes;
  figcaption: HTMLAttributes;
  hr: HTMLAttributes;
  br: HTMLAttributes;

  // Lists
  ul: HTMLAttributes;
  ol: OlHTMLAttributes;
  li: HTMLAttributes & { value?: number };
  dl: HTMLAttributes;
  dt: HTMLAttributes;
  dd: HTMLAttributes;
  menu: HTMLAttributes;

  // Inline
  span: HTMLAttributes;
  a: AnchorHTMLAttributes;
  em: HTMLAttributes;
  strong: HTMLAttributes;
  small: HTMLAttributes;
  s: HTMLAttributes;
  cite: HTMLAttributes;
  q: HTMLAttributes & { cite?: string };
  dfn: HTMLAttributes;
  abbr: HTMLAttributes;
  code: HTMLAttributes;
  var: HTMLAttributes;
  samp: HTMLAttributes;
  kbd: HTMLAttributes;
  sub: HTMLAttributes;
  sup: HTMLAttributes;
  mark: HTMLAttributes;
  del: HTMLAttributes & { cite?: string; dateTime?: string };
  ins: HTMLAttributes & { cite?: string; dateTime?: string };
  i: HTMLAttributes;
  b: HTMLAttributes;
  u: HTMLAttributes;
  bdi: HTMLAttributes;
  bdo: HTMLAttributes & { dir?: "ltr" | "rtl" };
  ruby: HTMLAttributes;
  rt: HTMLAttributes;
  rp: HTMLAttributes;
  wbr: HTMLAttributes;
  time: HTMLAttributes & { dateTime?: string };
  data: HTMLAttributes & { value?: string };

  // Forms
  form: FormHTMLAttributes;
  fieldset: FieldsetHTMLAttributes;
  legend: HTMLAttributes;
  label: LabelHTMLAttributes;
  input: InputHTMLAttributes;
  button: ButtonHTMLAttributes;
  select: SelectHTMLAttributes;
  datalist: HTMLAttributes;
  optgroup: OptGroupHTMLAttributes;
  option: OptionHTMLAttributes;
  textarea: TextareaHTMLAttributes;
  output: HTMLAttributes & { for?: string; form?: string };
  progress: ProgressHTMLAttributes;
  meter: MeterHTMLAttributes;

  // Media
  img: ImgHTMLAttributes;
  video: VideoHTMLAttributes;
  audio: AudioHTMLAttributes;
  source: SourceHTMLAttributes;
  track: HTMLAttributes & { kind?: string; src?: string; srclang?: string; label?: string; default?: boolean };
  picture: HTMLAttributes;
  canvas: CanvasHTMLAttributes;
  map: HTMLAttributes & { name?: string };
  area: HTMLAttributes & { href?: string; alt?: string; shape?: string; coords?: string; target?: string };

  // Embedded
  iframe: IframeHTMLAttributes;
  embed: HTMLAttributes & { src?: string; type?: string; width?: number | string; height?: number | string };
  object: HTMLAttributes & { data?: string; type?: string; width?: number | string; height?: number | string };

  // Table
  table: HTMLAttributes & { summary?: string; cellPadding?: number | string; cellSpacing?: number | string };
  caption: HTMLAttributes;
  colgroup: HTMLAttributes;
  col: ColHTMLAttributes;
  thead: HTMLAttributes;
  tbody: HTMLAttributes;
  tfoot: HTMLAttributes;
  tr: HTMLAttributes;
  td: TdHTMLAttributes;
  th: ThHTMLAttributes;

  // Interactive
  details: DetailsHTMLAttributes;
  summary: HTMLAttributes;
  dialog: DialogHTMLAttributes;

  // SVG
  svg: SVGAttributes;
  circle: SVGAttributes;
  ellipse: SVGAttributes;
  line: SVGAttributes;
  path: SVGAttributes;
  polygon: SVGAttributes;
  polyline: SVGAttributes;
  rect: SVGAttributes;
  g: SVGAttributes;
  defs: SVGAttributes;
  use: SVGAttributes;
  symbol: SVGAttributes;
  clipPath: SVGAttributes;
  mask: SVGAttributes;
  pattern: SVGAttributes;
  linearGradient: SVGAttributes;
  radialGradient: SVGAttributes;
  stop: SVGAttributes;
  marker: SVGAttributes;
  image: SVGAttributes & { preserveAspectRatio?: string };
  text: SVGAttributes;
  tspan: SVGAttributes;
  textPath: SVGAttributes & { startOffset?: number | string; method?: string; spacing?: string };
  foreignObject: SVGAttributes;
  animate: SVGAttributes;
  animateMotion: SVGAttributes;
  animateTransform: SVGAttributes;
  feBlend: SVGAttributes;
  feColorMatrix: SVGAttributes & { type?: string; values?: string };
  feComposite: SVGAttributes & { operator?: string; k1?: number; k2?: number; k3?: number; k4?: number };
  feGaussianBlur: SVGAttributes;
  feOffset: SVGAttributes;
  feMerge: SVGAttributes;
  feMergeNode: SVGAttributes;
  feTurbulence: SVGAttributes;
  feFlood: SVGAttributes & { floodColor?: string; floodOpacity?: number | string };

  // Catch-all
  [elemName: string]: HTMLAttributes;
}
