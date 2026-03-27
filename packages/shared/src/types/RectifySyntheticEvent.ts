/**
 * Type-level representation of a Rectify synthetic event.
 * The runtime class lives in @rectify-dev/dom-binding; this interface
 * is defined here so @rectify-dev/shared has no upward dependencies.
 */
export interface SyntheticEvent<N extends Event = Event> {
  /** The DOM element that triggered the event. */
  target: Element | null;
  /** The element the handler is attached to (set during dispatch). */
  currentTarget: Element | null;
  /** The underlying native DOM event. */
  nativeEvent: N;
  stopPropagation(): void;
  isPropagationStopped(): boolean;
}

export interface SyntheticMouseEvent extends SyntheticEvent<MouseEvent> {
  readonly button: number;
  readonly buttons: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly pageX: number;
  readonly pageY: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly movementX: number;
  readonly movementY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly relatedTarget: EventTarget | null;
}

export interface SyntheticKeyboardEvent extends SyntheticEvent<KeyboardEvent> {
  readonly key: string;
  readonly code: string;
  readonly keyCode: number;
  readonly charCode: number;
  readonly which: number;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly repeat: boolean;
  readonly locale: string;
  readonly location: number;
  readonly isComposing: boolean;
}

export interface SyntheticFocusEvent extends SyntheticEvent<FocusEvent> {
  readonly relatedTarget: EventTarget | null;
}

export interface SyntheticInputEvent extends SyntheticEvent<InputEvent> {
  readonly data: string | null;
  readonly inputType: string;
  readonly isComposing: boolean;
}

export interface SyntheticChangeEvent extends SyntheticEvent<Event> {
  readonly value: string;
  readonly checked: boolean;
}

export interface SyntheticSubmitEvent extends SyntheticEvent<SubmitEvent> {
  readonly submitter: HTMLElement | null;
}

export interface SyntheticWheelEvent extends SyntheticEvent<WheelEvent> {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly deltaZ: number;
  readonly deltaMode: number;
}

export interface SyntheticPointerEvent extends SyntheticEvent<PointerEvent> {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly clientX: number;
  readonly clientY: number;
  readonly width: number;
  readonly height: number;
  readonly pressure: number;
  readonly isPrimary: boolean;
}

export interface SyntheticTouchEvent extends SyntheticEvent<TouchEvent> {
  readonly touches: TouchList;
  readonly targetTouches: TouchList;
  readonly changedTouches: TouchList;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
}

export interface SyntheticDragEvent extends SyntheticEvent<DragEvent> {
  readonly dataTransfer: DataTransfer | null;
  readonly clientX: number;
  readonly clientY: number;
}

export interface SyntheticClipboardEvent extends SyntheticEvent<ClipboardEvent> {
  readonly clipboardData: DataTransfer | null;
}

export interface SyntheticAnimationEvent extends SyntheticEvent<AnimationEvent> {
  readonly animationName: string;
  readonly elapsedTime: number;
  readonly pseudoElement: string;
}

export interface SyntheticTransitionEvent extends SyntheticEvent<TransitionEvent> {
  readonly propertyName: string;
  readonly elapsedTime: number;
  readonly pseudoElement: string;
}
