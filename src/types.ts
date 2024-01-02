import type { LowLevelNWCTXTFile } from "./lowlevel";

type AnyFields = { [name: string]: any };

export type NWCTXTNoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B" | "C";
export type NWCTXTAccidental = "#" | "b" | "n" | "v" | "x" | "";
export type NWCTXTNoteNameWithAccidental = `${NWCTXTNoteName}${NWCTXTAccidental}`;

export interface NWCTXTPosition {
  accidental: NWCTXTAccidental;
  position: number;
  head: string;
  tie: boolean;
}

export interface NWCTXTDuration {
  Base: "Whole" | "Half" | "4th" | "8th" | "16th" | "32nd" | "64th";

  Dotted?: boolean;
  DblDotted?: boolean;
  Slur?: boolean;
  Accent?: boolean;
  Triplet?: boolean | "First" | "End";
  Staccato?: boolean;
  Grace?: boolean;
  Tenuto?: boolean;
}

export interface NWCTXTLyrics {
  Text: string;
}

export interface NWCTXTBaseMusicItem {
  name: string;
  fields: AnyFields;
}

export interface NWCTXTOpts {
  Stem?: "Up" | "Down";
  Beam?: "First" | "End" | boolean;
  BeamGrp?: boolean;
  ArticulationsOnStem?: boolean;
}

export interface NWCTXTNote {
  name: "Note";
  fields: {
    Dur: NWCTXTDuration;
    Pos: NWCTXTPosition;
    Opts?: NWCTXTOpts;
  };
}

export interface NWCTXTRest {
  name: "Rest";
  fields: {
    Dur: NWCTXTDuration;
    Opts?: NWCTXTOpts;
  };
}

export interface NWCTXTBar {
  name: "Bar";
  fields: {
    /**
     * @example "LocalRepeatClose"
     * @example "Double"
     * @example "LocalRepeatOpen"
     * @example "MasterRepeatClose"
     * @example "MasterRepeatOpen"
     * @example "SectionClose"
     * @example "SectionOpen"
     */
    Style?: string;
    /**
     * @example 3
     */
    Repeat?: number;
  };
}

export interface NWCTXTChord {
  name: "Chord";
  fields: {
    Dur: NWCTXTDuration;
    Pos: NWCTXTPosition[];
    Opts?: NWCTXTOpts;
    Dur2?: NWCTXTDuration;
    Pos2?: NWCTXTPosition[];
  };
}

export interface NWCTXTKey {
  name: "Key";
  fields: {
    Signature: NWCTXTNoteNameWithAccidental[];
    Tonic: NWCTXTNoteName;
  };
}

export interface NWCTXTClef {
  name: "Clef";
  fields: {
    Type: "Treble" | "Bass" | "Alto" | "Tenor" | "Percussion";
    OctaveShift?: "Octave Down" | "Octave Up";
  };
}

export interface NWCTXTTimeSig {
  name: "TimeSig";
  fields: {
    Signature: "Common" | "AllaBreve" | [number, number];
  };
}

export interface NWCTXTTempo {
  name: "Tempo";
  fields: {
    Base?: "Eighth" | "Eighth Dotted" | "Quarter" | "Quarter Dotted" | "Half" | "Half Dotted";
    /**
     * @example 90
     */
    Tempo: number;
    /**
     * @example "Allegro"
     * @example "Andantino"
     * @example "Andante"
     * @example "Moderato"
     * @example "Allegretto"
     * @example "Adagio"
     * @example "Largo"
     */
    Text?: string;
    /**
     * @example 6
     * @example 8
     * @example 10
     * @example 14
     */
    Pos?: number;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
    /**
     * @example true
     */
    Wide?: boolean;
  };
}

export interface NWCTXTSustainPedal {
  name: "SustainPedal";
  fields: {
    /**
     * @example -16
     * @example 6
     */
    Pos?: number;
    /**
     * @example true
     */
    Wide?: boolean;
    /**
     * @example "Released"
     */
    Status?: string;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
  };
}

export interface NWCTXTUser {
  name: "User";
  fields: AnyFields;
}

export interface NWCTXTMPC {
  name: "MPC";
  fields: {
    /**
     * @example "vol"
     * @example "tempo"
     * @example "pitch"
     */
    Controller?: string;
    /**
     * @example "Absolute"
     * @example "Linear Sweep"
     */
    Style?: string;
    /**
     * @example "Quarter"
     * @example "Whole"
     */
    TimeRes?: string;
    /**
     * @example 1
     * @example 32
     */
    SweepRes?: number;
    /**
     * @example [0,80]
     * @example [0,127]
     * @example [0,162]
     * @example [0,100]
     * @example [0,0]
     * @example [0,8192]
     */
    Pt1?: number[];
    /**
     * @example 8
     */
    Pos?: number;
    /**
     * @example true
     */
    Wide?: boolean;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
    /**
     * @example [16,240]
     * @example [4,16383]
     */
    Pt2?: number[];
  };
}

export interface NWCTXTText {
  name: "Text";
  fields: {
    /**
     * @example "Andante"
     */
    Text?: string;
    /**
     * @example "StaffItalic"
     * @example "StaffBold"
     * @example "PageText"
     */
    Font?: string;
    /**
     * @example -7
     */
    Pos?: number;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
    /**
     * @example true
     */
    Wide?: boolean;
  };
}

export interface NWCTXTEnding {
  name: "Ending";
  fields: {
    Endings?: string[];
  };
}

export interface NWCTXTFlow {
  name: "Flow";
  fields: {
    /**
     * @example "Fine"
     * @example "DCalFine"
     * @example "Segno"
     * @example "ToCoda"
     * @example "DCalCoda"
     * @example "Coda"
     * @example "DSalCoda"
     * @example "DSalFine"
     * @example "DaCapo"
     * @example "DalSegno"
     */
    Style?: string;
    /**
     * @example -8
     * @example 7
     * @example 8
     * @example 10
     */
    Pos?: number;
    /**
     * @example true
     */
    Wide?: boolean;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
  };
}

export interface NWCTXTTempoVariance {
  name: "TempoVariance";
  fields: {
    /**
     * @example "Fermata"
     * @example "Breath Mark"
     */
    Style?: string;
    /**
     * @example 0
     * @example 2
     * @example 15
     * @example 16
     */
    Pause?: number;
    /**
     * @example 10
     */
    Pos?: number;
    /**
     * @example "Center"
     */
    Justify?: string;
    /**
     * @example "AtNextNote"
     * @example "AsStaffSignature"
     */
    Placement?: string;
    /**
     * @example true
     */
    Wide?: boolean;
  };
}

export interface NWCTXTInstrument {
  name: "Instrument";
  fields: {
    /**
     * @example "[#001]"
     * @example "[#017]"
     */
    Name?: string;
    /**
     * @example 0
     * @example 16
     */
    Patch?: number;
    /**
     * @example 0
     */
    Trans?: number;
    /**
     * @example [10,30,45,60,75,92,108,127]
     */
    DynVel?: number[];
    /**
     * @example 8
     */
    Pos?: number;
    /**
     * @example true
     */
    Wide?: boolean;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
  };
}

export interface NWCTXTRestChord {
  name: "RestChord";
  fields: {
    Dur: NWCTXTDuration;
    Opts?: NWCTXTOpts;
    Dur2: NWCTXTDuration;
    Pos2: NWCTXTPosition[];
  };
}

export interface NWCTXTPerformanceStyle {
  name: "PerformanceStyle";
  fields: {
    /**
     * @example "Maestoso"
     * @example "Legato"
     */
    Style?: string;
    /**
     * @example 13
     */
    Pos?: number;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
  };
}

export interface NWCTXTDynamic {
  name: "Dynamic";
  fields: {
    Style: "ppp" | "pp" | "p" | "mp" | "mf" | "f" | "ff" | "fff";
    /**
     * @example 7
     * @example -1
     * @example 0
     */
    Pos?: number;
    /**
     * @example "AsStaffSignature"
     */
    Placement?: string;
    /**
     * @example true
     */
    Wide?: boolean;
  };
}

export type NWCTXTMusicItem =
  | NWCTXTBar
  | NWCTXTChord
  | NWCTXTClef
  | NWCTXTDynamic
  | NWCTXTEnding
  | NWCTXTFlow
  | NWCTXTInstrument
  | NWCTXTKey
  | NWCTXTMPC
  | NWCTXTNote
  | NWCTXTPerformanceStyle
  | NWCTXTRest
  | NWCTXTRestChord
  | NWCTXTSustainPedal
  | NWCTXTTempo
  | NWCTXTTempoVariance
  | NWCTXTText
  | NWCTXTTimeSig
  | NWCTXTUser;

export interface NWCTXTStaff {
  properties: {
    AddStaff?: {
      /**
       * @default "Standard"
       */
      Group?: string;

      /**
       * @default "Staff"
       * @example "Piano"
       */
      Name?: string;
      /**
       * @example "Soprano"
       * @example "Piano"
       */
      Label?: string;
    };

    Lyrics?: {
      /**
       * @example "Start of Accidental/Note"
       * @example "Standard Rules"
       */
      Align?: string;

      /**
       * @example 0
       */
      Offset?: number;

      /**
       * @example "Bottom"
       * @example "Top"
       */
      Placement?: string;
    };

    StaffInstrument?: {
      /**
       * @default [10,30,45,60,75,92,108,127]
       */
      DynVel?: number[];

      /**
       * @default 0
       */
      Trans?: number;

      /**
       * @example 0
       */
      Patch?: number;
    };

    StaffProperties?: {
      /**
       * @default 12
       */
      BoundaryBottom?: number;

      /**
       * @default 12
       */
      BoundaryTop?: number;

      /**
       * @default 1
       */
      Channel?: number;

      /**
       * @default "Default"
       */
      Color?: string;

      /**
       * @default 0
       */
      Device?: number;

      /**
       * @default "Section Close"
       */
      EndingBar?: string;

      /**
       * @default 5
       */
      Lines?: number;

      /**
       * @default false
       */
      Muted?: boolean;

      /**
       * @default 64
       */
      StereoPan?: number;

      /**
       * @default true
       */
      Visible?: boolean;

      /**
       * @default number
       */
      Volume?: number;

      WithNextStaff?: {
        Brace?: boolean;
        Bracket?: boolean;
        ConnectBars?: boolean;
      };
    };
  };
  music: NWCTXTMusicItem[];
  lyrics: NWCTXTLyrics[];
}

export interface NWCTXTFontConfig {
  Bold: boolean;

  /**
   * @example 0
   */
  CharSet: number;

  Italic: boolean;

  /**
   * @example 10
   */
  Size: number;

  /**
   * @example "Times New Roman"
   * @example "Verdana"
   */
  Typeface: string;
}

export interface NWCTXTFile extends Pick<LowLevelNWCTXTFile, "version" | "clip" | "extra"> {
  fonts: Partial<
    Record<
      | "PageSmallText"
      | "PageText"
      | "PageTitleText"
      | "StaffBold"
      | "StaffItalic"
      | "StaffLyric"
      | "User1"
      | "User2"
      | "User3"
      | "User4"
      | "User5"
      | "User6",
      NWCTXTFontConfig
    >
  >;
  properties: {
    Editor?: {
      /**
       * @default 1
       */
      ActiveStaff?: number;
      /**
       * @default 1
       */
      CaretIndex?: number;
      /**
       * @default 0
       */
      CaretPos?: number;
    };
    PgMargins?: {
      /**
       * @default 1.27
       */
      Bottom?: number;
      /**
       * @default 1.27
       */
      Left?: number;
      /**
       * @default false
       */
      Mirror?: boolean;
      /**
       * @default 1.27
       */
      Right?: number;
      /**
       * @default 1.27
       */
      Top?: number;
    };
    PgSetup?: {
      AllowLayering?: boolean;
      /**
       * @default "None"
       */
      BarNumbers?: string;
      /**
       * @default false
       */
      DurationPadding?: boolean;
      /**
       * @default false
       */
      ExtendLastSystem?: boolean;
      /**
       * @default true
       */
      JustifyVertically?: boolean;
      /**
       * @default 0
       */
      PageNumbers?: number;
      /**
       * @default false
       */
      PrintSystemSepMark?: boolean;
      /**
       * @default "None"
       */
      StaffLabels?: string;
      /**
       * @default 16
       */
      StaffSize?: number;
      /**
       * @default 1
       */
      StartingBar?: number;
      /**
       * @default true
       */
      TitlePage?: boolean;
      /**
       * @default 4
       */
      Zoom?: number;
    };
    SongInfo?: {
      Author?: string;
      Comments?: string;
      Copyright1?: string;
      Copyright2?: string;
      Lyricist?: string;
      Title?: string;
    };
  };
  staffs: NWCTXTStaff[];
}
