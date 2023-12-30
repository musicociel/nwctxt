export interface LowLevelNWCTXTField {
  /**
   * Name of the field
   */
  name: string;

  /**
   * Value of the field
   */
  value: string;

  /**
   * Wether the value is quoted
   */
  quoted: boolean;
}

export interface LowLevelNWCTXTInstruction {
  /**
   * Name of the instruction
   * @example "AddStaff"
   */
  name: string;

  /**
   * Array of fields
   */
  fields: LowLevelNWCTXTField[];
}

export interface LowLevelNWCTXTFile {
  /**
   * Note Worthy Composer version as a string
   * @example "2.751"
   */
  version: string;

  /**
   * true if the parsed content is in the clipboard format (!NoteWorthyComposerClip),
   * false otherwise (!NoteWorthyComposer)
   */
  clip: boolean;

  /**
   * Extra information after Note Worthy Composer version
   *
   * @example "Single"
   */
  extra?: string | null;

  /**
   * Array of instruction objects
   */
  instructions: LowLevelNWCTXTInstruction[];
}
