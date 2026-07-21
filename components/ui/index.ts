/**
 * Palak Aluminium — Admin UI kit barrel.
 * Import everything from "components/ui":
 *   import { Button, Card, useToast } from "../../components/ui";
 */
export { cn } from "./cn";
export type { ClassValue } from "./cn";

export { Spinner, Loader } from "./Spinner";
export type { SpinnerProps } from "./Spinner";

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStat,
  SkeletonTable,
} from "./Skeleton";

export { Button, buttonClass } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";

export { Badge, INQUIRY_STATUS_TONE, INQUIRY_STATUS_LABEL } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";

export { Card, GlowPanel, StatCard } from "./Card";
export type { StatCardProps } from "./Card";

export {
  FieldLabel,
  Input,
  Textarea,
  Select,
  Switch,
  SearchInput,
} from "./Field";
export type { InputProps, TextareaProps, SelectProps } from "./Field";

export { SearchableSelect } from "./SearchableSelect";
export type { SearchableSelectProps } from "./SearchableSelect";

export { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
export type { ModalProps } from "./Modal";

export { ToastProvider, useToast } from "./Toast";
export type { ToastKind } from "./Toast";

export { ConfirmProvider, useConfirm } from "./Confirm";
export type { ConfirmOptions } from "./Confirm";

export { DataTable } from "./DataTable";
export type { Column, DataTableProps } from "./DataTable";

export { PageHeader, EmptyState } from "./PageHeader";
