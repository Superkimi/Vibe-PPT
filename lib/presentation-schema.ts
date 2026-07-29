import { z } from "zod";

const id = z.string().min(1).max(96);
const color = z.string().min(1).max(96);
const finite = z.number().finite();

const frameSchema = z.object({
  x: finite,
  y: finite,
  w: finite.positive(),
  h: finite.positive(),
  rotation: finite.default(0),
  opacity: finite.min(0).max(1).default(1),
});

const animationSchema = z
  .object({
    enter: z.enum(["none", "fade", "fade-up", "slide-left", "slide-right"]).default("none"),
    delay: finite.min(0).max(10).default(0),
    duration: finite.min(0.1).max(10).default(0.6),
  })
  .optional();

const baseElementSchema = frameSchema.extend({
  id,
  name: z.string().max(120).optional(),
  locked: z.boolean().default(false),
  animation: animationSchema,
});

export const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  text: z.string().max(12000),
  fontFamily: z.string().max(200).default("var(--font-sans)"),
  fontSize: finite.min(8).max(360),
  fontWeight: z.number().int().min(100).max(900).default(500),
  lineHeight: finite.min(0.7).max(3).default(1.15),
  letterSpacing: finite.min(-10).max(40).default(0),
  color,
  align: z.enum(["left", "center", "right"]).default("left"),
  valign: z.enum(["top", "middle", "bottom"]).default("top"),
});

export const shapeElementSchema = baseElementSchema.extend({
  type: z.literal("shape"),
  shape: z.enum(["rectangle", "ellipse", "line"]),
  fill: color,
  stroke: color.default("transparent"),
  strokeWidth: finite.min(0).max(40).default(0),
  radius: finite.min(0).max(200).default(0),
});

export const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  src: z.string().min(1).max(2_000_000),
  alt: z.string().max(500).default(""),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
  radius: finite.min(0).max(200).default(0),
});

export const chartElementSchema = baseElementSchema.extend({
  type: z.literal("chart"),
  chart: z.enum(["bar", "line", "pie"]),
  labels: z.array(z.string().max(120)).min(1).max(24),
  series: z
    .array(
      z.object({
        name: z.string().max(120),
        values: z.array(finite).min(1).max(24),
        color: color,
      }),
    )
    .min(1)
    .max(8),
  showLegend: z.boolean().default(true),
  showValues: z.boolean().default(false),
});

export const slideElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  shapeElementSchema,
  imageElementSchema,
  chartElementSchema,
]);

export const slideSchema = z.object({
  id,
  title: z.string().min(1).max(180),
  background: color,
  transition: z.enum(["none", "fade", "slide", "zoom"]).default("fade"),
  notes: z.string().max(12000).default(""),
  elements: z.array(slideElementSchema).max(200),
});

export const presentationSchema = z.object({
  format: z.literal("vibe-ppt/1"),
  version: z.literal(1),
  id,
  title: z.string().min(1).max(180),
  size: z.object({
    width: finite.min(320).max(4096),
    height: finite.min(180).max(4096),
  }),
  theme: z.object({
    background: color,
    surface: color,
    text: color,
    muted: color,
    accent: color,
    fontFamily: z.string().max(200),
    headingFamily: z.string().max(200),
  }),
  slides: z.array(slideSchema).min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PresentationDocument = z.infer<typeof presentationSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type SlideElement = z.infer<typeof slideElementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ShapeElement = z.infer<typeof shapeElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type ChartElement = z.infer<typeof chartElementSchema>;

export const aiOperationSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("replace_document"), document: presentationSchema }),
  z.object({ op: z.literal("replace_slide"), slideId: id, slide: slideSchema }),
  z.object({ op: z.literal("insert_slide"), afterSlideId: id.nullable(), slide: slideSchema }),
  z.object({ op: z.literal("delete_slide"), slideId: id }),
  z.object({ op: z.literal("reorder_slides"), slideIds: z.array(id).min(1).max(100) }),
  z.object({
    op: z.literal("patch_slide"),
    slideId: id,
    patch: z
      .object({
        title: z.string().min(1).max(180).optional(),
        background: color.optional(),
        transition: z.enum(["none", "fade", "slide", "zoom"]).optional(),
        notes: z.string().max(12000).optional(),
      })
      .strict(),
  }),
  z.object({ op: z.literal("insert_element"), slideId: id, element: slideElementSchema }),
  z.object({ op: z.literal("delete_element"), slideId: id, elementId: id }),
  z.object({
    op: z.literal("patch_element"),
    slideId: id,
    elementId: id,
    patch: z.record(z.unknown()),
  }),
  z.object({
    op: z.literal("set_theme"),
    patch: presentationSchema.shape.theme.partial(),
  }),
]);

export const aiResponseSchema = z.object({
  assistantMessage: z.string().min(1).max(4000),
  summary: z.string().min(1).max(240),
  operations: z.array(aiOperationSchema).min(1).max(80),
});

export type AiOperation = z.infer<typeof aiOperationSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;
